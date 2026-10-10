// SpinePeak — ชนิดข้อมูลของไฟล์ใน content/ และค่าที่ต้องคำนวณตอน build
//
// ไฟล์นี้สะท้อน JSON ที่มีอยู่จริงวันนี้ ไม่ใช่สิ่งที่อยากให้มี
// ฟิลด์ที่มาร์กว่า "ยังไม่มีในข้อมูลชุดนี้" คือฟิลด์ที่ schema รองรับแต่ชีตยังไม่ได้กรอก
// โค้ดต้องเขียนให้รองรับกรณีไม่มี ตั้งแต่วันแรก ไม่ใช่รอให้มีแล้วค่อยแก้

export type Group = 'prathom' | 'mton' | 'mplai'

export type Subject =
  | 'science'
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'math'
  | 'applied_science'

export type SaleMode = 'standalone_and_set' | 'standalone_only'

/** จำนวนหน้า PDF บางคอร์สในชีตเป็นช่วง เช่น "30-70" จึงไม่ใช่ number เสมอไป */
export type PageCount = number | { min: number; max: number }

export type CourseStats = {
  /** 34 จาก 44 คอร์สมีค่านี้ */
  questionCount?: number
  /** 40 จาก 44 คอร์สมีค่านี้ · 12 คอร์สเป็นช่วง */
  pdfPages?: PageCount
  /** 39 จาก 44 คอร์สมีค่านี้ */
  videoHours?: number
}

export type Chapter = { title: string }

export type Course = {
  slug: string
  title: string
  tagline: string
  group: Group
  /** หมวดหมู่จากชีต ใช้เป็นหัวข้อแถบในหน้า Course List */
  category: string
  /** หัวข้อ: ตัวกรอง "ทุกหัวข้อ" และป้ายบนการ์ด · คอลัมน์ หัวข้อ ในชีต เว้นว่าง = [category] */
  topics: string[]
  subject: Subject
  instructorSlug: string
  price: number
  saleMode: SaleMode
  stats: CourseStats
  /** มีแค่ 15 จาก 44 คอร์ส อีก 29 คอร์สเป็นชุดตะลุยโจทย์ที่ไม่มีบท */
  chapters: Chapter[]
  forWho: string[]
  contentPoints: string[]
  deliverables: string
  /** รหัส SET ที่คอร์สนี้อยู่ เช่น ["HS-01","AL-02"] */
  setCodes: string[]

  // ---- ยังไม่มีในข้อมูลชุดนี้ เพิ่มทีหลังได้โดยไม่ต้องแก้ชนิด ----
  /** ชื่อยาวสำหรับ h1 ในหน้า detail ถ้าไม่มีให้ใช้ title */
  fullTitle?: string
  /** ราคาก่อนลด สำหรับราคาขีดฆ่า เจ้าของจะเพิ่มในชีตทีหลัง */
  compareAtPrice?: number
  priceNote?: string
  coverImage?: string
  previewVideoUrl?: string
  faqs?: { q: string; a: string }[]
}

export type CourseSet = {
  /** รหัสในชีต เช่น "PR-01" ใช้เชื่อมกับ Course.setCodes */
  code: string
  slug: string
  title: string
  tagline: string
  group: Group
  /** ราคาขายของเซ็ต ส่วนราคาปกติและส่วนลดคำนวณเอาเอง */
  price: number
  /** slug ของคอร์สสมาชิก เรียงตามลำดับในชีต */
  courseSlugs: string[]
  coverImage?: string
}

export type Instructor = {
  slug: string
  name: string
  role: string
  shortBio: string
  longBio: string
  tags: string[]
  photoHero?: string
  photoAvatar?: string
}

/** คอร์สหรือเซ็ตที่เจ้าของเลือกขึ้นหน้าแรก · slug ผิดหรือ type ไม่ตรง build จะพัง (validateContent) */
export type FeaturedItem = {
  type: 'course' | 'set'
  slug: string
  /** ป้ายบนการ์ด เช่น "ขายดี" · ไม่ใส่ = ไม่มีป้าย */
  label?: string
}

/**
 * โปรโมชันบนหน้าแรก · ลูกค้าใช้โปรโดยบอกชื่อโปรกับแอดมินตอนทัก ไม่มีโค้ด
 * โปรตามฤดูมีวันหมดเขต พ้นแล้วไม่แสดง · โปรตลอดปีไม่มีวันหมด
 */
