# SpinePeak — ชุดไฟล์ส่งมอบ (เฟส 1)

อัปเดต 27 ก.ย. 2569 · ชุดนี้คือทุกอย่างที่ต้องมีก่อนเริ่มเขียนหน้า Landing
ยังไม่มีโค้ดหน้าเว็บในชุดนี้ — เจ้าของเขียนเองใน local

---

## 1. เอาไฟล์ไปวางที่ไหนใน repo

> **แก้ 28 ก.ย. 2569:** เปลี่ยนเป็นแยก repo frontend / backend (ดู `requirement.md` ข้อ 10)
> ทุกอย่างในชุดนี้ไปอยู่ใน repo **frontend** (`SpinPeak-frontend`) ซึ่งเป็น Next.js (App Router, TypeScript) ที่ราก repo เลย ไม่มี `apps/web`

```
SpinPeak-frontend/
├── content/                     ← จากโฟลเดอร์ content/ ในชุดนี้
│   ├── courses.json
│   ├── sets.json
│   ├── site.json
│   ├── reviews.json
│   ├── clips.json
│   └── types.ts
├── raw/                         ← จากโฟลเดอร์ raw/ (ไฟล์ export จาก Google Sheet)
│   ├── courses.csv
│   ├── sets.csv
│   └── legend.csv
├── tools/sheet-sync/
│   └── sheet_sync.py            ← สคริปต์แปลง CSV → JSON
├── docs/                        ← จากโฟลเดอร์ docs/ (เอกสารอ่าน ไม่ใช่โค้ด)
│   ├── requirement.md
│   ├── data-schema.md
│   ├── content.md
│   ├── design-landing.dc.html
│   ├── design-courses.dc.html
│   ├── design-course-detail.dc.html
│   ├── design-sets.dc.html
│   ├── design-set-detail.dc.html
│   ├── support.js
│   └── spine-sets.js
└── public/
    ├── spine-peak-logo.png      ← จาก assets/
    ├── kru-nam-hero.png         ← จาก assets/
    └── kru-nam-full.png         ← จาก assets/
```

`content/` แยกโฟลเดอร์ไว้ที่ราก repo ไม่ปนกับโค้ดหน้าเว็บ เพราะเป็นข้อมูลที่สคริปต์สร้าง และเฟส 2 ฝั่ง Go อาจต้องใช้ (วิธีส่งข้ามไป repo backend ยังไม่ตัดสิน ดู `requirement.md` ข้อ 10)
ให้ `tsconfig.json` ตั้ง path alias ไว้ เช่น

```json
{ "compilerOptions": { "paths": { "@content/*": ["./content/*"] } } }
```

แล้ว import แบบ `import courses from '@content/courses.json'`

ส่วน `assets/` ที่ให้มามีแค่ 3 รูป คือ logo กับรูปครูพี่หนาม 2 ท่า (ท่าถือแท็บเล็ตสำหรับ hero กลม ๆ, ท่าถือหนังสือสำหรับ section แนะนำครู) รูปปกคอร์ส 44 รูปยังไม่มี ดูข้อ 5

---

## 2. ไฟล์ .json — ข้อมูลจริงของเว็บ

| ไฟล์ | มีอะไร | แก้ที่ไหน |
|---|---|---|
| `courses.json` | คอร์ส 44 ตัว | **ห้ามแก้มือ** — สร้างจาก sheet |
| `sets.json` | SET 27 ชุด | **ห้ามแก้มือ** — สร้างจาก sheet |
| `site.json` | ข้อความบนเว็บ ครูผู้สอน ช่องทางติดต่อ FAQ config | แก้มือได้ |
| `reviews.json` | `[]` — ยังไม่มีรีวิวจริง | แก้มือ (ดูข้อ 5) |
| `clips.json` | `[]` — ยังไม่มีคลิปตัวอย่าง | แก้มือ (ดูข้อ 5) |

### courses.json — หนึ่งคอร์สหน้าตาแบบนี้

