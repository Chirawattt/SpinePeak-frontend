// การ์ดคอร์สหนึ่งใบ ใช้ในหน้ารายการคอร์ส หน้า SET และของแนะนำบนหน้าแรก

import { deriveSet, type Course, type CourseSet, type Site } from '@content/types'
import { courseBadge, WORTH_IT_PERCENT } from './course-detail'
import { cover, formatBaht, groupLabel, lifetimeLabel, statsLine, SUBJECT_LABEL, type Cover } from './format'

export type CourseCard = {
  slug: string
  /** หน้ารายละเอียดคอร์ส */
  href: string
  title: string
  tagline: string
  /** เช่น "มัธยมปลาย · สอวน." */
  label: string
  /** บรรทัดเล็กหัวการ์ด เช่น "มัธยมปลาย · ชีววิทยา · สอวน." (หมวดหมู่ของคอร์ส) */
  eyebrow: string
  /** ป้ายวิชา เช่น "ชีววิทยา" */
  subject: string
  /** ชื่อผู้สอน · ไม่มีค่าเมื่อ site.json ไม่มีผู้สอนคนนี้ */
  teacher?: string
  cover: Cover
  /** ราคาเดี่ยวของคอร์ส */
  price: string
  /** เช่น "VDO 6 ชม. · PDF 80 หน้า · 150 ข้อ" · ไม่มีค่าเมื่อคอร์สไม่มีตัวเลขเลย */
  facts?: string
  /**
   * ป้าย SET บนการ์ด · "มีใน SET · ประหยัดสูงสุด 25%" เมื่อรู้ว่า SET ที่คุ้มที่สุดลดถึง WORTH_IT_PERCENT (ส่ง sets มาให้ buildCourseCard)
   * ไม่งั้น "มีใน 2 SET" · ไม่มีค่าเมื่อคอร์สไม่อยู่ใน SET ไหน
   */
  setCount?: string
  /** เช่น "ดูได้ไม่จำกัดอายุ" · ใช้บนรูป OG */
  lifetime: string
}

/** "{กลุ่ม} · {วิชา} · {หมวดหมู่}" · หมวดหมู่ที่ชื่อซ้ำกับกลุ่ม (เช่น คอร์สประถมที่หมวดหมู่คือ "ประถม") แสดงครั้งเดียว · หน้ารายละเอียดคอร์สใช้ด้วย */
export function courseEyebrow(course: Course, site: Site): string {
  const groupName = groupLabel(site, course.group)
  const category = course.category
  return [groupName, SUBJECT_LABEL[course.subject], ...(category === groupName ? [] : [category])].join(' · ')
}

/**
 * % ที่ประหยัดของ SET ที่คุ้มที่สุดซึ่งมีคอร์สนี้ ปัดลงเหมือนป้ายบนการ์ด SET จะได้ไม่โฆษณาเกินจริง
 * 0 เมื่อคอร์สขายเดี่ยวอย่างเดียว หรือไม่อยู่ใน SET ไหนที่ถูกกว่าซื้อแยก
 */
export function bestSetPercent(course: Course, sets: CourseSet[], courses: Course[], site: Site): number {
  if (course.saleMode === 'standalone_only') return 0
  const containing = sets.filter((s) => s.courseSlugs.includes(course.slug))
  return Math.max(0, ...containing.map((s) => Math.floor(deriveSet(s, courses, site.config).savingsPercent)))
}

function setLabel(course: Course, bestPercent: number | undefined): string | undefined {
  if (bestPercent !== undefined && bestPercent >= WORTH_IT_PERCENT) return `มีใน SET · ประหยัดสูงสุด ${bestPercent}%`
  return course.setCodes.length > 0 ? `มีใน ${course.setCodes.length} SET` : undefined
}

/** inSets: ส่ง SET ทั้งหมดมาเมื่ออยากให้ป้ายบอกส่วนลดของ SET ที่คุ้มที่สุด (หน้ารายการ, คอร์สขายดี) */
export function buildCourseCard(course: Course, site: Site, inSets?: { sets: CourseSet[]; courses: Course[] }): CourseCard {
  const setCount = setLabel(course, inSets && bestSetPercent(course, inSets.sets, inSets.courses, site))
  const groupName = groupLabel(site, course.group)
  const subject = SUBJECT_LABEL[course.subject]
  const facts = statsLine(course.stats)
  const teacher = site.instructors.find((i) => i.slug === course.instructorSlug)?.name

  return {
    slug: course.slug,
    href: `/courses/${course.slug}`,
    title: course.title,
    tagline: course.tagline,
    label: courseBadge(course, groupName),
    eyebrow: courseEyebrow(course, site),
    subject,
    ...(teacher && { teacher }),
    cover: cover(course.group, course.coverImage),
    price: formatBaht(course.price),
    ...(facts && { facts }),
    ...(setCount && { setCount }),
    lifetime: lifetimeLabel(site),
  }
}
