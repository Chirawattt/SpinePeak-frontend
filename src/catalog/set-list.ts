// หน้ารายการเซ็ต: การ์ดทุกใบคำนวณตอน build แล้วกรองตามตัวกรองใน URL
// ไฟล์นี้ต้องไม่ import ข้อมูลใน content/ ตรง ๆ เพราะหน้าเรียกใช้ฝั่ง client ด้วย (กรองตาม query string)

import { deriveSet, type Course, type CourseSet, type Group, type Site } from '@content/types'
import type { Paging } from './course-list'
import { listHref, parseFilters, type CourseFilters } from './course-filters'
import { cover, formatBaht, groupLabel, statsLine, type Cover } from './format'
import { buildGroupTabs, type GroupTab } from './group-tabs'
import { setSavings, type SetSavings } from './set-card'

/** หน้ารายการเซ็ตกรองได้แค่กลุ่มกับคำค้นหา */
export type SetFilters = Pick<CourseFilters, 'group' | 'q'>

/** query string → ตัวกรองของหน้ารายการเซ็ต · topic จากลิงก์หน้าคอร์สถูกทิ้ง */
export function parseSetFilters(params: { get(name: string): string | null }): SetFilters {
  const { group, q } = parseFilters(params)
  return { ...(group && { group }), ...(q && { q }) }
}

/** การ์ดเซ็ตหนึ่งใบในหน้ารายการ */
export type SetListCard = {
  slug: string
  href: string
  /** เช่น "เซ็ต PR-01" */
  codeLabel: string
  title: string
  tagline: string
  /** เช่น "ประถม" */
  group: string
  /** เช่น "2 คอร์ส" */
  courseCount: string
  /** ยอดรวมของคอร์สในเซ็ต เช่น "VDO 20 ชม. · PDF 166 หน้า · 220 ข้อ" · ไม่มีค่าเมื่อไม่มีตัวเลขเลย */
  facts?: string
  cover: Cover
  price: string
  /** ไม่มีค่าเมื่อประหยัดไม่ถึงเกณฑ์ใน site.json ให้แสดงราคาเซ็ตราคาเดียว ไม่ขีดฆ่า */
  savings?: SetSavings
  /** ไม่มีค่าเมื่อเซ็ตเปิดรับตามปกติ */
  statusLabel?: string
}

export type SetListIndex = {
  /** text = ข้อความที่ค้นหาได้ ตัวพิมพ์เล็กแล้ว */
  items: { group: Group; text: string; card: SetListCard }[]
  groups: { key: Group; label: string }[]
  paging: Paging
}

export type SetList = {
  cards: SetListCard[]
  /** เช่น "พบ 10 เซ็ต" */
  resultText: string
  tabs: GroupTab[]
  empty: boolean
  /** ลิงก์ล้างตัวกรองทั้งหมด · ไม่มีค่าเมื่อไม่ได้กรองอะไรอยู่ */
  clearHref?: string
  paging: Paging
}

/** การ์ดเซ็ตหนึ่งใบ · ใช้ทั้งหน้ารายการเซ็ตและส่วนของแนะนำบนหน้าแรก */
export function buildSetListCard(set: CourseSet, courses: Course[], site: Site): SetListCard {
  const derived = deriveSet(set, courses, site.config)
  const savings = setSavings(derived)
  const facts = statsLine(derived.totals)
  return {
    slug: set.slug,
    href: `/sets/${set.slug}`,
    codeLabel: `เซ็ต ${set.code}`,
    title: set.title,
    tagline: set.tagline,
    group: groupLabel(site, set.group),
    courseCount: `${derived.courseCount} คอร์ส`,
    ...(facts && { facts }),
    cover: cover(set.group, set.coverImage),
    price: formatBaht(set.price),
    ...(savings && { savings }),
  }
}

export function buildSetListIndex(sets: CourseSet[], courses: Course[], site: Site): SetListIndex {
  return {
    items: sets.map((set) => ({
      group: set.group,
      text: [set.title, set.tagline, set.code].join(' ').toLowerCase(),
      card: buildSetListCard(set, courses, site),
    })),
    groups: site.groups.map((g) => ({ key: g.key, label: g.label })),
    paging: { first: site.config.listPageSize, step: site.config.listPageIncrement },
  }
}

export function filterSetList(index: SetListIndex, filters: SetFilters): SetList {
  const words = (filters.q ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const cards = index.items
    .filter((item) => (!filters.group || item.group === filters.group) && words.every((w) => item.text.includes(w)))
    .map((item) => item.card)
  const countIn = (group?: Group) => index.items.filter((item) => !group || item.group === group).length
  const hrefFor = (group?: Group) => listHref({ ...(group && { group }), ...(filters.q && { q: filters.q }) }, '/sets')
  const filtered = Boolean(filters.group || words.length)
  return {
    cards,
    resultText: cards.length === 0 ? 'ไม่พบเซ็ตที่ตรงกับที่ค้นหา' : `พบ ${cards.length} เซ็ต`,
    tabs: buildGroupTabs({ groups: index.groups, active: filters.group, unit: 'เซ็ต', countIn, hrefFor }),
    empty: cards.length === 0,
    ...(filtered && { clearHref: listHref({}, '/sets') }),
    paging: index.paging,
  }
}
