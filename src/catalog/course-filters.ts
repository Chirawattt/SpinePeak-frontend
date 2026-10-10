// ตัวกรองของหน้ารายการคอร์สกับ query string ใน URL · ที่เดียวที่รู้ว่า URL ของหน้ารายการหน้าตาเป็นอย่างไร
// ไม่มี dependency นอกจาก type จึงใช้ได้ทั้งฝั่ง server และ client

import type { Group } from '@content/types'

/** group = กลุ่ม · topic = หัวข้อ (ดู CONTEXT.md) · q = คำค้นหา */
export type CourseFilters = { group?: Group; topic?: string; q?: string }

/** ค่า group ที่ยอมรับใน URL · satisfies บังคับให้ครบทุกค่าใน type Group */
const GROUP_KEYS = { prathom: true, mton: true, mplai: true } satisfies Record<Group, true>

function isGroup(value: string | null): value is Group {
  return value != null && Object.hasOwn(GROUP_KEYS, value)
}

/** query string → ตัวกรอง · ค่าที่ไม่รู้จักหรือว่างถือว่าไม่ได้กรอง ลิงก์เก่าหรือพิมพ์ผิดจะได้ไม่พัง · key ที่ไม่รู้จักถูกทิ้ง */
export function parseFilters(params: { get(name: string): string | null }): CourseFilters {
  const group = params.get('group')
  const topic = params.get('topic')?.trim()
  const q = params.get('q')?.trim()
  return { ...(isGroup(group) && { group }), ...(topic && { topic }), ...(q && { q }) }
}

/** ตัวกรอง → query string ที่ไม่มี "?" นำหน้า · ไม่กรองอะไรเลยได้ "" */
export function filtersToQuery(filters: CourseFilters): string {
  const params = new URLSearchParams()
  if (filters.group) params.set('group', filters.group)
  if (filters.topic) params.set('topic', filters.topic)
  if (filters.q?.trim()) params.set('q', filters.q.trim())
  return params.toString()
}

/** ลิงก์ไปหน้ารายการที่กรองไว้ตามนี้ · หน้ารายการเซ็ต (/sets) ใช้ตัวกรองชุดเดียวกัน */
export function listHref(filters: CourseFilters, base: '/courses' | '/sets' = '/courses'): string {
  const query = filtersToQuery(filters)
  return query ? `${base}?${query}` : base
}
