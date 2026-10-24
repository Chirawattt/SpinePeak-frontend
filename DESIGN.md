---
name: Spine Peak
description: เว็บแนะนำคอร์สวิทยาศาสตร์และชีววิทยาของครูพี่หนาม สว่าง สะอาด เป็นกันเอง
colors:
  brand: "#85e5ff"
  brand-soft: "#b6eeff"
  brand-wash: "#e6f9ff"
  ink: "#0b2b33"
  band-ink: "#08232b"
  ink-soft: "#4a6c75"
  muted: "#56767e"
  eyebrow: "#3e7784"
  link-hover: "#12707f"
  strike: "#6a868e"
  line: "#e3eef1"
  card-line: "#dceef3"
  outline: "#d6e8ed"
  divider: "#e8f1f4"
  divider-soft: "#edf5f7"
  tint: "#f6fdff"
  set-wash: "#f4fcff"
  footer: "#fbfeff"
  white: "#ffffff"
  on-dark-soft: "#c6dee4"
  destructive: "#d92d20"
typography:
  display:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "clamp(33px, 6.4vw, 58px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "clamp(24px, 3.8vw, 32px)"
    fontWeight: 700
    lineHeight: 1.25
  title:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
  price:
    fontFamily: "Anuphan, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.2
  body-lead:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.7
  body:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Anuphan, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  eyebrow:
    fontFamily: "IBM Plex Mono, Anuphan, ui-monospace, monospace"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  inner: "14px"
  tile: "18px"
  panel: "20px"
  feature: "22px"
  pill: "9999px"
spacing:
  gutter: "max(clamp(18px, 5vw, 56px), calc((100% - 1180px) / 2))"
  card-inset: "20px"
  set-inset: "22px"
  panel-inset: "24px"
components:
  button-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-brand:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-outline:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-outline-hover:
    backgroundColor: "{colors.brand-wash}"
  button-wash:
    backgroundColor: "{colors.brand-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
  button-wash-hover:
    backgroundColor: "{colors.brand-soft}"
  badge-brand:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
  badge-wash:
    backgroundColor: "{colors.brand-wash}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
  badge-ink:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.brand}"
    rounded: "{rounded.pill}"
    padding: "7px 16px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
  card-tile:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.tile}"
  card-panel:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "24px"
  card-set:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.feature}"
---

# Design System: Spine Peak

## Overview

**Creative North Star: "The Bright Lab" (ห้องแล็บที่สว่าง)**

Spine Peak คือห้องแล็บชีววิทยาที่เปิดไฟสว่างทั้งห้อง พื้นเป็นสีขาวเกือบทั้งหมด มีสีฟ้าสด (brand) ใช้เป็นจุดสนใจ และสีน้ำเงินเขียวเข้มเกือบดำ (ink) ใช้เป็นทั้งตัวอักษรและพื้นของส่วนที่ต้องการน้ำหนัก ลายตกแต่งมีอย่างเดียวคือรูปทรงของการส่องกล้องจุลทรรศน์ ได้แก่ วงกลม วงแหวนเส้นบาง วงแหวนเส้นประ และลายจุดถี่ๆ ที่ดูเหมือนเซลล์ใต้เลนส์ ทั้งหมดใช้สีฟ้าอ่อนจางๆ จึงไม่แย่งความสนใจจากเนื้อหา

อารมณ์ของเว็บคือนุ่ม เป็นมิตร และกดง่าย เพราะผู้ใช้มีตั้งแต่เด็ก ป.4 ไปจนถึงผู้ปกครอง ทุกอย่างที่กดได้เป็นทรงแคปซูล การ์ดมีมุมโค้งมาก เวลากดจะยุบลงเล็กน้อย การ์ดจะลอยขึ้นตอน hover และทุกอย่างขยับด้วย spring ที่เด้งนิดหน่อย ความเป็นทางการมาจากตัวเลขกับข้อมูลที่ตรงไปตรงมา ไม่ได้มาจากความแข็งของรูปทรง

ความหนาแน่นอยู่ระดับกลาง: มีที่ว่างพอให้หายใจ แต่การ์ดคอร์สยังมีข้อมูลครบในใบเดียว (หมวดหมู่ ชื่อ คำโปรย จำนวนข้อสอบ/หน้า/ชั่วโมง ผู้สอน ราคา) เว็บมีแค่โหมดสว่าง ไม่มีโหมดมืด

