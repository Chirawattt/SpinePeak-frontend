// หน้ารายการคอร์ส: การ์ดทุกใบคำนวณตอน build แล้วกรองตามตัวกรองใน URL
// ไฟล์นี้ต้องไม่ import ข้อมูลใน content/ ตรง ๆ เพราะหน้าเรียกใช้ฝั่ง client ด้วย (กรองตาม query string)

import type { Course, Group, Review, Site } from '@content/types'
import { buildCourseCard, type CourseCard } from './course-card'
import { listHref, type CourseFilters } from './course-filters'
import { nonEmpty, SUBJECT_LABEL, type Faq } from './format'
import { buildGroupTabs, type GroupTab } from './group-tabs'

export type { GroupTab }

/** ข้อมูลทั้งหมดที่หน้ารายการต้องใช้ ส่งจาก server ไป client ได้ (เป็น JSON ล้วน) */
export type CourseListIndex = {
  items: { group: Group; category: string; /** ข้อความที่ค้นหาได้ ตัวพิมพ์เล็กแล้ว */ text: string; card: CourseCard }[]
  /** แท็บกลุ่มตามลำดับใน site.json */
  groups: { key: Group; label: string }[]
  paging: Paging
}

/** โหลดเพิ่มเองเมื่อเลื่อน: ครั้งแรก first ใบ แล้วเพิ่มทีละ step ใบ (site.json → config) */
export type Paging = { first: number; step: number }

export type CourseList = {
  /** การ์ดที่ผ่านตัวกรอง เรียงตามลำดับในชีต */
  cards: CourseCard[]
  /** ตัวเลือกหมวดหมู่ในตัวกรอง คำนวณจากข้อมูลจริงของกลุ่มที่เลือก (ทุกกลุ่มถ้าไม่ได้เลือก) ตามลำดับในชีต */
  categoryOptions: string[]
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
      category: c.category,
      // ค้นได้ทั้งชื่อ คำโปรย หมวดหมู่ วิชา และชื่อบท (เช่น พิมพ์ "พันธุศาสตร์" แล้วเจอคอร์สที่มีบทนั้น)
      text: [c.title, c.tagline, c.category, SUBJECT_LABEL[c.subject], ...c.chapters.map((ch) => ch.title)].join(' ').toLowerCase(),
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
    (!filters.category || item.category === filters.category) &&
    words.every((w) => item.text.includes(w))
  const cards = index.items.filter(matches).map((item) => item.card)
  const countIn = (group?: Group) => index.items.filter((item) => !group || item.group === group).length
  // เปลี่ยนกลุ่มแล้วหมวดหมู่ที่เลือกไว้หายไป (หมวดหมู่ผูกกับกลุ่ม) แต่คำค้นหาอยู่
  const tabHref = (group?: Group) => listHref({ ...(group && { group }), ...(filters.q && { q: filters.q }) })
  const tabs = buildGroupTabs({ groups: index.groups, active: filters.group, unit: 'คอร์ส', countIn, hrefFor: tabHref })
  const categoryOptions = [...new Set(index.items.filter(inGroup).map((item) => item.category))]
  const filtered = Boolean(filters.group || filters.category || words.length)
  return {
    cards,
    categoryOptions,
    empty: cards.length === 0,
    ...(filtered && { clearHref: listHref({}) }),
    resultText: `พบ ${cards.length} คอร์ส`,
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
  /** ช่องทางรองในกล่องติดต่อ · ไม่มีค่าเมื่อ site.json ไม่มี ให้ซ่อนปุ่มนั้น */
  instagramHref?: string
  email?: string
}

export function buildCoursesPage(site: Site, reviews: Review[]): CoursesPage {
  const hours = nonEmpty(site.contact.hours)
  const instagramHref = nonEmpty(site.contact.instagram?.url)
  const email = nonEmpty(site.contact.email)
  return {
    goals: site.goalCards.map((g) => ({ title: g.title, desc: g.desc, href: listHref(g.filter) })),
    // หน้านี้โชว์แค่ 3 ใบแรก ตาม design (หน้าแรกมีแถบรีวิวเต็ม)
    reviews: reviews.slice(0, 3).map(buildReviewQuote),
    faqs: site.coursesFaqs,
    ...(hours && { hours }),
    ...(instagramHref && { instagramHref }),
    ...(email && { email }),
  }
}