export type Promotions = {
  seasonal: {
    /** ชื่อโปรที่ลูกค้าบอกแอดมิน และอยู่ในข้อความทัก LINE */
    name: string
    /** หัวการ์ด แต่ละช่องขึ้นบรรทัดใหม่ เช่น ["โปรเปิดเทอม 2", "ลดเพิ่ม 15% ทุก SET"] */
    headline: string[]
    /** บรรทัดเล็กใต้หัว เช่น "ทุก SET · ถึง 31 ต.ค. 69" */
    detail: string
    /** ISO 8601 พร้อม timezone เช่น "2026-10-31T23:59:59+07:00" */
    endsAt: string
  }[]
  evergreen: (
    | {
        /** ตัวเลขใหญ่คำนวณจาก SET ที่ประหยัดสูงสุด กดแล้วไปหน้า SET */
        kind: 'set-savings'
        name: string
        desc: string
      }
    | {
        /** กดแล้วทักแอดมินพร้อมชื่อโปร */
        kind: 'contact'
        name: string
        /** ตัวเลขใหญ่บนการ์ด เช่น "100.-" */
        value: string
        desc: string
      }
  )[]
}

export type Site = {
  brand: {
    name: string
    logo: string
    heroBadge: string
    /** มี \n ข้างใน ต้องตัดบรรทัดตามนั้น */
    heroTitle: string
    heroSubtitle: string
    footerBlurb: string
  }
  heroStats: { value: string; label: string }[]
  instructors: Instructor[]
  contact: {
    line: { basicId: string; prefillTemplate: string }
    facebook: { pageId: string; url: string }
    instagram?: { handle: string; url: string }
    tiktok?: { handle: string; url: string }
    /** ว่างอยู่ — ถ้าว่างให้ซ่อนบรรทัดนั้นใน footer */
    email?: string
    /** ว่างอยู่ — ถ้าว่างให้ซ่อนบรรทัดเวลาทำการ */
    hours?: string
    youtubeChannelUrl?: string
  }
  /** การ์ด "ไม่แน่ใจว่าเรียนอะไรดี" หน้ารายการคอร์ส · กดแล้วไปรายการที่กรองตาม filter (q = คำค้นหา) */
  goalCards: {
    title: string
    desc: string
    filter: { group?: Group; topic?: string; q?: string }
  }[]
  /** ของแนะนำบนหน้าแรก เรียงตามลำดับนี้ · ว่าง = ซ่อนส่วน "คอร์สขายดี" ทั้งส่วน */
  featured: FeaturedItem[]
  /** แถบโปรโมชันบนหน้าแรก · ไม่มีโปรเลย = ซ่อนทั้งแถบ */
  promos: Promotions
  /** FAQ ทั่วไป (modal จาก footer) */
  faqs: { q: string; a: string }[]
  /** FAQ ท้ายหน้ารายการคอร์ส */
  coursesFaqs: { q: string; a: string }[]
  /** FAQ ท้ายหน้ารายการ SET */
  setsFaqs: { q: string; a: string }[]
  config: {
    lifetimeLabel: string
    savingsBadge: { minPercent: number; minBaht: number }
    listPageSize: number
    listPageIncrement: number
  }
  groups: { key: Group; label: string }[]
}

/** reviews.json เป็น [] อยู่ — ถ้าว่างให้ซ่อนแถบรีวิวทั้งแถบ */
export type Review = {
  id: string
  quote: string
  studentName: string
  grade: string
  courseSlug?: string
  coverImage?: string
  featured?: boolean
}

/** clips.json เป็น [] อยู่ — ถ้าว่างให้ซ่อนกล่องคลิปตัวอย่าง */
export type Clip = {
  title: string
  sourceLabel: string
  minutes: number
  youtubeUrl: string
  thumbnail?: string
}

// ─────────────────────────────────────────────────────────────
// ค่าที่คำนวณตอน build — อย่าเก็บลงไฟล์ JSON
//
// เหตุผล: ราคาปกติของเซ็ตคือผลรวมราคาคอร์สสมาชิก ถ้าเก็บตัวเลขไว้ในไฟล์
// วันที่แก้ราคาคอร์สเดียว ส่วนลดของทุกเซ็ตที่มีคอร์สนั้นจะเพี้ยนเงียบ ๆ
// ─────────────────────────────────────────────────────────────