**Key Characteristics:**
- พื้นขาว ใช้สีฟ้าเป็นจุดสนใจ ใช้สีเข้มเป็นตัวอักษรและพื้นของส่วนสำคัญ
- ทุกอย่างที่กดได้เป็นแคปซูล การ์ดโค้ง 18–22px
- ลายตกแต่งเป็นวงกลม วงแหวน และลายจุดสีฟ้าอ่อน (ธีมกล้องจุลทรรศน์)
- แยก SET ด้วยหัวการ์ดพื้นเข้มกับเส้นขอบเข้ม ส่วนคอร์สเดี่ยวเป็นการ์ดขาวเส้นบาง
- motion เป็น spring ที่เด้งนิดหน่อย และเคารพการตั้งค่า reduced motion
- มีโหมดสว่างอย่างเดียว

## Colors

พื้นขาวกับสีฟ้าเย็นๆ สองระดับ (สดและจาง) ตัดด้วยสีน้ำเงินเขียวเข้มที่ลึกเหมือนน้ำทะเลลึก ทุกสีเทาในระบบเอียงไปทางฟ้าเขียว ไม่มีสีเทากลางเลย

### Primary
- **Microscope Light Blue** (brand): สีของปุ่ม "ดูรายละเอียด" / "ดู SET นี้" ป้ายเด่น วงกลมหลังรูปครู และตัวเลข "ประหยัด" บนพื้นเข้ม เป็นสีที่บอกว่า "ตรงนี้กดได้หรือคุ้ม" เนื่องจากความสว่างสูง ห้ามใช้เป็นสีตัวอักษรบนพื้นขาว ใช้เป็นพื้นของตัวอักษร ink หรือใช้เป็นตัวอักษรบนพื้น ink เท่านั้น
- **Soft Lens Blue** (brand-soft): สีตอน hover ของปุ่ม wash วงแหวนรอบรูปครู และวงกลมตกแต่ง
- **Lens Wash** (brand-wash): พื้นของป้ายรอง ปุ่ม wash และสีตอน hover ของปุ่ม outline

### Secondary
- **Deep Specimen Teal** (ink): ตัวอักษรหลักทั้งเว็บ พื้นของปุ่มหลัก ("ทักแอดมินเพื่อสมัคร") พื้นหัวการ์ด SET การ์ดโปรตามฤดู และ hero ของหน้า SET เป็นสีเดียวที่ใช้กับพื้นเข้ม
- **Abyss Teal** (band-ink): หัวข้อในแถบเรียกให้ลงมือท้ายหน้า เข้มกว่า ink เล็กน้อย
- **Lab Link Teal** (link-hover): สีของเมนูตอน hover และตอนเป็นหน้าปัจจุบัน รวมถึงเส้นใต้เมนู

### Neutral
- **Soft Ink** (ink-soft): คำโปรยใต้หัวข้อ hero และคำโปรยของการ์ด SET
- **Muted Teal Gray** (muted): ข้อความรอง เช่น ตัวเลขข้อมูลบนการ์ด หรือป้ายกำกับใต้ตัวเลขใน hero
- **Eyebrow Teal** (eyebrow): ตัวอักษร mono เล็กๆ หัวการ์ด (หมวดหมู่ / รหัส) และข้อความ "ประหยัด ... เทียบกับซื้อแยก"
- **Strike Gray** (strike): ราคาปกติที่ขีดฆ่าเท่านั้น จางกว่า muted ให้รู้ว่าเป็นราคาเดิม แต่ยังอ่านออก (3.9:1 บนพื้นขาว) · ราคาที่ไม่ได้ขีดฆ่าใช้ muted
- **Hairline** (line), **Card Line** (card-line), **Outline** (outline): เส้นขอบการ์ด เส้นขอบปุ่ม outline และขอบช่องกรอก
- **Divider** (divider), **Divider Soft** (divider-soft): เส้นใต้ header เส้นของ footer และเส้นคั่นในการ์ด
- **Tint** (tint), **Set Wash** (set-wash), **Footer** (footer): พื้นขาวอมฟ้าจางๆ ใช้แยกส่วน (section ครู แผงในหน้าต่างช่วยเหลือ) พื้นการ์ด SET ในหน้าแรก และพื้นของ footer กับแถบตัวกรองที่ติดอยู่ด้านบน
- **On-Dark Soft** (on-dark-soft): ข้อความรองบนพื้น ink
- **Destructive** (destructive): มีไว้ให้ component ของ shadcn ใช้เท่านั้น บนหน้าเว็บยังไม่มีที่ใช้

