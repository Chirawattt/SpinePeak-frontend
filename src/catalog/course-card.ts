// การ์ดคอร์สหนึ่งใบ ใช้ในหน้ารายการคอร์ส หน้า SET และของแนะนำบนหน้าแรก

import type { Course, Site } from '@content/types'
import { courseBadge } from './course-detail'
import { cover, formatBaht, groupLabel, lifetimeLabel, statsLine, SUBJECT_LABEL, type Cover } from './format'

export type CourseCard = {
  slug: string
  /** หน้ารายละเอียดคอร์ส */
  href: string
  title: string
  tagline: string
  /** เช่น "มัธยมปลาย · สอวน." */
  label: string
  /** บรรทัดเล็กหัวการ์ด เช่น "มัธยมปลาย · ชีววิทยา · สอวน." (หัวข้อแรกของคอร์ส) */
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
  /** เช่น "มีใน 2 SET" · ไม่มีค่าเมื่อคอร์สไม่อยู่ใน SET ไหน */
  setCount?: string
  /** เช่น "ดูได้ไม่จำกัดอายุ" · ใช้บนรูป OG */
  lifetime: string
}

/** "{กลุ่ม} · {วิชา} · {หัวข้อแรก}" · หัวข้อที่ชื่อซ้ำกับกลุ่ม (เช่น คอร์สประถมที่หัวข้อคือ "ประถม") แสดงครั้งเดียว · หน้ารายละเอียดคอร์สใช้ด้วย */
export function courseEyebrow(course: Course, site: Site): string {
  const groupName = groupLabel(site, course.group)
  const topic = course.topics[0] ?? course.category
  return [groupName, SUBJECT_LABEL[course.subject], ...(topic === groupName ? [] : [topic])].join(' · ')
}

export function buildCourseCard(course: Course, site: Site): CourseCard {
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
    ...(course.setCodes.length > 0 && { setCount: `มีใน ${course.setCodes.length} SET` }),
    lifetime: lifetimeLabel(site),
  }
}
