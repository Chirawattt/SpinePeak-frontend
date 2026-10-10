// การ์ดคอร์สหนึ่งใบ ใช้ในหน้าเซ็ต และหน้ารายการคอร์สต่อไป

import type { Course, Site } from '@content/types'
import { courseBadge, courseStatusLabel } from './course-detail'
import { cover, formatBaht, groupLabel, lifetimeLabel, statsLine, SUBJECT_LABEL, type Cover } from './format'

export type CourseCard = {
  slug: string
  /** หน้ารายละเอียดคอร์ส */
  href: string
  title: string
  tagline: string
  /** เช่น "ม.ปลาย · สอวน." */
  label: string
  /** ป้ายวิชา เช่น "ชีววิทยา" */
  subject: string
  cover: Cover
  /** ราคาเดี่ยวของคอร์ส */
  price: string
  /** เช่น "150 ข้อ · 6 ชม." · ไม่มีค่าเมื่อคอร์สไม่มีตัวเลขเลย */
  facts?: string
  /** เช่น "ดูได้ไม่จำกัดอายุ" */
  lifetime: string
  statusLabel?: string
}

export function buildCourseCard(course: Course, site: Site): CourseCard {
  const groupName = groupLabel(site, course.group)
  const facts = statsLine(course.stats)
  const statusLabel = courseStatusLabel(course)

  return {
    slug: course.slug,
    href: `/courses/${course.slug}`,
    title: course.title,
    tagline: course.tagline,
    label: courseBadge(course, groupName),
    subject: SUBJECT_LABEL[course.subject],
    cover: cover(course.group, course.coverImage),
    price: formatBaht(course.price),
    ...(facts && { facts }),
    lifetime: lifetimeLabel(site),
    ...(statusLabel && { statusLabel }),
  }
}
