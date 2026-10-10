// ข้อมูลหน้ารายละเอียดคอร์ส: ช่องที่ไม่มีข้อมูลถูกตัดทิ้งที่นี่แล้ว หน้า React ไม่ต้องเช็กเอง

import { setsContaining, type Course, type CourseSet, type Site } from '@content/types'
import type { ContactItem } from '@/contact'
import type { Content } from './catalog'
import { buildSetCard, type SetCard } from './set-card'
import { cover, formatBaht, groupLabel, groupLink, lifetimeLabel, nonEmpty, statsRow, type Cover, type Faq, type NavLink, type Stat } from './format'

export type CourseInstructor = { name: string; role: string; bio: string; photo?: string }

/** ส่วน "เนื้อหาในคอร์ส" · ทั้งก้อนเป็น undefined เมื่อไม่มีทั้งหัวข้อและบท */
export type CourseContent = {
  points?: string[]
  /** เช่น "6 บท" */
  chapterCount?: string
  /** เช่น "บทที่ 1 · เซลล์" */
  chapters?: string[]
}

export type CourseDetail = {
  slug: string
  title: string
  tagline: string
  group: NavLink
  category: string
  /** ป้ายบนหัวหน้า เช่น "ม.ปลาย · สอวน." · หมวดหมู่ชื่อซ้ำกับกลุ่มแสดงครั้งเดียว */
  badge: string
  cover: Cover
  /** ไม่มีค่าเมื่อคอร์สเปิดรับตามปกติ */
  statusLabel?: string
  /** ราคาเดียว คอร์สเดี่ยวไม่มีราคาขีดฆ่า */
  price: string
  /** เช่น "ดูได้ไม่จำกัดอายุ" */
  lifetime: string
  /** ข้อสอบ / หน้า PDF / ชั่วโมงวิดีโอ เฉพาะตัวที่มีค่า */
  stats: Stat[]
  content?: CourseContent
  forWho?: string[]
  deliverables?: string
  instructor?: CourseInstructor
  faqs: Faq[]
  contactItem: ContactItem
  /** กล่อง "ซื้อเป็นเซ็ตคุ้มกว่า" · ไม่มีค่าเมื่อคอร์สไม่อยู่ในเซ็ตไหน หรือขายเดี่ยวเท่านั้น */
  sets?: CourseSets
}

/** เซ็ตที่มีคอร์สนี้ เรียงจากประหยัดมากไปน้อย */
export type CourseSets = {
  /** 3 เซ็ตแรกที่แสดงทันที */
  top: SetCard[]
  /** เซ็ตที่เหลือ กางดูในหน้าเดิม · ไม่มีค่าเมื่อคอร์สอยู่ไม่เกิน 3 เซ็ต ไม่ต้องมีปุ่ม */
  more?: { label: string; sets: SetCard[] }
}

const TOP_SETS = 3

/** รายการที่ว่างหรือมีแต่ช่องว่าง คืน undefined ให้หน้าซ่อน section นั้น */
function nonEmptyList(items: string[]): string[] | undefined {
  const kept = items.map((i) => i.trim()).filter(Boolean)
  return kept.length > 0 ? kept : undefined
}

function courseContent(course: Course): CourseContent | undefined {
  const points = nonEmptyList(course.contentPoints)
  const chapters = nonEmptyList(course.chapters.map((c) => c.title))
  if (!points && !chapters) return undefined
  return {
    ...(points && { points }),
    ...(chapters && {
      chapterCount: `${chapters.length} บท`,
      chapters: chapters.map((title, i) => `บทที่ ${i + 1} · ${title}`),
    }),
  }
}

/** เช่น "ม.ปลาย · สอวน." · หมวดหมู่ชื่อซ้ำกับกลุ่มแสดงครั้งเดียว · การ์ดคอร์สใช้ด้วย */
export function courseBadge(course: Course, groupName: string): string {
  return course.category === groupName ? groupName : `${groupName} · ${course.category}`
}

function courseInstructor(course: Course, site: Site): CourseInstructor | undefined {
  const instructor = site.instructors.find((i) => i.slug === course.instructorSlug)
  if (!instructor) return undefined
  const photo = nonEmpty(instructor.photoAvatar)
  return { name: instructor.name, role: instructor.role, bio: instructor.shortBio, ...(photo && { photo }) }
}

function courseSets(course: Course, sets: CourseSet[], courses: Course[], site: Site): CourseSets | undefined {
  if (course.saleMode === 'standalone_only') return undefined
  const found = setsContaining(course, sets, courses, site.config)
  if (found.length === 0) return undefined
  const cards = found.map(({ set, derived }) => buildSetCard(set, derived))
  const rest = cards.slice(TOP_SETS)
  return {
    top: cards.slice(0, TOP_SETS),
    ...(rest.length > 0 && { more: { label: `ดูอีก ${rest.length} เซ็ต`, sets: rest } }),
  }
}

export function buildCourseDetail(course: Course, { site, sets, courses }: Pick<Content, 'site' | 'sets' | 'courses'>): CourseDetail {
  const groupName = groupLabel(site, course.group)

  return {
    slug: course.slug,
    title: nonEmpty(course.fullTitle) ?? course.title,
    tagline: course.tagline,
    group: groupLink(course.group, groupName),
    category: course.category,
    badge: courseBadge(course, groupName),
    cover: cover(course.group, course.coverImage),
    price: formatBaht(course.price),
    lifetime: lifetimeLabel(site),
    stats: statsRow(course.stats),
    content: courseContent(course),
    forWho: nonEmptyList(course.forWho),
    deliverables: nonEmpty(course.deliverables),
    instructor: courseInstructor(course, site),
    faqs: [...(course.faqs ?? []), ...site.faqs],
    contactItem: { kind: 'course', slug: course.slug, title: course.title },
    sets: courseSets(course, sets, courses, site),
  }
}
