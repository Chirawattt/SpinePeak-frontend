// type และตัวช่วยที่หลายหน้าใน Catalog ใช้ร่วมกัน

import { formatPages, type CourseStats, type Group, type Site, type Subject } from '@content/types'
import { listHref } from './course-filters'

export type NavLink = { label: string; href: string }

export type Faq = { q: string; a: string }

/** ตัวเลขหนึ่งช่องในแถว ข้อสอบ / หน้า PDF / ชั่วโมงวิดีโอ */
export type Stat = { value: string; label: string }

/** สีกล่องแทนรูปปก จาก palette ของเว็บ */
export type CoverTone = 'sky' | 'wash' | 'ink'

/** รูปปกยังไม่มี ใช้กล่องสีตามกลุ่มไปก่อน · มีรูปแล้วใช้รูป */
export type Cover = { tone: CoverTone; image?: string }

/** ชื่อวิชาตามคอลัมน์ วิชา ในชีต (docs/data-schema.md) */
export const SUBJECT_LABEL: Record<Subject, string> = {
  science: 'วิทยาศาสตร์',
  biology: 'ชีววิทยา',
  chemistry: 'เคมี',
  physics: 'ฟิสิกส์',
  math: 'คณิตศาสตร์',
  applied_science: 'วิทยาศาสตร์ประยุกต์',
}

const COVER_TONE: Record<Group, CoverTone> = { prathom: 'sky', mton: 'wash', mplai: 'ink' }

export function cover(group: Group, image: string | undefined): Cover {
  const src = nonEmpty(image)
  return src ? { tone: COVER_TONE[group], image: src } : { tone: COVER_TONE[group] }
}

/** 1290 → "1,290.-" */
export function formatBaht(amount: number): string {
  return `${amount.toLocaleString('en-US')}.-`
}

/** ป้ายอายุคอร์ส เช่น "ดูได้ไม่จำกัดอายุ" จาก site.json → config.lifetimeLabel */
export function lifetimeLabel(site: Site): string {
  return `ดูได้${site.config.lifetimeLabel}`
}

/** ชื่อกลุ่มจาก site.json เช่น "ม.ปลาย" */
export function groupLabel(site: Site, group: Group): string {
  return site.groups.find((g) => g.key === group)?.label ?? group
}

/** ลิงก์ไปหน้ารายการคอร์สที่กรองกลุ่มนั้นไว้ */
export function groupLink(key: Group, label: string): NavLink {
  return { label, href: listHref({ group: key }) }
}

/** ข้อความว่างหรือมีแต่ช่องว่าง คืน undefined ให้หน้าซ่อนช่องนั้น */
export function nonEmpty(value: string | undefined): string | undefined {
  return value?.trim() ? value.trim() : undefined
}

/** ค่า 0 นับว่าไม่มีข้อมูล จะได้ไม่ขึ้น "0 ชม." */
function present(value: number | undefined): value is number {
  return value != null && value > 0
}

/** ตัวเลขทั้งแถวในบรรทัดเดียว เช่น "VDO 6 ชม. · PDF 80 หน้า · 150 ข้อ" สำหรับการ์ด · ว่างเมื่อไม่มีตัวเลขเลย */
export function statsLine(stats: CourseStats): string {
  return statParts(stats)
    .map((s) => (s.key === 'video' ? `VDO ${s.value}` : s.key === 'pdf' ? `PDF ${s.value}` : s.value))
    .join(' · ')
}

/** ป้ายใต้ตัวเลข แต่ละหน้าเรียกต่างกันได้ (เช่น หน้าคอร์ส "วิดีโอทั้งหมด" หน้า SET "วิดีโอรวม") */
export type StatLabels = Record<StatKey, string>
const DEFAULT_LABELS: StatLabels = { video: 'วิดีโอ', pdf: 'ไฟล์ PDF', questions: 'ข้อสอบ' }

/** แถว ชั่วโมงวิดีโอ / หน้า PDF / ข้อสอบ เฉพาะตัวที่มีค่า */
export function statsRow(stats: CourseStats, labels: StatLabels = DEFAULT_LABELS): Stat[] {
  return statParts(stats).map(({ key, value }) => ({ value, label: labels[key] }))
}

type StatKey = 'video' | 'pdf' | 'questions'

function statParts({ questionCount, pdfPages, videoHours }: CourseStats): { key: StatKey; value: string }[] {
  const out: { key: StatKey; value: string }[] = []
  if (present(videoHours)) out.push({ key: 'video', value: `${videoHours} ชม.` })
  // หน้า PDF เป็นช่วงได้ ({min,max}) ตัวเลขเดี่ยวใช้กฎ 0 = ไม่มีข้อมูลเหมือนตัวอื่น
  const pages = typeof pdfPages === 'number' && !present(pdfPages) ? null : formatPages(pdfPages)
  if (pages) out.push({ key: 'pdf', value: pages })
  if (present(questionCount)) out.push({ key: 'questions', value: `${questionCount} ข้อ` })
  return out
}