export type SetDerived = {
  /** ผลรวมราคาคอร์สสมาชิก = ราคาขีดฆ่าบนการ์ดเซ็ต */
  compareAtPrice: number
  savings: number
  /** 0-100 */
  savingsPercent: number
  /** false = ซ่อนป้ายประหยัดไปเลย อย่าโชว์ "ประหยัด 10 บาท" */
  showSavingsBadge: boolean
  courseCount: number
  /**
   * ยอดรวม ข้อสอบ / หน้า PDF / ชั่วโมงวิดีโอ ของคอร์สสมาชิก ข้ามคอร์สที่ไม่มีค่า
   * ช่องที่ไม่มีคอร์สไหนมีค่าเลยเป็น undefined ไม่ใช่ 0 จะได้ไม่ขึ้น "0 ชม." ปลอม
   * หน้า PDF ที่เป็นช่วงรวมเป็นช่วง เช่น 80 + (30-70) = 110-150 ยังเป็นตัวเลขจริง
   */
  totals: CourseStats
}

/** ค่า 0 นับว่าไม่มีข้อมูล เหมือนหน้ารายละเอียดคอร์ส */
function sumPresent(values: (number | undefined)[]): number | undefined {
  const kept = values.filter((v): v is number => v != null && v > 0)
  return kept.length > 0 ? kept.reduce((a, b) => a + b, 0) : undefined
}

function sumStats(all: CourseStats[]): CourseStats {
  const pages = all.map((s) => s.pdfPages).filter((p): p is PageCount => p != null)
  const min = sumPresent(pages.map((p) => (typeof p === 'number' ? p : p.min)))
  const max = sumPresent(pages.map((p) => (typeof p === 'number' ? p : p.max)))
  const hours = sumPresent(all.map((s) => s.videoHours))

  return {
    questionCount: sumPresent(all.map((s) => s.questionCount)),
    pdfPages: min == null || max == null ? undefined : min === max ? min : { min, max },
    // ปัดเศษที่เกิดจากการบวกทศนิยม เช่น 1.1 + 2.2 = 3.3000000000000003
    videoHours: hours == null ? undefined : Math.round(hours * 100) / 100,
  }
}

export function deriveSet(
  set: CourseSet,
  courses: Course[],
  config: Site['config'],
): SetDerived {
  const byslug = new Map(courses.map((c) => [c.slug, c]))
  const members = set.courseSlugs
    .map((s) => byslug.get(s))
    .filter((c): c is Course => Boolean(c))

  const compareAtPrice = members.reduce((sum, c) => sum + c.price, 0)
  const savings = compareAtPrice - set.price
  const savingsPercent = compareAtPrice ? (savings / compareAtPrice) * 100 : 0

  return {
    compareAtPrice,
    savings,
    savingsPercent,
    showSavingsBadge:
      savings >= config.savingsBadge.minBaht ||
      savingsPercent >= config.savingsBadge.minPercent,
    courseCount: members.length,
    totals: sumStats(members.map((c) => c.stats)),
  }
}

/** เซ็ตทุกตัวที่มีคอร์สนี้ เรียงจากประหยัดมากไปน้อย ใช้ทำกล่อง "ซื้อเป็น SET คุ้มกว่า" */
export function setsContaining(
  course: Course,
  sets: CourseSet[],
  courses: Course[],
  config: Site['config'],
): { set: CourseSet; derived: SetDerived }[] {
  return sets
    .filter((s) => s.courseSlugs.includes(course.slug))
    .map((s) => ({ set: s, derived: deriveSet(s, courses, config) }))
    .sort((a, b) => b.derived.savings - a.derived.savings)
}

/** ตัวเลือกใน dropdown ตัวกรอง คำนวณจากหมวดหมู่จริง ไม่ได้พิมพ์ไว้ใน site.json */
export function trackLabelsByGroup(courses: Course[]): Record<Group, string[]> {
  const out: Record<Group, string[]> = { prathom: [], mton: [], mplai: [] }
  for (const c of courses) {
    if (!out[c.group].includes(c.category)) out[c.group].push(c.category)
  }
  return out
}

/** "30-70 หน้า" หรือ "85 หน้า" — คืน null เมื่อไม่มีค่า เพื่อให้ผู้เรียกซ่อนช่องนั้น */
export function formatPages(pages: PageCount | undefined): string | null {
  if (pages == null) return null
  return typeof pages === 'number' ? `${pages} หน้า` : `${pages.min}-${pages.max} หน้า`
}

// ลิงก์ปุ่มติดต่อ (LINE / Messenger / /go/contact) ย้ายไปอยู่ที่ src/contact/ ที่เดียว
