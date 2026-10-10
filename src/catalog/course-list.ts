// หน้ารายการคอร์ส: การ์ดทุกใบคำนวณตอน build แล้วกรองตามตัวกรองใน URL
// ไฟล์นี้ต้องไม่ import ข้อมูลใน content/ ตรง ๆ เพราะหน้าเรียกใช้ฝั่ง client ด้วย (กรองตาม query string)

import type { Course, Group, Review, Site } from '@content/types'
import { buildCourseCard, type CourseCard } from './course-card'
import { listHref, type CourseFilters } from './course-filters'
import { nonEmpty, type Faq } from './format'
import { buildGroupTabs, type GroupTab } from './group-tabs'

export type { GroupTab }

/** ข้อมูลทั้งหมดที่หน้ารายการต้องใช้ ส่งจาก server ไป client ได้ (เป็น JSON ล้วน) */
export type CourseListIndex = {
  items: { group: Group; tracks: string[]; /** ข้อความที่ค้นหาได้ ตัวพิมพ์เล็กแล้ว */ text: string; card: CourseCard }[]
  /** แท็บกลุ่มตามลำดับใน site.json */
  groups: { key: Group; label: string }[]
  paging: Paging
}

/** โหลดเพิ่มเองเมื่อเลื่อน: ครั้งแรก first ใบ แล้วเพิ่มทีละ step ใบ (site.json → config) */
export type Paging = { first: number; step: number }

export type CourseList = {
  /** การ์ดที่ผ่านตัวกรอง เรียงตามลำดับในชีต */
  cards: CourseCard[]
  /** ตัวเลือกสายในตัวกรอง คำนวณจากข้อมูลจริงของกลุ่มที่เลือก (ทุกกลุ่มถ้าไม่ได้เลือก) ตามลำดับในชีต */
  trackOptions: string[]
  /** ไม่มีผลลัพธ์เลย ให้หน้าแสดงข้อความและปุ่มทักแอดมิน */
  empty: boolean
  /** ลิงก์ล้างตัวกรองทั้งหมด · ไม่มีค่าเมื่อไม่ได้กรองอะไรอยู่ */
  clearHref?: string
  /** เช่น "พบ 24 คอร์ส" */
  resultText: string
  tabs: GroupTab[]
  paging: Paging
}

export function buildCourseListIndex(courses: Course[], site: Site): CourseListIndex {
  return {
    items: courses.map((c) => ({
      group: c.group,
      tracks: c.tracks,
      text: [c.title, c.tagline, c.category, ...c.tracks].join(' ').toLowerCase(),
      card: buildCourseCard(c, site),
    })),
    groups: site.groups.map((g) => ({ key: g.key, label: g.label })),
    paging: { first: site.config.listPageSize, step: site.config.listPageIncrement },
  }
}

export function filterCourseList(index: CourseListIndex, filters: CourseFilters): CourseList {
  const words = (filters.q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const inGroup = (item: CourseListIndex['items'][number]) => !filters.group || item.group === filters.group
  const matches = (item: CourseListIndex['items'][number]) =>
    inGroup(item) &&
    (!filters.track || item.tracks.includes(filters.track)) &&
    words.every((w) => item.text.includes(w))
  const cards = index.items.filter(matches).map((item) => item.card)
  const countIn = (group?: Group) => index.items.filter((item) => !group || item.group === group).length
  // เปลี่ยนกลุ่มแล้วสายที่เลือกไว้หายไป (สายผูกกับกลุ่ม) แต่คำค้นหาอยู่
  const tabHref = (group?: Group) => listHref({ ...(group && { group }), ...(filters.q && { q: filters.q }) })
  const tabs = buildGroupTabs({ groups: index.groups, active: filters.group, unit: 'คอร์ส', countIn, hrefFor: tabHref })
  const trackOptions = [...new Set(index.items.filter(inGroup).flatMap((item) => item.tracks))]
  const filtered = Boolean(filters.group || filters.track || words.length)
  return {
    cards,
    trackOptions,
    empty: cards.length === 0,
    ...(filtered && { clearHref: listHref({}) }),
    resultText: cards.length === 0 ? 'ไม่พบคอร์สที่ตรงกับที่ค้นหา' : `พบ ${cards.length} คอร์ส`,
    tabs,
    paging: index.paging,
  }
}

/** การ์ด "ไม่แน่ใจว่าเรียนอะไรดี" ท้ายหน้า · กดแล้วไปรายการที่กรองไว้ */
export type GoalLink = { title: string; desc: string; href: string }

/** รีวิวหนึ่งใบ · cover ไม่มีค่าเมื่อยังไม่มีรูปปกรีวิว ให้ใช้กล่องสีที่มีชื่อผู้รีวิวแทน */
export type ReviewQuote = { quote: string; /** เช่น "น้องมายด์ · ม.5" */ by: string; name: string; cover?: string }

export function buildReviewQuote(r: Review): ReviewQuote {
  const cover = nonEmpty(r.coverImage)
  return { quote: r.quote, by: `${r.studentName} · ${r.grade}`, name: r.studentName, ...(cover && { cover }) }
}

/** ส่วนท้ายหน้ารายการคอร์ส ที่ไม่ขึ้นกับตัวกรอง */
export type CoursesPage = {
  goals: GoalLink[]
  /** ว่างเมื่อ reviews.json ว่าง ให้ซ่อนทั้งส่วน */
  reviews: ReviewQuote[]
  faqs: Faq[]
  /** ไม่มีค่าเมื่อ site.json เว้นว่าง ให้ซ่อนบรรทัดนั้น */
  hours?: string
}

export function buildCoursesPage(site: Site, reviews: Review[]): CoursesPage {
  const hours = nonEmpty(site.contact.hours)
  return {
    // สายของคอร์สคือหมวดหมู่ของมันเมื่อชีตไม่ระบุ ลิงก์จึงกรองด้วยสายจาก category ของการ์ด
    goals: site.goalCards.map((g) => ({
      title: g.title,
      desc: g.desc,
      href: listHref({ ...(g.filter.group && { group: g.filter.group }), ...(g.filter.category && { track: g.filter.category }) }),
    })),
    reviews: reviews.map(buildReviewQuote),
    faqs: site.faqs,
    ...(hours && { hours }),
  }
}