```json
{
  "slug": "primary-science-p4",
  "title": "เนื้อหาประถม ป.4",
  "tagline": "ปูพื้นวิทย์ ป.4 ครบทุกบท เรียนเข้าใจง่าย เพิ่มเกรดในห้อง",
  "group": "prathom",
  "category": "ประถม",
  "tracks": ["ประถม"],
  "subject": "science",
  "topics": [],
  "instructorSlug": "kru-nam",
  "status": "open",
  "price": 599,
  "saleMode": "standalone_and_set",
  "stats": { "pdfPages": 85, "videoHours": 5 },
  "chapters": [
    { "title": "ความรู้เบื้องต้นในทางวิทยาศาสตร์" },
    { "title": "สิ่งมีชีวิต" }
  ],
  "forWho": ["นักเรียนประถมปลาย", "เตรียมสอบเข้า ม.1"],
  "contentPoints": [],
  "deliverables": "ไฟล์ PDF + คลิปวิดีโอ (ไม่จำกัดอายุ)",
  "setCodes": ["PR-01", "PR-05"]
}
```

`group` เป็น `prathom` | `mton` | `mplai` (3 กลุ่มใหญ่)
`category` คือ track ย่อยแบบข้อความไทย เช่น `ม.ปลาย`, `สอวน.`, `สวช.` — ใช้ทำแถบ filter
`subject` เป็น `science` | `biology` | `chemistry` | `physics` | `math` | `applied_science`
`saleMode` เป็น `standalone_and_set` (ขายเดี่ยว + อยู่ใน SET) | `standalone_only` (ขายเดี่ยวเท่านั้น มี 3 คอร์ส)

### sets.json

```json
{
  "code": "PR-01",
  "slug": "primary-p4-bundle",
  "title": "วิทยาศาสตร์ ป.4 เนื้อหา + ตะลุยโจทย์",
  "tagline": "เนื้อหา + ตะลุยโจทย์ ป.4 ครบในเซ็ตเดียว",
  "group": "prathom",
  "status": "open",
  "price": 888,
  "courseSlugs": ["primary-science-p4", "primary-exercise-p4"]
}
```

**สังเกตว่าใน sets.json ไม่มี `compareAtPrice` ไม่มี `savings` ไม่มียอดรวมใด ๆ เลย** — ตั้งใจไม่เก็บ ดูข้อ 4

---

## 3. types.ts — ใช้ได้ทันที

`content/types.ts` คือ TypeScript type ของทุกไฟล์ JSON บวกฟังก์ชันคำนวณที่ต้องใช้ ผ่าน `tsc --strict` แล้ว ไม่ต้องลงอะไรเพิ่ม

type: `Group` `Subject` `Status` `SaleMode` `PageCount` `CourseStats` `Chapter` `Course` `CourseSet` `Instructor` `Site` `Review` `Clip` `SetDerived`

ฟังก์ชัน:

| ฟังก์ชัน | ทำอะไร |
|---|---|
| `deriveSet(set, courses, config)` | คำนวณราคาเต็ม ส่วนลด % ประหยัดกี่บาท ควรโชว์ป้ายลดไหม จำนวนคอร์ส ยอดรวมข้อสอบ/หน้า PDF/ชั่วโมง (ข้ามคอร์สที่ไม่มีค่า ไม่มีเลยเป็น undefined ไม่ใช่ 0) |
| `setsContaining(course, sets, courses, config)` | หา SET ทั้งหมดที่คอร์สนี้อยู่ ใช้ทำบล็อก "คอร์สนี้อยู่ในชุด" ในหน้ารายละเอียด |
| `trackLabelsByGroup(courses)` | คืน track ที่มีอยู่จริงในแต่ละกลุ่ม ใช้สร้างแถบ filter โดยไม่ hardcode |
| `formatPages(pages)` | `5` → `"5 หน้า"`, `{min:30,max:70}` → `"30–70 หน้า"`, ไม่มีค่า → `null` |
| `contactHref(item, channel)` | ได้ `/go/contact?channel=line&item=course:<slug>` ใช้กับปุ่ม "สมัครเรียน" ทุกปุ่ม |
| `lineDirectHref(site, itemTitle)` | ลิงก์ LINE ตรงพร้อมข้อความ prefill ใช้ตอนที่ยังไม่มี Go API |
| `messengerHref(site, item)` | ลิงก์ m.me พร้อม ref |

