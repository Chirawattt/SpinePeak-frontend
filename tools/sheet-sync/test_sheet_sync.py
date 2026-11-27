# -*- coding: utf-8 -*-
# รัน: python -m unittest discover -s tools/sheet-sync
import io
import os
import tempfile
import unittest
from unittest import mock

import sheet_sync as s


def promo_row(**values):
    row = dict.fromkeys(s.PROMO_COLUMNS, "")
    row.update({"ชนิด": "ตลอดปี", "ชื่อโปร": "ชวนเพื่อน", "ตัวเลขใหญ่": "100.-", "สถานะ": "แสดง"})
    row.update(values)
    return row


def review_row(**values):
    row = {"slug": "a", "รูปปก": link("cover00000"), "รูปรีวิว": link("one0000000") + "\n" + link("two0000000"), "สถานะ": "แสดง"}
    row.update(values)
    return row


def link(file_id):
    return "https://drive.google.com/file/d/%s/view?usp=sharing" % file_id


def image(url, folder, where):
    return "/%s/%s.png" % (folder, s.drive_id(url))


class SheetSyncTest(unittest.TestCase):
    def setUp(self):
        del s.errors[:]

    def test_promos_by_kind_in_row_order(self):
        promos = s.build_promos([
            promo_row(**{"ชนิด": "ตามฤดู", "ชื่อโปร": "เปิดเทอม", "หัวการ์ด": "เปิดเทอม\nลด 15%",
                         "วันหมดเขต": "31/5/2570", "รูปแนวนอน": link("wide000000")}),
            promo_row(**{"ชนิด": "ประหยัด SET", "ชื่อโปร": "ซื้อเป็น SET"}),
            promo_row(),
            promo_row(**{"สถานะ": "ซ่อน", "ตัวเลขใหญ่": ""}),
        ], image)

        self.assertEqual(s.errors, [])
        self.assertEqual(promos["seasonal"], [{
            "name": "เปิดเทอม", "headline": ["เปิดเทอม", "ลด 15%"], "detail": "",
            "endsAt": "2027-05-31T23:59:59+07:00", "image": "/promos/wide000000.png"}])
        self.assertEqual(promos["evergreen"], [
            {"kind": "set-savings", "name": "ซื้อเป็น SET", "desc": ""},
            {"kind": "contact", "name": "ชวนเพื่อน", "value": "100.-", "desc": ""}])

    def test_bad_promo_rows_are_reported(self):
        for bad in (
            {"ชนิด": "อื่น"},
            {"ชื่อโปร": ""},
            {"ตัวเลขใหญ่": ""},
            {"สถานะ": ""},
            {"ชนิด": "ตามฤดู", "วันหมดเขต": "31/2/2570"},
            {"รูปมือถือ": link("tall000000")},
        ):
            del s.errors[:]
            s.build_promos([promo_row(**bad)], image)
            self.assertEqual(len(s.errors), 1, bad)

    def test_dates(self):
        self.assertEqual(s.ends_at("2026-12-31"), "2026-12-31T23:59:59+07:00")
        self.assertEqual(s.ends_at("1/2/2026"), "2026-02-01T23:59:59+07:00")
        self.assertIsNone(s.ends_at("31 ธ.ค."))

    def test_review_card_has_its_own_cover_and_sub_images(self):
        cards = s.build_review_images([review_row(), review_row(**{"slug": "b", "สถานะ": "ซ่อน"})], {"a", "b"}, image)

        self.assertEqual(s.errors, [])
        self.assertEqual(cards, [{"slug": "a", "cover": "/reviews/cover00000.png",
                                  "images": ["/reviews/one0000000.png", "/reviews/two0000000.png"]}])

    def test_bad_review_rows_are_reported(self):
        for rows in (
            [review_row(slug="nope")],
            [review_row(**{"รูปปก": ""})],
            [review_row(**{"รูปรีวิว": ""})],
            [review_row(), review_row()],
        ):
            del s.errors[:]
            s.build_review_images(rows, {"a"}, image)
            self.assertEqual(len(s.errors), 1, rows)

    def test_drive_links(self):
        for url in (link("abc_DEF-123"), "https://drive.google.com/open?id=abc_DEF-123",
                    "https://drive.google.com/uc?export=view&id=abc_DEF-123"):
            self.assertEqual(s.drive_id(url), "abc_DEF-123")
        for url in ("https://example.com/file/d/abc_DEF-123", "https://drive.google.com/drive/folders/abc_DEF-123", "a.png"):
            self.assertIsNone(s.drive_id(url))

    def test_download_saves_by_drive_id_once_and_rejects_non_images(self):
        png = b"\x89PNG\r\n\x1a\nxxxx"
        with tempfile.TemporaryDirectory() as tmp, mock.patch.object(s, "PUBLIC", tmp):
            with mock.patch("urllib.request.urlopen", side_effect=lambda *a, **k: io.BytesIO(png)) as fetch:
                for _ in range(2):
                    self.assertEqual(s.download_image(link("abc0000000"), "reviews", "x"), "/reviews/abc0000000.png")
            self.assertEqual(fetch.call_count, 1)
            with mock.patch("urllib.request.urlopen", return_value=io.BytesIO(b"<html>sign in")):
                self.assertIsNone(s.download_image(link("private000"), "reviews", "x"))
            self.assertEqual(os.listdir(os.path.join(tmp, "reviews")), ["abc0000000.png"])
        self.assertEqual(len(s.errors), 1)

    def test_only_real_images_are_accepted(self):
        self.assertEqual(s.image_ext(b"\x89PNG\r\n\x1a\n...."), ".png")
        self.assertEqual(s.image_ext(b"\xff\xd8\xff\xe0...."), ".jpg")
        self.assertEqual(s.image_ext(b"RIFF0000WEBPVP8 "), ".webp")
        self.assertIsNone(s.image_ext(b"<!DOCTYPE html>"))


if __name__ == "__main__":
    unittest.main()
