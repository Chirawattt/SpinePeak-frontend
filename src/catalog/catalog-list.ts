// หน้ารายการรวม (/courses): SET ปูพื้นฐาน → SET ตะลุยโจทย์ → คอร์สเดี่ยว · ตัวกรองชุดเดียว (กลุ่ม หมวดหมู่ คำค้น) ใช้กับทุกส่วน
// ไฟล์นี้ต้องไม่ import ข้อมูลใน content/ ตรง ๆ เพราะหน้าเรียกใช้ฝั่ง client ด้วย (กรองตาม query string)

import type { SetKind } from '@content/types'
import type { CourseFilters } from './course-filters'
import { filterCourseList, type CourseList, type CourseListIndex } from './course-list'
import { filterSetList, type SetList, type SetListIndex } from './set-list'

/** ไม่ได้เลือกกลุ่ม: SET ทั้งหมดยาวเกินไปก่อนจะถึงคอร์สเดี่ยว จึงโชว์แค่นี้ก่อน (ต่อส่วน) แล้วกด "ดู SET ทั้งหมด" ขยายต่อ */
export const SET_PREVIEW = 6

/** ลำดับส่วน SET บนหน้า */
export const SET_KINDS: SetKind[] = ['foundation', 'practice']

export type CatalogListIndex = { courses: CourseListIndex; sets: SetListIndex }

/** SET ประเภทหนึ่งที่ผ่านตัวกรอง เรียงตามลำดับใน sets.json (เจ้าของจัดเอง) */
export type SetKindList = SetList & {
  /** จำนวน SET ที่โชว์ก่อนกดขยาย · เท่ากับทั้งหมดเมื่อเลือกกลุ่มแล้ว หรือมีไม่เกิน SET_PREVIEW */
  preview: number
}

export type CatalogList = {
  courses: CourseList
  sets: Record<SetKind, SetKindList>
  /** ตัวเลือกหมวดหมู่: ของคอร์สก่อน แล้วตามด้วยของ SET ที่ยังไม่มี · ไม่ซ้ำ */
  categoryOptions: string[]
}

export function filterCatalogList(index: CatalogListIndex, filters: CourseFilters): CatalogList {
  const courses = filterCourseList(index.courses, filters)
  const section = (kind: SetKind): SetKindList => {
    const list = filterSetList(index.sets, filters, kind)
    const total = list.cards.length
    return { ...list, preview: filters.group ? total : Math.min(total, SET_PREVIEW) }
  }
  const sets = { foundation: section('foundation'), practice: section('practice') }
  return {
    courses,
    sets,
    categoryOptions: [...new Set([...courses.categoryOptions, ...sets.foundation.categoryOptions])],
  }
}
