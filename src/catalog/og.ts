// ข้อมูลบนรูป OG (1200×630) ของแต่ละหน้า · ตัดสินที่นี่ว่าจะโชว์อะไร ส่วนการวาดอยู่ที่ src/og/render.tsx
// ใช้การ์ดเดิมของคอร์ส / เซ็ต จึงได้ป้ายกลุ่ม ราคา และเกณฑ์ป้ายประหยัดชุดเดียวกับหน้าเว็บ

import type { Course, CourseSet, Site } from '@content/types'
import { buildCourseCard } from './course-card'
import { buildSetListCard } from './set-list'

export type OgCard = {
  /** บรรทัดเล็กเหนือชื่อ เช่น "ม.ปลาย · สอวน." หรือ "เซ็ต PR-01 · ประถม" */
  eyebrow?: string
  title: string
  tagline?: string
  price?: string
  /** ราคาปกติขีดฆ่า · มีเฉพาะเซ็ตที่ประหยัดถึงเกณฑ์ใน site.json */
  regularPrice?: string
  badges: string[]
}

export type OgPage = 'landing' | 'courses' | 'sets'

export function courseOgCard(course: Course, site: Site): OgCard {
  const card = buildCourseCard(course, site)
  return {
    eyebrow: card.label,
    title: card.title,
    tagline: card.tagline,
    price: card.price,
    badges: [card.lifetime],
  }
}

export function setOgCard(set: CourseSet, courses: Course[], site: Site): OgCard {
  const card = buildSetListCard(set, courses, site)
  const { savings } = card
  return {
    eyebrow: `${card.codeLabel} · ${card.group}`,
    title: card.title,
    tagline: set.tagline,
    price: card.price,
    ...(savings && { regularPrice: savings.regularPrice }),
    badges: [
      `รวม ${card.courseCount}`,
      ...(savings ? [`ประหยัด ${savings.amount} (${savings.percent})`] : []),
    ],
  }
}

const PAGE_NAME: Record<OgPage, string | undefined> = { landing: undefined, courses: 'คอร์สเรียน', sets: 'SET คอร์ส' }

/** หน้าแรกกับหน้ารายการ: ชื่อเว็บ + คำโปรย */
export function pageOgCard(page: OgPage, site: Site): OgCard {
  const eyebrow = PAGE_NAME[page]
  return { ...(eyebrow && { eyebrow }), title: site.brand.name, tagline: site.brand.heroSubtitle, badges: [] }
}
