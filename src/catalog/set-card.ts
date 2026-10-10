// การ์ดเซ็ตหนึ่งใบ ใช้ในกล่อง "ซื้อเป็นเซ็ตคุ้มกว่า" ของหน้าคอร์ส และหน้ารายการเซ็ตต่อไป

import type { CourseSet, SetDerived } from '@content/types'
import { formatBaht, statsLine } from './format'

/** ส่วนที่ประหยัดเมื่อเทียบกับซื้อคอร์สแยก */
export type SetSavings = {
  /** ผลรวมราคาคอร์สในเซ็ต แสดงเป็นราคาขีดฆ่า */
  regularPrice: string
  amount: string
  /** ปัดลงเสมอ จะได้ไม่โฆษณาเกินจริง เช่น 12.5% → "12%" */
  percent: string
}

/** แสดงทุก SET ที่ถูกกว่าซื้อแยก · undefined เมื่อไม่ได้ถูกกว่า (validateContent รายงานไว้แล้ว) ให้แสดงราคาเดียว */
export function setSavings(derived: SetDerived): SetSavings | undefined {
  if (derived.savings <= 0) return undefined
  return {
    regularPrice: formatBaht(derived.compareAtPrice),
    amount: formatBaht(derived.savings),
    percent: `${Math.floor(derived.savingsPercent)}%`,
  }
}

export type SetCard = {
  slug: string
  /** หน้ารายละเอียดเซ็ต */
  href: string
  title: string
  price: string
  savings?: SetSavings
  /** เช่น "รวม 2 คอร์ส · 150 ข้อ · 4 ชม." ยอดรวมเฉพาะตัวที่มีค่า */
  summary: string
}

export function buildSetCard(set: CourseSet, derived: SetDerived): SetCard {
  const savings = setSavings(derived)
  return {
    slug: set.slug,
    href: `/sets/${set.slug}`,
    title: set.title,
    price: formatBaht(set.price),
    ...(savings && { savings }),
    summary: [`รวม ${derived.courseCount} คอร์ส`, statsLine(derived.totals)].filter(Boolean).join(' · '),
  }
}