ในเฟส 1 ที่ยังไม่มี backend ให้ปุ่มสมัครยิงไป `lineDirectHref` / `messengerHref` ตรง ๆ ก่อน แล้วพอมี Go API ค่อยสลับเป็น `contactHref` ทีเดียว — เก็บลิงก์ไว้ในที่เดียวจะสลับง่าย

---

## 4. กฎที่ต้องไม่ทำผิด

### 4.1 ค่าที่คำนวณ ห้ามเก็บลงไฟล์

ราคาก่อนลดของ SET, ประหยัดกี่บาท, ประหยัดกี่ %, ควรโชว์ป้ายลดไหม, จำนวนคอร์สใน SET, คอร์สนี้อยู่ SET ไหน, track ในแต่ละกลุ่ม — **คำนวณตอน build จาก `deriveSet` เท่านั้น**

เหตุผล: ถ้าเก็บไว้ในไฟล์ วันไหนแก้ราคาคอร์สเดียวใน sheet ตัวเลขส่วนลดของทุก SET ที่มีคอร์สนั้นจะผิดเงียบ ๆ ไม่มีอะไรฟ้อง

### 4.2 ป้ายลดราคา

โชว์เมื่อ `ประหยัด >= 100 บาท` **หรือ** `>= 10%` (ค่านี้อยู่ใน `site.json` → `config.savingsBadge`)
ตอนนี้ 23 SET เข้าเงื่อนไข อีก 4 SET ไม่เข้า (ประหยัดแค่ 10–20 บาท) — SET 4 ตัวนั้นให้โชว์ราคาเดียวเฉย ๆ ไม่ต้องขีดฆ่าอะไร

### 4.3 field ที่ไม่มี = ต้องซ่อนช่องนั้น

ข้อมูลใน sheet ยังไม่ครบทุกคอร์ส ที่ไม่มีค่าจะ**ไม่มี key นั้นใน JSON เลย** ไม่ใช่ `0` ไม่ใช่ `""`

- `chapters` มีจริงแค่ 15 จาก 44 คอร์ส
- `stats` ไม่ครบ 24 จาก 44 คอร์ส (ตัวอย่างข้างบนไม่มี `questionCount` เพราะ sheet ไม่ได้กรอก)
- `topics` ว่างทั้ง 44 คอร์ส
- `pdfPages` เป็นช่วง (`{min,max}`) ใน 12 คอร์ส

เวลา render **ต้องซ่อน slot นั้นไป ห้ามขึ้น "0 ชม." หรือช่องว่าง ๆ** เช่น

```tsx
{course.stats?.videoHours != null && <Stat>{course.stats.videoHours} ชม.</Stat>}
{course.chapters.length > 0 && <ChapterList items={course.chapters} />}
```

### 4.4 ชื่อ key

`content/*.json` เป็น camelCase (ฝั่ง TypeScript) — ส่วน Go API เฟสหลังจะเป็น snake_case แยกกันคนละชั้น ไม่ต้องทำให้เหมือนกัน

---

## 5. สิ่งที่ยังขาด ต้องเติมเอง

