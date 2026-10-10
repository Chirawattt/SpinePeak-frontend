// หน้ารายการ SET: การ์ดทุกใบคำนวณตอน build แล้วกรองตามตัวกรองใน URL
// ไฟล์นี้ต้องไม่ import ข้อมูลใน content/ ตรง ๆ เพราะหน้าเรียกใช้ฝั่ง client ด้วย (กรองตาม query string)

import { deriveSet, formatPages, type Course, type CourseSet, type Group, type Site } from '@content/types'
import type { Paging } from './course-list'
import { listHref, parseFilters, type CourseFilters } from './course-filters'
import { cover, formatBaht, groupLabel, nonEmpty, statsLine, type Cover } from './format'
import { buildGroupTabs, type GroupTab } from './group-tabs'
import { setSavings, type SetSavings } from './set-card'

/** หน้ารายการ SET กรองได้ทั้งกลุ่ม หัวข้อ และคำค้นหา เหมือนหน้ารายการคอร์ส */
export type SetFilters = CourseFilters

export function parseSetFilters(params: { get(name: string): string | null }): SetFilters {
  return parseFilters(params)
}

/** ปกคอร์สหนึ่งใบในกองปกบนหัวการ์ด · ไม่มีรูปก็ใช้ชื่อคอร์สแทน */
export type CoverTile = { title: string; image?: string }

/** การ์ด SET หนึ่งใบ · ใช้ทั้งหน้ารายการ SET และของแนะนำบนหน้าแรก */
export type SetListCard = {
  slug: string
  href: string
  /** เช่น "SET PR-01" */
  codeLabel: string
  title: string
  tagline: string
  /** เช่น "ประถม" */
  group: string
  /** บรรทัดเล็ก เช่น "มัธยมปลาย · ปรับพื้นฐาน · สอวน." (หัวข้อของทุกคอร์สใน SET รวมกัน) */
  eyebrow: string
  /** เช่น "2 คอร์ส" */
  courseCount: string
  /** ยอดรวมของคอร์สใน SET บรรทัดเดียว เช่น "VDO 20 ชม. · PDF 166 หน้า · 220 ข้อ" · ใช้บนการ์ดของแนะนำ */
  facts?: string
  /** ยอดรวมแยกช่องสำหรับการ์ดหน้ารายการ เช่น ["VDO 20 ชม.", "PDF 166 หน้า", "โจทย์ 220 ข้อ"] */
  stats: string[]
  cover: Cover
  /** 3 คอร์สท้ายสุด เรียงจากท้ายมาหน้า ซ้อนเป็นกองบนหัวการ์ด */
  stack: CoverTile[]
  /** จำนวนคอร์สที่ไม่อยู่ในกองปก ("+N") · 0 = ไม่ต้องแสดง */
  moreInStack: number
  /** 4 คอร์สแรกพร้อมราคาเดี่ยว */
  listed: { title: string; price: string }[]
  /** "และอีก N คอร์ส" · 0 = ไม่ต้องแสดง */
  moreListed: number
  price: string
  /** ไม่มีค่าเมื่อ SET ไม่ได้ถูกกว่าซื้อแยก */
  savings?: SetSavings
}

const STACK = 3
const LISTED = 4

/** หัวข้อของ SET = หัวข้อของทุกคอร์สใน SET รวมกัน ตามลำดับคอร์ส ไม่ซ้ำ (ดู CONTEXT.md) */
export function setTopics(members: Course[]): string[] {
  return [...new Set(members.flatMap((c) => c.topics))]
}

function membersOf(set: CourseSet, courses: Course[]): Course[] {
  const bySlug = new Map(courses.map((c) => [c.slug, c]))
  return set.courseSlugs.map((s) => bySlug.get(s)).filter((c): c is Course => Boolean(c))
}

