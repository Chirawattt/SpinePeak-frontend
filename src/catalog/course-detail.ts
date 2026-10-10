// ข้อมูลหน้ารายละเอียดคอร์ส ตาม docs/design-course-detail.dc.html
// ช่องที่ไม่มีข้อมูลถูกตัดทิ้งที่นี่แล้ว หน้า React ไม่ต้องเช็กเอง

import { setsContaining, type Course, type CourseSet, type Site } from '@content/types'
import type { ContactItem } from '@/contact'
import type { Content } from './catalog'
import { courseEyebrow } from './course-card'
import { buildReviewQuote, type ReviewQuote } from './course-list'
import { cover, formatBaht, groupLabel, groupLink, lifetimeLabel, nonEmpty, statsLine, statsRow, SUBJECT_LABEL, type Cover, type NavLink, type Stat } from './format'
import { buildSetCard, type SetCard } from './set-card'
import { youtubeEmbedUrl } from './youtube'

export type CourseInstructor = { name: string; /** เช่น "ผู้สอนวิชาชีววิทยา" */ role: string; bio: string; photo?: string }

/** ส่วน "เนื้อหาในคอร์ส" · ไม่มีค่าเมื่อไม่มีทั้งบทและหัวข้อเนื้อหา */
export type CourseContent = {
  /** บรรทัดใต้หัวข้อ เช่น "VDO 10 ชม. · PDF 86 หน้า · 100 ข้อ" · ไม่มีค่าเมื่อไม่มีตัวเลข */
  meta?: string
  /** แสดงเป็นแถวมีเลข 01, 02, … · ใช้ชื่อบทถ้ามี ไม่มีก็ใช้หัวข้อเนื้อหา */
  items: string[]
}

/** คลิปตัวอย่างในส่วนหัว */
export type CoursePreview = { embedUrl: string; /** ลิงก์ "ดูช่อง YouTube" · ไม่มีค่าเมื่อ site.json ยังไม่มีลิงก์ช่อง */ channelUrl?: string }

/** การ์ด SET หนึ่งใบในคอลัมน์ขวา */
export type SetOffer = SetCard & { /** หัวการ์ด เช่น "ซื้อเป็น SET คุ้มกว่า" */ label: string }

/** SET ที่มีคอร์สนี้ · ไม่มีค่าเมื่อคอร์สไม่อยู่ใน SET ไหน หรือขายเดี่ยวเท่านั้น */
export type CourseSets = {
  /** ไม่เกิน 2 ใบ เริ่มจาก SET ที่เล็กที่สุด (ต่อยอดง่ายสุด) */
  offers: SetOffer[]
  /** "ดูอีก N SET ที่มีคอร์สนี้ →" ไปหน้ารายการ SET ที่ค้นด้วยชื่อคอร์ส · ไม่มีค่าเมื่อไม่มี SET เหลือ */
  more?: { label: string; href: string }
}

export type CourseDetail = {
  slug: string
  title: string
  tagline: string
  group: NavLink
  /** ป้ายบนหัวหน้า เช่น "มัธยมปลาย · ชีววิทยา · สอวน." */
  badge: string
  cover: Cover
  /** ราคาเดียว คอร์สเดี่ยวไม่มีราคาขีดฆ่า */
  price: string
  /** บรรทัดใต้ราคา เช่น "ไฟล์ PDF + คลิปวิดีโอ (ไม่จำกัดอายุ)" · ไม่มีค่าเมื่อชีตเว้นว่าง */
  deliverables?: string
  /** เช่น "ดูได้ไม่จำกัดอายุ" */
  lifetime: string
  /** วิดีโอ / หน้า PDF / ข้อ เฉพาะตัวที่มีค่า ปิดท้ายด้วยอายุคอร์สเสมอ */
  stats: Stat[]
  preview?: CoursePreview
  content?: CourseContent
  forWho?: string[]
  instructor?: CourseInstructor
  /** รีวิวที่ผูกกับคอร์สนี้ · ว่าง = ซ่อนการ์ดรีวิว */
  reviews: ReviewQuote[]
  contactItem: ContactItem
  sets?: CourseSets
}

const SET_OFFERS = 2
const OFFER_LABELS = ['ซื้อเป็น SET คุ้มกว่า', 'หรือเลือก SET ที่ครบกว่า']