| อะไร | สถานะ | ทำยังไงไปก่อน |
|---|---|---|
| รูปปกคอร์ส 44 รูป | ไม่มีไฟล์จริง | ดูชื่อไฟล์ใน `content/cover-images-needed.txt` วางเป็น `public/courses/<slug>.jpg` แล้วเติม field `coverImage` ในสคริปต์ · ระหว่างนี้ใช้กล่องสีจาก palette แทน |
| รีวิวนักเรียน | `reviews.json` = `[]` | section รีวิวจะว่าง ให้ซ่อน section ไปเลยถ้า array ว่าง |
| คลิปตัวอย่าง | `clips.json` = `[]` | เหมือนกัน ซ่อน section ถ้าว่าง หรือใส่ลิงก์ YouTube เอง |
| ราคาก่อนลดของคอร์สเดี่ยว | ยังไม่มีคอลัมน์ใน sheet | คอร์สเดี่ยวโชว์ราคาเดียว ไม่ต้องขีดฆ่า (SET ใช้ผลรวมคำนวณได้อยู่แล้ว) |
| เวลาทำการ | `site.json` → `contact.hours` = `""` | ซ่อนบรรทัดนั้นใน footer |
| อีเมล | `contact.email` = `""` | ซ่อน |
| โดเมน | ยังไม่มี | ใช้ path เปล่า ๆ อย่าเขียน absolute URL ลงโค้ด |
| ชื่อเรียกครู | **ยังไม่ตกลง** | sheet เขียน "ครูพี่หนาม" แต่ design กับ IG ใช้ "ครูหนาม" — `site.json` ใส่ "ครูพี่หนาม" ไว้ แก้ที่ `site.json` ที่เดียวได้ |

---

## 6. ไฟล์ design — จุดที่ design ขัดกับเฟส 1

`docs/design-*.dc.html` เป็น mockup 5 หน้า (หน้าแรก, รายการคอร์ส, รายละเอียดคอร์ส, รายการ SET, รายละเอียด SET) เปิดในเบราว์เซอร์ดูได้เลย (`support.js` เป็นตัวช่วยของ mockup และ `spine-sets.js` เป็นข้อมูลตัวอย่างของ mockup ทั้งสองไฟล์ไม่ต้องเอาไปใช้ใน production)

ใช้เป็นแบบได้ แต่ **ข้อมูลในนั้นเป็นของปลอมทั้งหมด** ไม่ใช่ catalog จริง และมี 6 จุดที่ต้องแก้ตอนทำจริง

1. footer เขียน "ชำระเงินผ่านโอนธนาคาร · พร้อมเพย์ · บัตรเครดิต" — **เฟส 1 ยังไม่มีระบบจ่ายเงิน** เอาบรรทัดนี้ออก
2. FAQ มีข้อเรื่อง pre-order — ไม่จริง เอาออก
3. ปุ่ม "สมัครเรียนเลย" ทุกปุ่มใน design ลิงก์ไปหน้ารายละเอียด — **ต้องเปลี่ยนเป็นลิงก์ติดต่อ** (`lineDirectHref` / `messengerHref`)
4. ปุ่ม "เข้าสู่ระบบ" บน header — เป็นเฟส 2 ซ่อนไปก่อน
5. hero stat "4.9 คะแนนรีวิวเฉลี่ย" — ตัวเลขนี้แต่งขึ้น ยังไม่มีรีวิวจริงแม้แต่อันเดียว · `site.json` → `heroStats` เปลี่ยนเป็นเลขจริงแล้ว (44 คอร์ส / 27 SET / 40+ / ตลอดชีพ) ให้ใช้จาก `site.json`
6. course card ใน design โชว์ราคาขีดฆ่าทุกใบ — คอร์สเดี่ยวยังไม่มีราคาก่อนลด ให้โชว์ราคาเดียว

**สิ่งที่ลอกจาก design ได้เลย:** สี `#85E5FF` `#0B2B33` `#E3EEF1` `#4A6C75` `#5A7A82` · ฟอนต์ Anuphan / IBM Plex Sans Thai / IBM Plex Mono · container `max(clamp(18px,5vw,56px), calc((100% - 1180px) / 2))` · ลำดับ section ของหน้า Landing

---

## 7. เวลา sheet เปลี่ยน ทำยังไง

```bash
# 1. export จาก Google Sheet เป็น CSV ทับไฟล์เดิม
#    tab คอร์ส → raw/courses.csv   ·   tab SET → raw/sets.csv

# 2. ตรวจก่อน ยังไม่เขียนไฟล์
python3 tools/sheet-sync/sheet_sync.py --check

# 3. ถ้าผ่าน ค่อยเขียน
python3 tools/sheet-sync/sheet_sync.py
```