export function buildSetListCard(set: CourseSet, courses: Course[], site: Site): SetListCard {
  const derived = deriveSet(set, courses, site.config)
  const members = membersOf(set, courses)
  const savings = setSavings(derived)
  const facts = statsLine(derived.totals)
  const groupName = groupLabel(site, set.group)
  const topics = setTopics(members).filter((t) => t !== groupName)
  const { videoHours, pdfPages, questionCount } = derived.totals
  const pages = formatPages(pdfPages)

  return {
    slug: set.slug,
    href: `/sets/${set.slug}`,
    codeLabel: `SET ${set.code}`,
    title: set.title,
    tagline: set.tagline,
    group: groupName,
    eyebrow: [groupName, ...topics].join(' · '),
    courseCount: `${derived.courseCount} คอร์ส`,
    ...(facts && { facts }),
    stats: [videoHours && `VDO ${videoHours} ชม.`, pages && `PDF ${pages}`, questionCount && `โจทย์ ${questionCount} ข้อ`].filter((s): s is string => Boolean(s)),
    cover: cover(set.group, set.coverImage),
    stack: members
      .slice(-STACK)
      .reverse()
      .map((c) => {
        const image = nonEmpty(c.coverImage)
        return { title: c.title, ...(image && { image }) }
      }),
    moreInStack: Math.max(0, members.length - STACK),
    listed: members.slice(0, LISTED).map((c) => ({ title: c.title, price: formatBaht(c.price) })),
    moreListed: Math.max(0, members.length - LISTED),
    price: formatBaht(set.price),
    ...(savings && { savings }),
  }
}

export type SetListIndex = {
  /** text = ข้อความที่ค้นหาได้ ตัวพิมพ์เล็กแล้ว */
  items: { group: Group; topics: string[]; text: string; card: SetListCard }[]
  groups: { key: Group; label: string }[]
  paging: Paging
}

export type SetList = {
  cards: SetListCard[]
  /** ตัวเลือกหัวข้อในตัวกรอง จาก SET ของกลุ่มที่เลือก (ทุกกลุ่มถ้าไม่ได้เลือก) */
  topicOptions: string[]
  /** เช่น "พบ 10 SET" */
  resultText: string
  tabs: GroupTab[]
  empty: boolean
  paging: Paging
}

export function buildSetListIndex(sets: CourseSet[], courses: Course[], site: Site): SetListIndex {
  return {
    items: sets.map((set) => {
      const members = membersOf(set, courses)
      return {
        group: set.group,
        topics: setTopics(members),
        // ค้นได้จากชื่อคอร์สที่อยู่ข้างในด้วย เช่น พิมพ์ "A-Level" เจอทุก SET ที่มีคอร์ส A-Level
        text: [set.title, set.tagline, set.code, ...members.map((c) => c.title)].join(' ').toLowerCase(),
        card: buildSetListCard(set, courses, site),
      }
    }),
    groups: site.groups.map((g) => ({ key: g.key, label: g.label })),
    paging: { first: site.config.listPageSize, step: site.config.listPageIncrement },
  }
}

export function filterSetList(index: SetListIndex, filters: SetFilters): SetList {
  const words = (filters.q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const inGroup = (item: SetListIndex['items'][number]) => !filters.group || item.group === filters.group
  const cards = index.items
    .filter((item) => inGroup(item) && (!filters.topic || item.topics.includes(filters.topic)) && words.every((w) => item.text.includes(w)))
    .map((item) => item.card)
  const countIn = (group?: Group) => index.items.filter((item) => !group || item.group === group).length
  // เปลี่ยนกลุ่มแล้วหัวข้อที่เลือกไว้หายไป (หัวข้อผูกกับกลุ่ม) แต่คำค้นหาอยู่
  const hrefFor = (group?: Group) => listHref({ ...(group && { group }), ...(filters.q && { q: filters.q }) }, '/sets')
  return {
    cards,
    topicOptions: [...new Set(index.items.filter(inGroup).flatMap((item) => item.topics))],
    resultText: `พบ ${cards.length} SET`,
    tabs: buildGroupTabs({ groups: index.groups, active: filters.group, unit: 'SET', countIn, hrefFor }),
    empty: cards.length === 0,
    paging: index.paging,
  }
}
