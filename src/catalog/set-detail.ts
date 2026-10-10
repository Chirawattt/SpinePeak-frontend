// ข้อมูลหน้ารายละเอียด SET ตาม docs/design-set-detail.dc.html
// ตัวเลขราคาและยอดรวมคำนวณจากคอร์สจริงที่นี่ ไม่มีตัวเลขพิมพ์มือ · ส่วนที่ไม่มีข้อมูลถูกตัดทิ้งที่นี่แล้ว

import { deriveSet, formatPages, type Course, type CourseSet, type Review, type Site } from '@content/types'
import type { ContactItem } from '@/contact'
import { buildCourseCard, type CourseCard } from './course-card'
import type { CoursePreview } from './course-detail'
import { buildReviewQuote, type ReviewQuote } from './course-list'
import { cover, formatBaht, groupLabel, groupLink, lifetimeLabel, nonEmpty, statsRow, SUBJECT_LABEL, type Cover, type NavLink, type Stat } from './format'
import { setSavings, type SetSavings } from './set-card'
import { setTopics } from './set-list'
import { youtubeEmbedUrl } from './youtube'

/** ครูหนึ่งคนในกล่อง "ครูผู้สอน" · role เช่น "สอนชีววิทยา · เคมี" */
export type SetTeacher = { name: string; role: string; bio?: string; photo?: string }

/** การ์ด "สิ่งที่ได้รับ" หนึ่งใบ */
export type SetGet = { value: string; label: string; note: string }

export type SetDetail = {
  slug: string
  title: string
  tagline: string
  group: NavLink
  /** ป้ายที่สองบนหัว เช่น "มัธยมปลาย · ปรับพื้นฐาน · สอวน." */
  topicsLabel: string
  cover: Cover
  price: string
  /** ไม่มีค่าเมื่อ SET ไม่ได้ถูกกว่าซื้อแยก */
  savings?: SetSavings
  /** เช่น "ดูได้ไม่จำกัดอายุ" */
  lifetime: string
  /** เช่น "3 คอร์ส" */
  courseCount: string
  /** แถวตัวเลขบนหัว: จำนวนคอร์ส ยอดรวมของทุกคอร์ส และอายุคอร์ส */
  stats: Stat[]
  /** คลิปตัวอย่าง: ใช้คลิปของคอร์สแรกใน SET ที่มีคลิป */
  preview?: CoursePreview
  /** ราคาเดี่ยวทีละคอร์ส ในกล่อง "ถ้าซื้อแยกทีละคอร์ส" ของการ์ดราคา */
  breakdown: { title: string; price: string }[]
  /** คอร์สใน SET เรียงตามลำดับที่แนะนำ (ลำดับในชีต) */
  courses: CourseCard[]
  gets: SetGet[]
  /** "เหมาะกับใคร" ของทุกคอร์สรวมกัน ไม่ซ้ำ ไม่เกิน 4 ข้อ · ไม่มีค่าเมื่อว่าง */
  forWho?: string[]
  /** "ครูผู้สอน" หรือ "ทีมครูผู้สอน" */
  teachersHeading: string
  teachers: SetTeacher[]
  /** รีวิวของทุกคอร์สใน SET รวมกัน · ว่าง = ซ่อนการ์ดรีวิว */
  reviews: ReviewQuote[]
  contactItem: ContactItem
}

const FOR_WHO = 4