/** รายการที่ว่างหรือมีแต่ช่องว่าง คืน undefined ให้หน้าซ่อน section นั้น */
function nonEmptyList(items: string[]): string[] | undefined {
  const kept = items.map((i) => i.trim()).filter(Boolean)
  return kept.length > 0 ? kept : undefined
}

function courseContent(course: Course): CourseContent | undefined {
  const items = nonEmptyList(course.chapters.map((c) => c.title)) ?? nonEmptyList(course.contentPoints)
  if (!items) return undefined
  const meta = statsLine(course.stats)
  return { ...(meta && { meta }), items }
}

/** เช่น "ม.ปลาย · สอวน." · หมวดหมู่ชื่อซ้ำกับกลุ่มแสดงครั้งเดียว · การ์ดคอร์สและรูป OG ใช้ */
export function courseBadge(course: Course, groupName: string): string {
  return course.category === groupName ? groupName : `${groupName} · ${course.category}`
}

function courseInstructor(course: Course, site: Site): CourseInstructor | undefined {
  const instructor = site.instructors.find((i) => i.slug === course.instructorSlug)
  if (!instructor) return undefined
  const photo = nonEmpty(instructor.photoAvatar)
  return { name: instructor.name, role: `ผู้สอนวิชา${SUBJECT_LABEL[course.subject]}`, bio: instructor.shortBio, ...(photo && { photo }) }
}

function coursePreview(course: Course, site: Site): CoursePreview | undefined {
  const embedUrl = youtubeEmbedUrl(course.previewVideoUrl ?? '')
  if (!embedUrl) return undefined
  const channelUrl = nonEmpty(site.contact.youtubeChannelUrl)
  return { embedUrl, ...(channelUrl && { channelUrl }) }
}

function courseSets(course: Course, sets: CourseSet[], courses: Course[], site: Site): CourseSets | undefined {
  if (course.saleMode === 'standalone_only') return undefined
  // setsContaining เรียงจากประหยัดมากไปน้อยแล้ว · sort คงลำดับนั้นไว้เมื่อจำนวนคอร์สเท่ากัน
  const found = [...setsContaining(course, sets, courses, site.config)].sort((a, b) => a.derived.courseCount - b.derived.courseCount)
  if (found.length === 0) return undefined
  const offers = found.slice(0, SET_OFFERS).map(({ set, derived }, i) => ({ ...buildSetCard(set, derived), label: OFFER_LABELS[i] ?? '' }))
  const rest = found.length - offers.length
  return {
    offers,
    ...(rest > 0 && { more: { label: `ดูอีก ${rest} SET ที่มีคอร์สนี้`, href: `/sets?q=${encodeURIComponent(course.title)}` } }),
  }
}

export function buildCourseDetail(
  course: Course,
  { site, sets, courses, reviews }: Pick<Content, 'site' | 'sets' | 'courses' | 'reviews'>,
): CourseDetail {
  const groupName = groupLabel(site, course.group)
  const deliverables = nonEmpty(course.deliverables)
  const preview = coursePreview(course, site)
  const content = courseContent(course)
  const forWho = nonEmptyList(course.forWho)
  const instructor = courseInstructor(course, site)
  const offered = courseSets(course, sets, courses, site)

  return {
    slug: course.slug,
    title: nonEmpty(course.fullTitle) ?? course.title,
    tagline: course.tagline,
    group: groupLink(course.group, groupName),
    badge: courseEyebrow(course, site),
    cover: cover(course.group, course.coverImage),
    price: formatBaht(course.price),
    ...(deliverables && { deliverables }),
    lifetime: lifetimeLabel(site),
    stats: [...statsRow(course.stats, { video: 'วิดีโอทั้งหมด', pdf: 'ไฟล์ PDF', questions: 'เฉลยละเอียด' }), { value: 'ไม่จำกัด', label: 'อายุคอร์ส' }],
    ...(preview && { preview }),
    ...(content && { content }),
    ...(forWho && { forWho }),
    ...(instructor && { instructor }),
    reviews: reviews.filter((r) => r.courseSlug === course.slug).map(buildReviewQuote),
    contactItem: { kind: 'course', slug: course.slug, title: course.title },
    ...(offered && { sets: offered }),
  }
}
