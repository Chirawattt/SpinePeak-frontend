// หน้ารายการรวม (/courses): ส่วน SET ขึ้นก่อน แล้วค่อยคอร์สเดี่ยว · ตัวกรองชุดเดียว (กลุ่ม หมวดหมู่ คำค้น) ใช้กับทั้งสองส่วน
// ไฟล์นี้ต้องไม่ import ข้อมูลใน content/ ตรง ๆ เพราะหน้าเรียกใช้ฝั่ง client ด้วย (กรองตาม query string)

import type { CourseFilters } from './course-filters'
import { filterCourseList, type CourseList, type CourseListIndex } from './course-list'
import { filterSetList, type SetList, type SetListIndex } from './set-list'

/** ไม่ได้เลือกกลุ่ม: SET ทั้งหมดยาวเกินไปก่อนจะถึงคอร์สเดี่ยว จึงโชว์แค่นี้ก่อน แล้วกด "ดู SET ทั้งหมด" ขยายต่อ */
export const SET_PREVIEW = 6

export type CatalogListIndex = { courses: CourseListIndex; sets: SetListIndex }

export type CatalogList = {
  courses: CourseList
  /** SET ที่ผ่านตัวกรอง เรียงตามลำดับใน sets.json (เจ้าของจัดเอง) */
  sets: SetList
  /** จำนวน SET ที่โชว์ก่อนกดขยาย · เท่ากับทั้งหมดเมื่อเลือกกลุ่มแล้ว หรือมีไม่เกิน SET_PREVIEW */
  setPreview: number
  /** ตัวเลือกหมวดหมู่: ของคอร์สก่อน แล้วตามด้วยของ SET ที่ยังไม่มี · ไม่ซ้ำ */
  categoryOptions: string[]
}

export function filterCatalogList(index: CatalogListIndex, filters: CourseFilters): CatalogList {
  const courses = filterCourseList(index.courses, filters)
  const sets = filterSetList(index.sets, filters)
  const total = sets.cards.length
  return {
    courses,
    sets,
    setPreview: filters.group ? total : Math.min(total, SET_PREVIEW),
    categoryOptions: [...new Set([...courses.categoryOptions, ...sets.categoryOptions])],
  }
}
