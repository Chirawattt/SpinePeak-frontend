// ข้อมูลหน้ารายละเอียดเซ็ต: ตัวเลขราคาและยอดรวมคำนวณจากคอร์สจริงที่นี่ ไม่มีตัวเลขพิมพ์มือ

import { deriveSet, type Course, type CourseSet, type Site } from '@content/types'
import type { ContactItem } from '@/contact'
import { buildCourseCard, type CourseCard } from './course-card'
import { setSavings, type SetSavings } from './set-card'
import { cover, formatBaht, groupLabel, groupLink, lifetimeLabel, statsRow, SUBJECT_LABEL, type Cover, type Faq, type NavLink, type Stat } from './format'

export type SetDetail = {
  slug: string
  /** ป้ายรหัสเซ็ต เช่น "เซ็ต NAT-01" · รหัสใช้บนป้ายเท่านั้น URL ใช้ slug (ADR 0002) */
  codeLabel: string
  title: string
  tagline: string
  group: NavLink
  cover: Cover
  /** ไม่มีค่าเมื่อเซ็ตเปิดรับตามปกติ */
  statusLabel?: string
  price: string
  /** ไม่มีค่าเมื่อประหยัดไม่ถึงเกณฑ์ใน site.json ให้แสดงราคาเซ็ตราคาเดียว ไม่ขีดฆ่า */
  savings?: SetSavings
  /** เช่น "ดูได้ไม่จำกัดอายุ" */
  lifetime: string
  /** เช่น "3 คอร์ส" */
  courseCount: string
  /** ทุกวิชาในเซ็ต เรียงตามคอร์สแรกที่สอนวิชานั้น เซ็ตหลายวิชา (เช่น NAT-01) ต้องบอกให้ครบ */
  subjects: string[]
  /** หัวของรายชื่อวิชา เช่น "ครบ 3 วิชา" หรือ "วิชา" เมื่อมีวิชาเดียว */
  subjectsHeading: string
  /** ยอดรวม ข้อสอบ / หน้า PDF / ชั่วโมงวิดีโอ ของทุกคอร์ส เฉพาะตัวที่มีค่า */
  stats: Stat[]
  /** การ์ดคอร์สในเซ็ต เรียงตาม courseSlugs */
  courses: CourseCard[]
  faqs: Faq[]
  contactItem: ContactItem
}

export function buildSetDetail(set: CourseSet, courses: Course[], site: Site): SetDetail {
  const groupName = groupLabel(site, set.group)
  const derived = deriveSet(set, courses, site.config)
  // เรียงตาม courseSlugs ของเซ็ต · slug ที่ไม่มีอยู่ validateContent() จับไปแล้วตอน build
  const bySlug = new Map(courses.map((c) => [c.slug, c]))
  const members = set.courseSlugs.map((slug) => bySlug.get(slug)).filter((c): c is Course => c != null)
  const subjects = [...new Set(members.map((c) => SUBJECT_LABEL[c.subject]))]

  return {
    slug: set.slug,
    codeLabel: `SET ${set.code}`,
    title: set.title,
    tagline: set.tagline,
    group: groupLink(set.group, groupName),
    cover: cover(set.group, set.coverImage),
    price: formatBaht(set.price),
    savings: setSavings(derived),
    lifetime: lifetimeLabel(site),
    courseCount: `${derived.courseCount} คอร์ส`,
    subjects,
    subjectsHeading: subjects.length > 1 ? `ครบ ${subjects.length} วิชา` : 'วิชา',
    stats: statsRow(derived.totals),
    courses: members.map((c) => buildCourseCard(c, site)),
    faqs: site.faqs,
    contactItem: { kind: 'set', slug: set.slug, title: set.title },
  }
}
