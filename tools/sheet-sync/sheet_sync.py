#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""แปลง Google Sheet "SpinePeak - รายชื่อคอร์สทั้งหมด" เป็นไฟล์ JSON ใน content/

วิธีใช้
    python3 tools/sheet-sync/sheet_sync.py            # อ่าน raw/*.csv เขียน content/*.json
    python3 tools/sheet-sync/sheet_sync.py --check    # ตรวจเท่านั้น ไม่เขียนไฟล์

วิธีอัปเดตข้อมูลจากชีต
    เปิดชีต > ไฟล์ > ดาวน์โหลด > CSV (แท็บละครั้ง) แล้ววางทับ
    raw/courses.csv (แท็บ "คอร์สทั้งหมด") และ raw/sets.csv (แท็บ "SET")
    แล้วรันสคริปต์นี้ใหม่ ไฟล์ใน content/ จะถูกเขียนทับทั้งหมด

สคริปต์จะ exit ด้วยรหัส 1 ถ้าเจอข้อผิดพลาดที่ต้องแก้ในชีตก่อน build
"""
import csv
import io
import json
import os
import re
import sys
from collections import Counter, OrderedDict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
RAW = os.path.join(ROOT, "raw")
OUT = os.path.join(ROOT, "content")

GROUPS = {"ประถม": "prathom", "ม.ต้น": "mton", "ม.ปลาย": "mplai"}
SUBJECTS = {
    "วิทยาศาสตร์": "science",
    "ชีววิทยา": "biology",
    "เคมี": "chemistry",
    "ฟิสิกส์": "physics",
    "คณิตศาสตร์": "math",
    "วิทยาศาสตร์ประยุกต์": "applied_science",
}
SALE_MODES = {
    "ขายเดี่ยว + อยู่ใน SET": "standalone_and_set",
    "ขายเดี่ยวเท่านั้น": "standalone_only",
}
STATUSES = {"เปิดขาย": "open", "เร็ว ๆ นี้": "coming_soon", "เร็วๆ นี้": "coming_soon"}
INSTRUCTORS = {"ครูพี่หนาม": "kru-nam", "ครูพี่ฝน": "kru-fon", "ครูพี่ลูกไม้": "kru-lookmai"}
DEFAULT_INSTRUCTOR = "kru-nam"  # เจ้าของยืนยัน: แถวที่เว้นว่างคือครูพี่หนาม

SLUG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")
BULLET = "•"

errors = []
warnings = []


def err(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def clean(v):
    return ("" if v is None else str(v)).replace(" ", " ").strip()


def as_int(v):
    """'888.0' -> 888 · '1,797' -> 1797 · '' -> None"""
    s = clean(v).replace(",", "")
    if not s:
        return None
    try:
        f = float(s)
    except ValueError:
        return None
    return int(round(f))


def as_pages(v):
    """คอลัมน์ไฟล์ PDF รับได้ทั้งตัวเลขเดียวและช่วง เช่น '30-70'"""
    s = clean(v).replace(",", "")
    if not s:
        return None
    m = re.match(r"^(\d+)\s*-\s*(\d+)$", s)
    if m:
        lo, hi = int(m.group(1)), int(m.group(2))
        if lo > hi:
            lo, hi = hi, lo
        return {"min": lo, "max": hi}
    return as_int(s)


def split_bullets(v):
    s = clean(v)
    if not s:
        return []
    parts = [p.strip(" -–") for p in s.split(BULLET)]
    return [p for p in parts if p]


def read_csv(path):
    with io.open(path, encoding="utf-8-sig", newline="") as f:
        rows = [r for r in csv.reader(f) if any(clean(c) for c in r)]
    header = [clean(c) for c in rows[0]]
    out = []
    for r in rows[1:]:
        r = list(r) + [""] * (len(header) - len(r))
        out.append(dict(zip(header, [clean(c) for c in r])))
    return out


def lookup(row, col, label):
    if col not in row:
        err("ไม่พบคอลัมน์ '%s' ใน %s" % (col, label))
        return ""
    return row[col]


def split_content(detail):
    """แยกคอลัมน์ 'รายละเอียด / เนื้อหา' เป็น chapters กับ contentPoints

    แถวที่ขึ้นต้นด้วย 'เนื้อหา:' คือรายการบทเรียนจริง จึงกลายเป็น chapters
    ส่วนที่อยู่ในวงเล็บเป็นหมายเหตุของทั้งชุด ไม่ใช่บท จึงไปอยู่ contentPoints
    แถวอื่นเป็นจุดขาย ไม่ใช่บทเรียน จึงเป็น contentPoints ทั้งหมด
    """
    bullets = split_bullets(detail)
    if not bullets:
        return [], []
    if not bullets[0].startswith("เนื้อหา:"):
        return [], bullets
    bullets = list(bullets)
    bullets[0] = bullets[0][len("เนื้อหา:"):].strip()
    chapters, points = [], []
    for b in bullets:
        if not b:
            continue
        if b.startswith("(") or b.endswith(")"):
            points.append(b.strip("()").strip())
        else:
            chapters.append(b)
    return chapters, points


def build_courses():
    rows = read_csv(os.path.join(RAW, "courses.csv"))
    courses = []
    cover_refs = []
    skipped = []
    for row in rows:
        name = lookup(row, "ชื่อคอร์ส", "คอร์สทั้งหมด")
        if not name:
            continue
        slug = row.get("slug", "")
        where = "คอร์ส '%s'" % name

        if not slug:
            err("%s ยังไม่มี slug" % where)
        elif not SLUG_RE.match(slug):
            err("%s: slug '%s' ต้องเป็น a-z 0-9 คั่นด้วยขีดกลางเท่านั้น" % (where, slug))

        group_th = row.get("กลุ่ม", "")
        if group_th not in GROUPS:
            err("%s: กลุ่ม '%s' ไม่อยู่ในสามค่าที่รู้จัก" % (where, group_th))
        subject_th = row.get("วิชา", "")
        if subject_th not in SUBJECTS:
            err("%s: วิชา '%s' ยังไม่มีใน mapping — เพิ่มใน SUBJECTS ก่อน" % (where, subject_th))
        sale_th = row.get("การขาย", "")
        if sale_th not in SALE_MODES:
            err("%s: การขาย '%s' ไม่อยู่ในสองค่าที่รู้จัก" % (where, sale_th))
        status_th = row.get("สถานะ", "")
        if status_th not in STATUSES:
            err("%s: สถานะ '%s' ไม่อยู่ในค่าที่รู้จัก (เปิดขาย / เร็ว ๆ นี้)" % (where, status_th))
        elif STATUSES[status_th] != "open":
            # ยังไม่เปิดขาย = ไม่ขึ้นเว็บเลย ถ้ามี SET ที่ใส่คอร์สนี้ไว้ cross_check จะแจ้งให้แก้
            skipped.append(where)
            continue

        price = as_int(row.get("ราคา (บาท)"))
        if price is None or price <= 0:
            err("%s: ราคาไม่ถูกต้อง ('%s')" % (where, row.get("ราคา (บาท)")))

        tagline = row.get("tagline", "")
        if not tagline:
            err("%s ยังไม่มี tagline" % where)

        instructor_th = row.get("ผู้สอน", "")
        if instructor_th and instructor_th not in INSTRUCTORS:
            err("%s: ผู้สอน '%s' ยังไม่มีใน site.json" % (where, instructor_th))
        instructor = INSTRUCTORS.get(instructor_th, DEFAULT_INSTRUCTOR)

        category = row.get("หมวดหมู่", "")
        if not category:
            err("%s ยังไม่มีหมวดหมู่" % where)

        stats = OrderedDict()
        q = as_int(row.get("จำนวนข้อสอบ (ข้อ)"))
        p = as_pages(row.get("ไฟล์ PDF (หน้า)"))
        h = as_int(row.get("คลิปวิดีโอ (ชม.)"))
        if q is not None:
            stats["questionCount"] = q
        if p is not None:
            stats["pdfPages"] = p
        if h is not None:
            stats["videoHours"] = h
        if not stats:
            warn("%s ไม่มีตัวเลขสักตัว (ข้อสอบ/หน้า/ชั่วโมง) แถบตัวเลขบนหน้า detail จะหายไปทั้งแถบ" % where)

        chapters, content_points = split_content(row.get("รายละเอียด / เนื้อหา"))

        set_codes = [c for c in re.split(r"[,\n]+", row.get("อยู่ใน SET", "")) if c.strip()]
        set_codes = [c.strip() for c in set_codes]
        if len(set_codes) != len(set(set_codes)):
            err("%s ระบุรหัส SET ซ้ำ" % where)

        sale_mode = SALE_MODES.get(sale_th)
        if sale_mode == "standalone_only" and set_codes:
            err("%s เขียน 'ขายเดี่ยวเท่านั้น' แต่มีรหัส SET %s" % (where, set_codes))
        if sale_mode == "standalone_and_set" and not set_codes:
            err("%s เขียน 'อยู่ใน SET' แต่ไม่ได้ระบุรหัส" % where)

        cover = row.get("รูปอ้างอิง", "")
        if cover:
            cover_refs.append((slug, cover))

        course = OrderedDict()
        course["slug"] = slug
        course["title"] = name
        course["tagline"] = tagline
        course["group"] = GROUPS.get(group_th)
        course["category"] = category
        course["subject"] = SUBJECTS.get(subject_th)
        course["instructorSlug"] = instructor
        course["price"] = price
        course["saleMode"] = sale_mode
        course["stats"] = stats
        course["chapters"] = [{"title": t} for t in chapters]
        course["forWho"] = split_bullets(row.get("เหมาะสำหรับ"))
        course["contentPoints"] = content_points
        course["deliverables"] = row.get("สิ่งที่ได้รับ", "")
        course["setCodes"] = set_codes
        # คลิปตัวอย่าง (ลิงก์ YouTube) · เว้นว่าง = หน้าคอร์สซ่อนกล่องคลิป
        clip = row.get("คลิปตัวอย่าง", "").strip()
        if clip:
            if not clip.startswith("https://"):
                err("%s: คลิปตัวอย่าง '%s' ต้องเป็นลิงก์ https" % (where, clip))
            course["previewVideoUrl"] = clip
        courses.append(course)
    if skipped:
        warn("ข้าม %d คอร์สที่สถานะไม่ใช่ 'เปิดขาย' (ไม่ขึ้นเว็บ): %s" % (len(skipped), ", ".join(skipped)))
    return courses, cover_refs



def resolve_members(row, where, courses, by_name):
    """หาคอร์สสมาชิกของเซ็ต

    คอลัมน์ 'slug คอร์สที่รวม' (คั่นด้วยจุลภาค) เป็นตัวจริงที่ใช้เชื่อม เพราะ slug ไม่เปลี่ยน
    คอลัมน์ 'คอร์สที่รวม' ที่เป็นชื่อไทย (คั่นด้วยบรรทัดใหม่) เก็บไว้ให้คนอ่าน และใช้เป็นการตรวจซ้ำ
    ถ้าสองคอลัมน์ไม่ตรงกัน แปลว่าแก้ไปแค่ฝั่งเดียว ต้องหยุดให้แก้ก่อน
    """
    by_slug = {c["slug"]: c for c in courses}
    raw_slugs = [x.strip() for x in re.split(r"[,\n]+", row.get("slug คอร์สที่รวม", "")) if x.strip()]
    names = [n.strip() for n in re.split(r"\n+", row.get("คอร์สที่รวม", "")) if n.strip()]

    slugs = []
    for sl in raw_slugs:
        if sl not in by_slug:
            err("%s อ้าง slug คอร์สที่ไม่มีในแท็บคอร์ส: '%s'" % (where, sl))
            continue
        slugs.append(sl)

    from_names = []
    for n in names:
        c = by_name.get(n)
        if c is None:
            err("%s อ้างชื่อคอร์สที่ไม่มีในแท็บคอร์ส: '%s'" % (where, n))
            continue
        from_names.append(c["slug"])

    if raw_slugs and names and slugs != from_names:
        only_slug = [x for x in slugs if x not in from_names]
        only_name = [x for x in from_names if x not in slugs]
        if only_slug or only_name:
            err("%s: คอลัมน์ slug กับคอลัมน์ชื่อไทยไม่ตรงกัน (มีแต่ในคอลัมน์ slug: %s · มีแต่ในคอลัมน์ชื่อ: %s)"
                % (where, only_slug or "ไม่มี", only_name or "ไม่มี"))
        else:
            warn("%s: คอลัมน์ slug กับคอลัมน์ชื่อไทยเรียงลำดับไม่เหมือนกัน เว็บจะใช้ลำดับของคอลัมน์ slug" % where)

    if not raw_slugs:
        if names:
            warn("%s ไม่มีคอลัมน์ slug คอร์สที่รวม ใช้ชื่อไทยเชื่อมแทน" % where)
        return from_names, names
    return slugs, names


def build_sets(courses):
    rows = read_csv(os.path.join(RAW, "sets.csv"))
    by_name = {c["title"]: c for c in courses}
    sets = []
    for row in rows:
        code = lookup(row, "รหัส", "SET")
        if not code:
            continue
        where = "SET %s" % code
        slug = row.get("slug", "")
        if not slug:
            err("%s ยังไม่มี slug" % where)
        elif not SLUG_RE.match(slug):
            err("%s: slug '%s' ต้องเป็น a-z 0-9 คั่นด้วยขีดกลางเท่านั้น" % (where, slug))

        group_th = row.get("กลุ่ม", "")
        if group_th not in GROUPS:
            err("%s: กลุ่ม '%s' ไม่อยู่ในสามค่าที่รู้จัก" % (where, group_th))
        status_th = row.get("สถานะ", "")
        if status_th not in STATUSES:
            err("%s: สถานะ '%s' ไม่อยู่ในค่าที่รู้จัก" % (where, status_th))
        elif STATUSES[status_th] != "open":
            # ยังไม่เปิดขาย = ไม่ขึ้นเว็บ · คอร์สที่ยังเขียนรหัส SET นี้ไว้ cross_check จะแจ้งให้ลบออก
            warn("ข้าม %s: สถานะไม่ใช่ 'เปิดขาย' (ไม่ขึ้นเว็บ)" % where)
            continue
        tagline = row.get("tagline", "")
        if not tagline:
            err("%s ยังไม่มี tagline" % where)

        slugs, names = resolve_members(row, where, courses, by_name)
        if len(slugs) != len(set(slugs)):
            err("%s มีคอร์สซ้ำในรายการ" % where)
        if not slugs:
            err("%s ไม่มีคอร์สสมาชิกเลย" % where)

        stated_count = as_int(row.get("จำนวนคอร์ส"))
        if stated_count is not None and stated_count != len(slugs):
            err("%s: คอลัมน์จำนวนคอร์สบอก %d แต่รายการมี %d" % (where, stated_count, len(slugs)))

        price = as_int(row.get("ราคา SET (บาท)"))
        if price is None or price <= 0:
            err("%s: ราคา SET ไม่ถูกต้อง ('%s')" % (where, row.get("ราคา SET (บาท)")))

        # ราคาปกติในชีตเป็นแค่ตัวเลขให้คนอ่าน ของจริงคำนวณตอน build
        calc = sum(by_name[n]["price"] for n in names if n in by_name and by_name[n]["price"])
        stated_normal = as_int(row.get("ราคาปกติ (บาท)"))
        if stated_normal is not None and calc and stated_normal != calc:
            warn("%s: ราคาปกติในชีต %s แต่ผลรวมราคาคอร์สสมาชิกได้ %s — เว็บจะใช้ %s"
                 % (where, stated_normal, calc, calc))
        if price and calc and price >= calc:
            err("%s: ราคา SET (%s) ไม่ถูกกว่าผลรวมราคาคอร์สเดี่ยว (%s)" % (where, price, calc))

        s = OrderedDict()
        s["code"] = code
        s["slug"] = slug
        s["title"] = row.get("ชื่อ SET", "")
        s["tagline"] = tagline
        s["group"] = GROUPS.get(group_th)
        s["price"] = price
        s["courseSlugs"] = slugs
        sets.append(s)
    return sets


def cross_check(courses, sets):
    # slug ต้องไม่ซ้ำ ทั้งในตัวเองและข้ามสองตาราง
    for label, items in (("คอร์ส", courses), ("SET", sets)):
        dupes = [s for s, n in Counter(i["slug"] for i in items).items() if n > 1 and s]
        if dupes:
            err("slug %s ซ้ำ: %s" % (label, ", ".join(sorted(dupes))))
    # เทียบข้ามตารางด้วยเซ็ต ไม่ใช่การนับ ไม่งั้น slug ที่ซ้ำอยู่ในตารางเดียวจะถูกรายงานผิดว่าชนข้ามตาราง
    clash = {c["slug"] for c in courses if c["slug"]} & {s["slug"] for s in sets if s["slug"]}
    if clash:
        err("slug ชนกันระหว่างคอร์สกับ SET: %s" % ", ".join(sorted(clash)))

    dupe_names = [t for t, n in Counter(c["title"] for c in courses).items() if n > 1]
    if dupe_names:
        err("ชื่อคอร์สซ้ำ ทำให้เชื่อมกับแท็บ SET ไม่ได้: %s" % ", ".join(dupe_names))

    # ความเป็นสมาชิกต้องตรงกันทั้งสองทาง
    codes = {s["code"] for s in sets}
    from_sets = {}
    for s in sets:
        for cs in s["courseSlugs"]:
            from_sets.setdefault(cs, set()).add(s["code"])
    for c in courses:
        declared = set(c["setCodes"])
        unknown = declared - codes
        if unknown:
            err("คอร์ส '%s' อ้างรหัส SET ที่ไม่มีในแท็บ SET: %s" % (c["title"], sorted(unknown)))
        actual = from_sets.get(c["slug"], set())
        missing = (declared & codes) - actual
        extra = actual - declared
        if missing:
            err("คอร์ส '%s' บอกว่าอยู่ใน %s แต่ SET นั้นไม่ได้ใส่คอร์สนี้" % (c["title"], sorted(missing)))
        if extra:
            err("คอร์ส '%s' ถูกใส่ใน %s แต่คอลัมน์ 'อยู่ใน SET' ไม่ได้เขียนไว้" % (c["title"], sorted(extra)))

    # คอร์สแนวตะลุยโจทย์ไม่มีรายการบทอยู่แล้ว ไม่ใช่ข้อมูลขาด จึงรวบเป็นบรรทัดเดียว
    no_chapters = [c["title"] for c in courses if not c["chapters"]]
    if no_chapters:
        warn("%d คอร์สไม่มีรายการบท บล็อกเนื้อหาในหน้า detail จะถูกซ่อน: %s"
             % (len(no_chapters), ", ".join(no_chapters[:4])
                + (" และอีก %d คอร์ส" % (len(no_chapters) - 4) if len(no_chapters) > 4 else "")))


def check_site(courses):
    """ตรวจ site.json ที่เขียนด้วยมือ ว่ายังตรงกับข้อมูลจริงในชีตอยู่"""
    path = os.path.join(OUT, "site.json")
    if not os.path.exists(path):
        err("ยังไม่มี content/site.json — หน้าเว็บขึ้นไม่ได้ถ้าไม่มีไฟล์นี้")
        return None
    with io.open(path, encoding="utf-8") as f:
        site = json.load(f)

    known = {i.get("slug") for i in site.get("instructors", [])}
    used = {c["instructorSlug"] for c in courses}
    for missing in sorted(used - known):
        err("site.json ไม่มีผู้สอน '%s' ที่คอร์สอ้างถึง" % missing)
    for unused in sorted(known - used):
        warn("site.json มีผู้สอน '%s' ที่ไม่มีคอร์สไหนใช้" % unused)

    groups = {g.get("key") for g in site.get("groups", [])}
    for g in sorted({c["group"] for c in courses} - groups):
        err("site.json ไม่มีกลุ่ม '%s'" % g)

    categories = {c["category"] for c in courses}
    for card in site.get("goalCards", []):
        f_ = card.get("filter", {})
        if f_.get("group") and f_["group"] not in groups:
            err("goalCard '%s' กรองกลุ่ม '%s' ที่ไม่มีใน site.json" % (card.get("title"), f_["group"]))
        if f_.get("category") and f_["category"] not in categories:
            err("goalCard '%s' กรองหมวดหมู่ '%s' ที่ไม่มีคอร์สไหนอยู่เลย"
                % (card.get("title"), f_["category"]))

    # ปุ่มสมัครเรียนทั้งเว็บวิ่งผ่านช่องทางพวกนี้ ถ้าว่างคือปุ่มไม่มีที่ไป
    contact = site.get("contact", {})
    line_id = contact.get("line", {}).get("basicId", "")
    fb_page = contact.get("facebook", {}).get("pageId", "")
    if not line_id and not fb_page:
        err("site.json ไม่มีทั้ง LINE OA และเพจ Facebook ปุ่มสมัครเรียนจะไม่มีที่ไป")
    if line_id and not line_id.startswith("@"):
        err("site.json: LINE basicId '%s' ต้องขึ้นต้นด้วย @" % line_id)
    if "{itemTitle}" not in contact.get("line", {}).get("prefillTemplate", ""):
        warn("site.json: prefillTemplate ไม่มี {itemTitle} ข้อความตั้งต้นจะไม่บอกว่าลูกค้าสนใจคอร์สไหน")
    for key in ("facebook", "instagram", "tiktok"):
        url = contact.get(key, {}).get("url", "")
        if url and not url.startswith("https://"):
            err("site.json: contact.%s.url ต้องเป็น https" % key)
    if not contact.get("hours"):
        warn("site.json ยังไม่มีเวลาทำการของแอดมิน หน้าเว็บจะซ่อนบรรทัดนั้น")

    badge = site.get("config", {}).get("savingsBadge", {})
    return badge.get("minBaht", 100), badge.get("minPercent", 10)


def derived_report(courses, sets, min_baht=100, min_percent=10):
    """คำนวณค่าที่เว็บจะคำนวณตอน build แล้วพิมพ์ให้ตรวจตาด้วยคน

    ค่าพวกนี้ไม่ได้เก็บในไฟล์ JSON โดยเจตนา เพราะมันหาได้จากราคาคอร์สสมาชิก
    ถ้าเก็บไว้แล้วราคาคอร์สเปลี่ยน ตัวเลขส่วนลดจะเพี้ยนเงียบ ๆ
    """
    price = {c["slug"]: c["price"] for c in courses}
    print("\nจำนวนต่อกลุ่ม")
    for key, th in (("prathom", "ประถม"), ("mton", "ม.ต้น"), ("mplai", "ม.ปลาย")):
        print("  %-8s คอร์ส %2d · SET %2d"
              % (th, sum(1 for c in courses if c["group"] == key),
                 sum(1 for s in sets if s["group"] == key)))

    hidden = []
    print("\nส่วนลดของแต่ละ SET (คำนวณสด ไม่ได้อ่านจากชีต)")
    for s in sets:
        normal = sum(price[cs] for cs in s["courseSlugs"])
        savings = normal - s["price"]
        pct = savings * 100.0 / normal if normal else 0
        show = savings >= min_baht or pct >= min_percent
        if not show:
            hidden.append(s["code"])
        print("  %-8s %5d -> %5d  ประหยัด %5d (%2.0f%%)  ป้าย %s"
              % (s["code"], normal, s["price"], savings, pct, "โชว์" if show else "ซ่อน"))
    if hidden:
        print("  ซ่อนป้ายประหยัด %d SET (ต่ำกว่า %d บาท และต่ำกว่า %d%%): %s"
              % (len(hidden), min_baht, min_percent, ", ".join(hidden)))

    in_sets = {}
    for s in sets:
        for cs in s["courseSlugs"]:
            in_sets.setdefault(cs, []).append(s["code"])
    top = sorted(courses, key=lambda c: -len(in_sets.get(c["slug"], [])))[:5]
    print("\nคอร์สที่อยู่ใน SET มากที่สุด (ใช้ทำกล่องขายต่อในหน้า detail)")
    for c in top:
        print("  %-34s %d SET" % (c["title"], len(in_sets.get(c["slug"], []))))

    # ตัวเลือกใน dropdown ตัวกรอง คำนวณจากหมวดหมู่จริง ไม่ได้พิมพ์ไว้ใน site.json
    # ถ้าพิมพ์ไว้ วันที่เพิ่มคอร์สหมวดใหม่แล้วลืมแก้ ตัวกรองจะหาคอร์สนั้นไม่เจอ
    print("\nตัวเลือกตัวกรองต่อกลุ่ม (trackLabelsByGroup คำนวณตอน build)")
    for key, th in (("prathom", "ประถม"), ("mton", "ม.ต้น"), ("mplai", "ม.ปลาย")):
        seen = []
        for c in courses:
            if c["group"] == key and c["category"] not in seen:
                seen.append(c["category"])
        print("  %-8s %s" % (th, " · ".join(seen)))


def write_json(name, data):
    path = os.path.join(OUT, name)
    with io.open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        f.write("\n")
    return path


def main():
    check_only = "--check" in sys.argv
    courses, cover_refs = build_courses()
    sets = build_sets(courses)
    cross_check(courses, sets)
    badge = check_site(courses)

    print("อ่านได้ %d คอร์ส %d SET" % (len(courses), len(sets)))
    for m in warnings:
        print("  WARN " + m)
    for m in errors:
        print("  ERROR " + m)

    if errors:
        print("\nมี %d ข้อผิดพลาด ไม่เขียนไฟล์ แก้ในชีตแล้วรันใหม่" % len(errors))
        return 1

    if check_only:
        print("\n--check: ผ่านทั้งหมด ไม่เขียนไฟล์")
        return 0

    if not os.path.isdir(OUT):
        os.makedirs(OUT)
    print("")
    for name, data in (("courses.json", courses), ("sets.json", sets)):
        print("  เขียน " + write_json(name, data))
    for name in ("reviews.json", "clips.json"):
        path = os.path.join(OUT, name)
        if not os.path.exists(path):
            write_json(name, [])
            print("  สร้าง %s (ว่าง — แก้ด้วยมือ ไม่ได้มาจากชีต)" % path)
        else:
            print("  ข้าม %s (แก้ด้วยมือ ไม่ได้มาจากชีต)" % path)
    site = os.path.join(OUT, "site.json")
    print("  ข้าม %s (แก้ด้วยมือ ไม่ได้มาจากชีต)" % site if os.path.exists(site)
          else "  ยังไม่มี %s — ต้องเขียนด้วยมือ" % site)

    need = os.path.join(OUT, "cover-images-needed.txt")
    with io.open(need, "w", encoding="utf-8") as f:
        f.write("# ชื่อไฟล์รูปจากคอลัมน์ 'รูปอ้างอิง' ในชีต ยังไม่มีไฟล์จริง\n")
        f.write("# วางไฟล์ใน public/courses/<slug>.jpg แล้วเติม coverImage ในสคริปต์\n")
        for slug, ref in cover_refs:
            f.write("%s\t%s\n" % (slug, ref))
    print("  เขียน %s (%d รูป)" % (need, len(cover_refs)))

    derived_report(courses, sets, *(badge or (100, 10)))

    if warnings:
        print("\nผ่าน แต่มี %d คำเตือน" % len(warnings))
    else:
        print("\nผ่านหมด ไม่มีคำเตือน")
    return 0


if __name__ == "__main__":
    sys.exit(main())
