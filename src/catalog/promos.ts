// แถบโปรโมชันบนหน้าแรก · ลูกค้าใช้โปรโดยบอกชื่อโปรกับแอดมินตอนทัก (ไม่มีโค้ด)

import { deriveSet, type Course, type CourseSet, type Site } from '@content/types'
import type { ContactItem } from '@/contact'

export type Promo =
  | {
      kind: 'seasonal'
      name: string
      headline: string[]
      detail: string
      /** ISO 8601 · หน้าเว็บใช้นับถอยหลัง และซ่อนการ์ดเองเมื่อพ้นเวลา (build ไว้ล่วงหน้า เวลาตอน build อาจเก่าแล้ว) */
      endsAt: string
      contactItem: ContactItem
    }
  | {
      kind: 'evergreen'
      name: string
      /** ตัวเลขใหญ่บนการ์ด เช่น "-20%" หรือ "100.-" */
      value: string
      desc: string
      /** อย่างใดอย่างหนึ่ง: ลิงก์ในเว็บ หรือทักแอดมินพร้อมชื่อโปร */
      href?: string
      contactItem?: ContactItem
    }

/** โปรตามฤดูก่อน แล้วโปรตลอดปี · โปรตามฤดูที่หมดเขตแล้วตอน build ตัดทิ้ง · ว่าง = ซ่อนทั้งแถบ */
export function buildPromos(site: Site, sets: CourseSet[], courses: Course[], now: Date): Promo[] {
  const seasonal = site.promos.seasonal
    .filter((p) => new Date(p.endsAt).getTime() > now.getTime())
    .map((p, i): Promo => ({
      kind: 'seasonal',
      name: p.name,
      headline: p.headline,
      detail: p.detail,
      endsAt: p.endsAt,
      contactItem: { kind: 'promo', slug: `seasonal-${i + 1}`, title: p.name },
    }))

  const evergreen = site.promos.evergreen.flatMap((p, i): Promo[] => {
    if (p.kind === 'contact') {
      return [{ kind: 'evergreen', name: p.name, value: p.value, desc: p.desc, contactItem: { kind: 'promo', slug: `evergreen-${i + 1}`, title: p.name } }]
    }
    const best = maxSavingsPercent(sets, courses, site)
    // ไม่มีเซ็ตที่ถูกกว่าซื้อแยก ก็ไม่มีอะไรให้โฆษณา
    return best > 0 ? [{ kind: 'evergreen', name: p.name, value: `-${best}%`, desc: p.desc, href: '/sets' }] : []
  })

  return [...seasonal, ...evergreen]
}

/** ปัดลงเหมือนป้ายประหยัดของเซ็ต จะได้ไม่โฆษณาเกินจริง */
function maxSavingsPercent(sets: CourseSet[], courses: Course[], site: Site): number {
  return Math.max(0, ...sets.map((s) => Math.floor(deriveSet(s, courses, site.config).savingsPercent)))
}