export function buildSetDetail(set: CourseSet, courses: Course[], site: Site, reviews: Review[] = []): SetDetail {
  const groupName = groupLabel(site, set.group)
  const derived = deriveSet(set, courses, site.config)
  // เรียงตาม courseSlugs ของ SET · slug ที่ไม่มีอยู่ validateContent() จับไปแล้วตอน build
  const bySlug = new Map(courses.map((c) => [c.slug, c]))
  const members = set.courseSlugs.map((slug) => bySlug.get(slug)).filter((c): c is Course => c != null)
  const topics = setTopics(members).filter((t) => t !== groupName)
  const totals = statsRow(derived.totals, { video: 'วิดีโอรวม', pdf: 'ไฟล์ PDF', questions: 'โจทย์พร้อมเฉลย' })
  const savings = setSavings(derived)
  const preview = setPreview(members, site)
  const forWho = [...new Set(members.flatMap((c) => c.forWho.map((w) => w.trim())).filter(Boolean))].slice(0, FOR_WHO)
  const teachers = setTeachers(members, site)
  const memberSlugs = new Set(set.courseSlugs)

  return {
    slug: set.slug,
    title: set.title,
    tagline: set.tagline,
    group: groupLink(set.group, groupName),
    topicsLabel: [groupName, ...topics].join(' · '),
    cover: cover(set.group, set.coverImage),
    price: formatBaht(set.price),
    ...(savings && { savings }),
    lifetime: lifetimeLabel(site),
    courseCount: `${derived.courseCount} คอร์ส`,
    stats: [{ value: String(derived.courseCount), label: 'คอร์สในชุด' }, ...totals, { value: 'ไม่จำกัด', label: 'อายุคอร์ส' }],
    ...(preview && { preview }),
    breakdown: members.map((c) => ({ title: c.title, price: formatBaht(c.price) })),
    courses: members.map((c) => buildCourseCard(c, site)),
    gets: setGets(derived.totals),
    ...(forWho.length > 0 && { forWho }),
    teachersHeading: teachers.length > 1 ? 'ทีมครูผู้สอน' : 'ครูผู้สอน',
    teachers,
    reviews: reviews.filter((r) => r.courseSlug && memberSlugs.has(r.courseSlug)).map(buildReviewQuote),
    contactItem: { kind: 'set', slug: set.slug, title: set.title },
  }
}

function setPreview(members: Course[], site: Site): CoursePreview | undefined {
  const embedUrl = members.map((c) => youtubeEmbedUrl(c.previewVideoUrl ?? '')).find(Boolean)
  if (!embedUrl) return undefined
  const channelUrl = nonEmpty(site.contact.youtubeChannelUrl)
  return { embedUrl, ...(channelUrl && { channelUrl }) }
}

/** การ์ด "สิ่งที่ได้รับ" จากยอดรวมจริง · ช่องที่ไม่มีตัวเลขไม่แสดง แต่อายุคอร์สแสดงเสมอ */
function setGets({ videoHours, pdfPages, questionCount }: Course['stats']): SetGet[] {
  const pages = formatPages(pdfPages)
  return [
    ...(pages ? [{ value: pages, label: 'ไฟล์ PDF', note: 'เอกสารสรุปและข้อสอบ ดาวน์โหลดเก็บได้' }] : []),
    ...(videoHours ? [{ value: `${videoHours} ชม.`, label: 'คลิปวิดีโอ', note: 'อธิบายทีละบท ดูซ้ำได้ไม่จำกัด' }] : []),
    ...(questionCount ? [{ value: `${questionCount} ข้อ`, label: 'โจทย์พร้อมเฉลย', note: 'เฉลยละเอียดพร้อมวิธีคิดทุกข้อ' }] : []),
    { value: 'ไม่จำกัด', label: 'ระยะเวลาเข้าเรียน', note: 'ดูย้อนหลังได้ตลอด ทั้งคอมและมือถือ' },
  ]
}

/** ครูทุกคนที่สอนคอร์สใน SET ตามลำดับคอร์ส พร้อมวิชาที่แต่ละคนสอนใน SET นี้ */
function setTeachers(members: Course[], site: Site): SetTeacher[] {
  const slugs = [...new Set(members.map((c) => c.instructorSlug))]
  return slugs.flatMap((slug) => {
    const instructor = site.instructors.find((i) => i.slug === slug)
    if (!instructor) return []
    const subjects = [...new Set(members.filter((c) => c.instructorSlug === slug).map((c) => SUBJECT_LABEL[c.subject]))]
    const bio = nonEmpty(instructor.shortBio)
    const photo = nonEmpty(instructor.photoAvatar)
    return [{ name: instructor.name, role: `สอน${subjects.join(' · ')}`, ...(bio && { bio }), ...(photo && { photo }) }]
  })
}