สคริปต์แตะแค่ `courses.json` กับ `sets.json` — **ไม่แตะ `site.json` `reviews.json` `clips.json`** สามไฟล์นั้นแก้มือปลอดภัย

ถ้าเจอ error สคริปต์จะ **exit 1 แล้วไม่เขียนไฟล์อะไรเลย** — ไม่มีสถานะครึ่ง ๆ กลาง ๆ
ที่ทำให้ error: slug ซ้ำ, slug ผิดรูปแบบ, ราคาไม่ใช่ตัวเลข, กลุ่ม/วิชา/สถานะที่ไม่รู้จัก, `slug คอร์สที่รวม` ชี้ไปคอร์สที่ไม่มี, คอลัมน์ slug กับคอลัมน์ชื่อไทยไม่ตรงกัน
ที่เตือนแต่ไปต่อได้: คอร์สไม่มีบท, ราคา SET ไม่เท่าผลรวม, `hours` ว่าง

จบแล้วสคริปต์จะพิมพ์รายงานให้ดู: จำนวนคอร์สต่อกลุ่ม, ตารางส่วนลดของทุก SET พร้อมบอกว่า SET ไหนโชว์ป้ายลด, คอร์สที่อยู่ใน SET มากที่สุด, และ `trackLabelsByGroup` ที่คำนวณได้

การ join สอง tab ใช้คอลัมน์ `slug คอร์สที่รวม` เป็นหลัก แล้วเอาคอลัมน์ `คอร์สที่รวม` (ชื่อไทย) มาตรวจทาน ถ้าไม่ตรงกันจะฟ้องว่า slug ตัวไหนต่าง

---

## 8. เอกสารใน docs/

| ไฟล์ | คืออะไร | เมื่อไหร่ต้องอ่าน |
|---|---|---|
| `requirement.md` | requirement เฟส 1 เต็ม ๆ — ขอบเขต, stack, โครง repo (แยก frontend/backend), ทุกหน้า, flow ติดต่อ, สิ่งที่เลื่อนไปเฟสหลัง | อ่านก่อนเริ่ม |
| `data-schema.md` | schema ทุก field ครบ + enum ทั้งหมด + ผลการตรวจข้อมูล (ข้อ 10) + สิ่งที่ยังค้าง (ข้อ 11) | อ่านตอนเขียน component |
| `content.md` | คู่มือของโฟลเดอร์ `content/` — วิธี re-sync, สคริปต์ตรวจอะไร, อะไรที่ตั้งใจไม่เก็บ, รูปแบบลิงก์ช่องทางติดต่อ | อ่านตอนแก้ข้อมูล |

---

## 9. ข้อมูลที่ตรวจแล้วเชื่อได้

- 71 slug (44 คอร์ส + 27 SET) ไม่ซ้ำกันเลย และ slug ของ SET ลงท้าย `-bundle` ทุกตัว จะไม่ชนกับ slug คอร์สตลอดไป
- ราคา SET ทั้ง 27 ชุด = ผลรวมราคาคอร์สสมาชิกพอดี ตรงกับที่ sheet คำนวณไว้เอง
- ความเป็นสมาชิกตรงกันทั้งสองทาง (คอร์ส → SET และ SET → คอร์ส)
- 3 คอร์สที่เป็น `standalone_only` ไม่อยู่ใน SET ไหนเลย ถูกต้อง
- ทั้ง 71 รายการ `status: open`
- ครูผู้สอน: ครูพี่หนาม 42 / ครูพี่ฝน 1 / ครูพี่ลูกไม้ 1

---

## 10. เมื่อทำเสร็จแล้ว

สร้าง repo แล้ว push ขึ้นไป เอา `owner/repo` มาบอก จะต่อเข้ากับ project นี้ให้ (ตอนนี้ยังไม่มี repo ผูกอยู่) แล้วอ่านโค้ดที่เขียน ช่วยรีวิว หรือทำหน้าที่เหลือต่อใน repo นั้นได้เลย