สีของลายตกแต่ง hero (glow, glow-soft, glow-faint, dot, ring, ring-dashed, ring-faint, dot-dark) ประกาศไว้ใน `src/app/globals.css` ใช้กับลายตกแต่งเท่านั้น ห้ามนำไปใช้กับ UI

### Named Rules
**The One Dark Rule.** พื้นเข้มมีสีเดียวคือ ink ใช้กับของที่ต้องการน้ำหนักจริงๆ ได้แก่ ปุ่มติดต่อหลัก หัวการ์ด SET โปรตามฤดู และ hero ของหน้า SET ห้ามใช้ ink เป็นพื้นของ section ทั่วไป

**The Blue-Means-Go Rule.** สีฟ้าสดใช้เป็นพื้นเท่านั้น และใช้กับสิ่งที่กดได้หรือบอกความคุ้ม ห้ามใช้เป็นสีตัวอักษรบนพื้นขาว

**The Cool Gray Rule.** สีเทาทุกตัวต้องเอียงไปทางฟ้าเขียว ห้ามใช้ `#888` หรือ gray ของ Tailwind

## Typography

**Display Font:** Anuphan (with system-ui, sans-serif)
**Body Font:** Anuphan (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono 500 (with Anuphan, ui-monospace) ใช้กับตัวอักษรละตินเล็กๆ เท่านั้น

**Character:** Anuphan เป็นฟอนต์ไทยแบบไม่มีหัวที่กลมและอ่านง่าย ใช้ฟอนต์นี้ตัวเดียวทั้งหัวข้อและเนื้อความ แยกลำดับความสำคัญด้วยขนาดและน้ำหนัก (400–700) ส่วน Plex Mono ใช้กับป้ายหัวการ์ด ให้ความรู้สึกเหมือนฉลากบนหลอดทดลอง

### Hierarchy
- **Display** (700, clamp 33–58px, line-height 1.12, -0.01em): หัวข้อ hero ของหน้าแรกเท่านั้น แยกบรรทัดตามที่กำหนดใน `content/site.json`
- **Headline** (700, clamp 24–32px): หัวข้อ section ในหน้าแรก หัวข้อของหน้าอื่นอยู่ในช่วง clamp 22–46px ตามขนาดของ section
- **Title** (600, 20px, 1.3): ชื่อคอร์สบนการ์ด ชื่อบนการ์ด SET ใช้ 700 ขนาด 22px
- **Price** (700, 25px): ราคาบนการ์ดคอร์ส ราคาบนการ์ด SET ใช้ 28px เพื่อให้ราคาโดดออกมาจากข้อความรอบข้าง
- **Body lead** (400, 18px, 1.7): คำโปรยใต้หัวข้อ hero กว้างไม่เกิน 460px
- **Body** (400, 14.5–15px, 1.6): คำโปรยและเนื้อความบนการ์ด
- **Label** (600, 12.5–13px): ป้ายแคปซูล
- **Eyebrow** (Plex Mono, 12px, โหลดน้ำหนัก 500 600 700): ป้ายหมวดหมู่หรือรหัสหัวการ์ด สี eyebrow

### Named Rules
**The One Thai Face Rule.** ภาษาไทยใช้ Anuphan ตัวเดียว (commit `4fdda7c`) ห้ามเพิ่มฟอนต์ไทยตัวที่สอง

**The Mono Is For Labels Rule.** ใช้ Plex Mono กับป้ายสั้นๆ เช่น หมวดหมู่ รหัส หรือ "ประหยัด 46%" ห้ามใช้กับประโยค

## Layout

ทุก section ใช้ระยะขอบซ้ายขวาเดียวกันคือ `gutter` ที่ 18–56px ตามความกว้างจอ และเนื้อหากว้างได้ไม่เกิน 1180px โดยจัดกึ่งกลาง พื้นหลังของ section ขยายเต็มจอ แต่เนื้อหาอยู่ใน gutter

กริดเป็นแบบ fluid ด้วย `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` แทนการใช้ breakpoint ตายตัว ตัวอย่างคือ hero ที่ใช้ 320px แล้วจะยุบเป็นคอลัมน์เดียวบนมือถือเอง หัวข้อใช้ `clamp()` ทั้งหมด ต้องใช้งานได้ที่จอกว้าง 360px

Header ติดอยู่ด้านบนแบบโปร่งแสงเล็กน้อย (ขาว 95% + blur) ความสูงวัดจริงแล้วเก็บไว้ใน `--header-h` ของที่ต้องติดใต้ header (แถบตัวกรอง) ให้ใช้ `top-(--header-h)` ส่วนจุดที่ลิงก์เลื่อนไปถึงใช้ `scroll-mt-[90px]`

ระยะภายในการ์ดอยู่ที่ประมาณ 20–22px ระยะห่างระหว่างของในการ์ด 9–10px ส่วน hero มีระยะบน 64px และล่าง 104px

## Elevation & Depth

เว็บเป็นแบบแบนเกือบทั้งหมด แยกชั้นด้วยเส้นขอบบางสีฟ้าเทาและพื้นขาวอมฟ้า เงามีไว้บอกว่ากดได้ (ตอน hover) และใช้กับการ์ดที่ลอยเหนือพื้นอยู่แล้ว เช่น การ์ดราคาในหน้ารายละเอียดหรือการ์ด SET เงาทุกชั้นใช้สี ink โปร่งแสง ไม่ใช้สีดำ

### Shadow Vocabulary
- **Card** (`box-shadow: 0 10px 30px rgb(11 43 51 / 0.06)`): การ์ดคอร์สตอน hover และการ์ดราคาในหน้ารายละเอียด
- **Set Rest** (`box-shadow: 0 12px 32px rgb(11 43 51 / 0.08)`): การ์ด SET ในหน้ารายการตอนปกติ
- **Set Hover** (`box-shadow: 0 18px 40px rgb(11 43 51 / 0.14)`): การ์ด SET ตอน hover

### Named Rules
**The Lift-On-Intent Rule.** การ์ดคอร์สต้องแบนตอนปกติ เงาจะขึ้นเมื่อ hover เท่านั้น การ์ด SET เป็นข้อยกเว้นเดียวที่มีเงาตอนปกติ เพราะเป็นของที่เว็บอยากดันให้ขาย

## Shapes

ทุกอย่างโค้งมน ไม่มีมุมแหลม ปุ่ม ป้าย ช่องกรอก และ dropdown เป็นแคปซูล (9999px) การ์ดคอร์สโค้ง 18px กล่องข้อมูลโค้ง 20px และการ์ด SET กับโปรตามฤดูโค้ง 22px (การ์ดยิ่งสำคัญยิ่งโค้งมาก) ส่วนกล่องด้านในการ์ดโค้ง 14px

เส้นขอบทั่วไปหนา 1px เส้นขอบที่ต้องการเน้น (การ์ด SET, ปุ่ม outline, วงแหวนตกแต่ง) หนา 1.5px ลายตกแต่งทุกชิ้นเป็นวงกลม รวมถึงหัวข้อรายการในการ์ด SET ซึ่งเป็นจุด 7px พื้นฟ้าขอบเข้ม

รูปครูใน hero ถูกตัดด้วย mask วงรีสองชั้นให้หัวโผล่พ้นวงกลมขึ้นไป เป็นลายเซ็นของหน้าแรก

## Components

### Buttons
นุ่ม กดง่าย และเห็นชัดว่าเป็นปุ่ม
- **Shape:** แคปซูล (9999px) ตัวหนา 600 ตัวอักษรอยู่กึ่งกลาง
- **Dark (ค่าเริ่มต้น):** พื้น ink ตัวอักษรขาว ใช้กับปุ่มติดต่อแอดมิน ("ทักแอดมินเพื่อสมัคร", "สมัครเรียนเลย") hover เป็น ink 90%
- **Brand:** พื้นฟ้าสด ตัวอักษร ink ใช้กับปุ่ม "ดูรายละเอียด" / "ดู SET นี้" ในการ์ด hover เป็น brand 85% ปุ่มที่อยู่ในการ์ดที่กดได้ทั้งใบใช้ `group-hover:` ให้ hover ไปพร้อมกับการ์ด
- **Outline:** เส้นขอบ outline หนา 1.5px hover แล้วขอบเป็นฟ้าและพื้นเป็น brand-wash
- **Wash:** พื้น brand-wash hover เป็น brand-soft
- **Sizes:** default (14px 24px) · lg (16px 28px, 17px) · xl (17px 40px, 18px) · icon (42×42 วงกลม)
- **Press:** ยุบเหลือ 97% ด้วย spring (`PRESS`)
- **ลิงก์ที่หน้าตาเป็นปุ่ม** ใช้ `buttonVariants()` กับ `<a>` หรือ `PressAnchor` ไม่ใช้ `<Button>` เพราะ Base UI จะใส่ `role="button"` ให้

### Chips (Badges)
- **Style:** แคปซูล ตัวหนา 600 ขนาด 13px (sm 12.5px)
- **Variants:** brand (พื้นฟ้า) · wash (พื้นฟ้าจาง ใช้กับป้ายบน hero และจำนวน SET บนการ์ด) · ink (พื้นเข้ม ตัวอักษรฟ้า) · outline (ขอบบาง พื้นขาว) · onDark (ขอบ `#3e6b76` บนพื้น ink)
- **ตัวกรอง (pill toggle):** ตอนเลือก พื้น ink ตัวอักษรขาว · ตอนไม่เลือก ขอบ outline พื้นขาว และขอบเป็นฟ้าตอน hover

### Cards / Containers
- **Tile (การ์ดคอร์ส):** โค้ง 18px ขอบ line พื้นขาว ตัดรูปปกเต็มความกว้าง และมีเงา card ตอน hover ทั้งใบเป็นลิงก์
- **Panel (กล่องข้อมูล):** โค้ง 20px ขอบ line padding 24px
- **Featured (การ์ด SET):** โค้ง 20–22px ขอบ ink หนา 1.5px หัวการ์ดพื้น ink มีลายจุด dot-dark และปกคอร์สแบบพัด (`SetCoverFan`)
- **Internal Padding:** 20–22px

### Inputs / Fields
- **Style:** แคปซูล ขอบ outline 1px พื้นขาว padding 12px 20px ตัวอักษร 15px Input กับ NativeSelect ใช้ `controlStyle` ชุดเดียวกัน
- **Focus:** ขอบเปลี่ยนเป็นสี brand และไม่มี outline ring

### Navigation
- **Style:** ตัวหนา 500 ขนาด 14–15px สี ink ชิดขวาของ header และขึ้นสองบรรทัดได้บนจอแคบ
- **Hover / Focus-visible:** ตัวอักษรเป็น link-hover และมีเส้นใต้ link-hover 40% ยืดออกจากซ้าย ตอนหายจะหดออกไปทางขวา (spring `QUICK`)
- **Active:** ตัวอักษรและเส้นใต้เต็มเป็น link-hover เมื่อเปลี่ยนหน้า เส้นจะเลื่อนข้ามไปเมนูใหม่ (`layoutId`)

### ปุ่มติดต่อบนมือถือ
- **หน้าแรก:** ปุ่มแคปซูลสี brand "ทักแอดมิน" ลอยมุมขวาล่าง
- **หน้ารายละเอียดคอร์ส / SET:** แถบขาวติดขอบล่าง มีชื่อคอร์สหรือ SET (ตัดด้วย …) ราคา และปุ่ม "ทักแอดมินเพื่อสมัคร" ที่ผูกกับรายการนั้น · ขึ้นเฉพาะตอนที่ปุ่มของการ์ดราคาและแถบท้ายหน้าไม่อยู่ในจอ ปุ่มเดียวกันจะได้ไม่ซ้อน · เลื่อนขึ้นจากขอบล่าง 0.3s (ปิดเมื่อลดการเคลื่อนไหว) · เว้นขอบล่างตาม safe area
- จอ md ขึ้นไปไม่มีทั้งสองแบบ · footer เว้นที่ท้ายหน้าไว้ให้ไม่ถูกบัง

### Set Cover Stack (signature)
ปกของคอร์สใน SET วางซ้อนกันเยื้องๆ บนหัวการ์ดพื้น ink ถ้ามีมากกว่าที่แสดงได้จะมีตัวนับ "+N" เป็นภาพที่บอกทันทีว่า SET มีหลายคอร์ส
- **พัด (`SetCoverFan`):** ปกหน้ากว้าง 62% ของการ์ดอยู่กลาง ปกที่เหลือ 52% โผล่จากด้านหลังซ้ายขวา สัดส่วน 16:9 ตามรูปปกจริงจึงไม่ถูกตัดขอบ · hover การ์ดแล้วพัดกางออกเล็กน้อย (ปิดเมื่อลดการเคลื่อนไหว)
- **คอร์สขายดีบนหน้าแรก:** หัวการ์ดสูง 184px · **หน้า /sets:** กล่องพัด 2:1 กว้างไม่เกิน 460px ใต้แถว badge

### Motion
- **ค่าเริ่มต้น:** spring bounce 0.22 visualDuration 0.5s (`SPRING`) ตั้งไว้ที่ MotionProvider
- **ของที่ตามเมาส์:** spring bounce 0.1 นาน 0.3s (`QUICK`)
- **ตอนปรากฏ:** เลื่อนขึ้น 16px ขึ้นไล่กันทีละ 0.05s และรวมกันไม่เกิน 0.3s เล่นครั้งเดียวเมื่อเลื่อนมาถึง
- **ส่วนบนสุดของหน้า (ตอนโหลด):** เล่นด้วย CSS (`.rise`) ไม่รอ JS ให้ชื่อ ราคา และปุ่มติดต่อขึ้นทันทีที่หน้าวาด · ease-out 0.6s เริ่มที่ opacity 0.01 ไม่ใช่ 0 เพื่อไม่ให้ LCP ช้า
- **การ์ด:** ลอยขึ้น 4px ตอน hover · **ปุ่ม:** ยุบเหลือ 97% ตอนกด
- เคารพ `prefers-reduced-motion` เสมอ ส่วน clipPath ต้องปิดเอง

## Do's and Don'ts

### Do:
- **Do** ใช้ token ใน `src/app/globals.css` เท่านั้น ถ้าต้องการสีใหม่ ให้เพิ่มเป็น token ที่นั่นก่อน
- **Do** ทำให้ทุกอย่างที่กดได้เป็นแคปซูล (9999px) และทำให้การ์ดโค้ง 18–22px ตามความสำคัญ
- **Do** ใช้ปุ่ม dark (ink) กับการติดต่อแอดมิน และใช้ปุ่ม brand (ฟ้า) กับการเข้าดูรายละเอียด
- **Do** แยก SET ออกจากคอร์สเดี่ยวด้วยหัวพื้น ink และขอบเข้ม 1.5px
- **Do** ใช้ `clamp()` กับขนาดหัวข้อ ใช้กริดแบบ auto-fit และตรวจที่จอกว้าง 360px
- **Do** ใช้ค่าใน `src/components/motion/tokens.ts` กับทุก animation

### Don't:
- **Don't** ใช้สีฟ้าสด (`#85e5ff`) เป็นสีตัวอักษรบนพื้นขาว เพราะ contrast ไม่พอ
- **Don't** ใช้สีเทากลางหรือ gray ของ Tailwind เพราะสีเทาทุกตัวต้องเอียงไปทางฟ้าเขียว
- **Don't** เพิ่มฟอนต์ไทยตัวที่สอง หรือใช้ Plex Mono กับประโยคยาว
- **Don't** ใช้ `bg-muted` หรือ `ring-ring` ของ shadcn เพราะชื่อชนกับ token เดิม ให้ใช้ `bg-brand-wash` / `ring-brand` แทน
- **Don't** ใส่เงาให้การ์ดคอร์สตอนปกติ
- **Don't** ทำโหมดมืด หรือใช้ `dark:` ตาม prefers-color-scheme
