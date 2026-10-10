'use client'

// ส่วนที่กรองตาม URL ของหน้ารายการคอร์ส · หน้า build แบบ static แล้วมากรองฝั่ง client ตาม query string
// import จาก course-filters / course-list ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import { useSearchParams } from 'next/navigation'
import { filtersToQuery, parseFilters, type CourseFilters } from '@/catalog/course-filters'
import { filterCourseList, type CourseListIndex } from '@/catalog/course-list'
import { CourseCard } from '@/components/course-card'
import { FilterBar, PagedGrid, TabNav } from '@/components/list-browser'

function useFilters(): CourseFilters {
  return parseFilters(useSearchParams())
}

/** แท็บกลุ่มตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function GroupTabsFromUrl({ index }: { index: CourseListIndex }) {
  return <GroupTabs index={index} filters={useFilters()} />
}

export function GroupTabs({ index, filters }: { index: CourseListIndex; filters: CourseFilters }) {
  return <TabNav tabs={filterCourseList(index, filters).tabs} />
}

/** ช่องค้นหา + เลือกหมวดหมู่ ตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function FilterBarFromUrl({ index }: { index: CourseListIndex }) {
  const filters = useFilters()
  return <CourseFilterBar key={filtersToQuery(filters)} index={index} filters={filters} />
}

export function CourseFilterBar({ index, filters }: { index: CourseListIndex; filters: CourseFilters }) {
  const { categoryOptions } = filterCourseList(index, filters)
  return (
    <FilterBar
      base="/courses"
      filters={filters}
      categoryOptions={categoryOptions}
      placeholder="ค้นหาชื่อคอร์ส หรือหมวดหมู่ เช่น พันธุศาสตร์"
      label="ค้นหาคอร์ส"
    />
  )
}

/** กริดการ์ดตามตัวกรองใน URL · ใช้ใน <Suspense> · key ตามตัวกรอง จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง */
export function CourseGridFromUrl({ index }: { index: CourseListIndex }) {
  const filters = useFilters()
  return <CourseGrid key={filtersToQuery(filters)} index={index} filters={filters} />
}

export function CourseGrid({ index, filters }: { index: CourseListIndex; filters: CourseFilters }) {
  const list = filterCourseList(index, filters)
  return (
    <PagedGrid
      cards={list.cards}
      resultText={list.resultText}
      paging={list.paging}
      empty={list.empty}
      resetHref="/courses"
      emptyTitle="ยังไม่มีคอร์สที่ตรงกับตัวกรองนี้"
      emptyHint="ลองลดตัวกรองลงสักข้อ หรือทักมาถามครูพี่หนามได้เลย"
      loadingText="กำลังโหลดคอร์สเพิ่ม…"
      renderCard={(card) => <CourseCard card={card} />}
    />
  )
}
