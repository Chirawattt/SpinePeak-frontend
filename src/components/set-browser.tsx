'use client'

// ส่วนที่กรองตาม URL ของหน้ารายการ SET · โครงเดียวกับ course-browser ใช้ชิ้นส่วนร่วมจาก list-browser
// import จาก set-list / course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { filtersToQuery } from '@/catalog/course-filters'
import { filterSetList, parseSetFilters, type SetFilters, type SetListIndex } from '@/catalog/set-list'
import { FilterBar, PagedGrid, TabNav } from '@/components/list-browser'
import { SetListCard } from '@/components/set-list-card'

function useFilters(): SetFilters {
  return parseSetFilters(useSearchParams())
}

/** แท็บกลุ่มตามตัวกรองใน URL · ใช้ใน <Suspense> · อยู่บน hero พื้นเข้ม */
export function SetTabsFromUrl({ index }: { index: SetListIndex }) {
  return <SetTabs index={index} filters={useFilters()} />
}

export function SetTabs({ index, filters }: { index: SetListIndex; filters: SetFilters }) {
  return <TabNav tabs={filterSetList(index, filters).tabs} tone="dark" />
}

/** ช่องค้นหา + เลือกหมวดหมู่ ตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function SetFilterBarFromUrl({ index }: { index: SetListIndex }) {
  const filters = useFilters()
  return <SetFilterBar key={filtersToQuery(filters)} index={index} filters={filters} />
}

export function SetFilterBar({ index, filters }: { index: SetListIndex; filters: SetFilters }) {
  return (
    <FilterBar
      base="/sets"
      filters={filters}
      categoryOptions={filterSetList(index, filters).categoryOptions}
      placeholder="ค้นหา SET หรือชื่อคอร์สข้างใน เช่น A-Level"
      label="ค้นหา SET"
    />
  )
}

/** กริดการ์ด SET ตามตัวกรองใน URL · ใช้ใน <Suspense> · key ตามตัวกรอง จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง */
export function SetGridFromUrl({ index }: { index: SetListIndex }) {
  const filters = useFilters()
  return <SetGrid key={filtersToQuery(filters)} index={index} filters={filters} />
}

export function SetGrid({ index, filters }: { index: SetListIndex; filters: SetFilters }) {
  const list = filterSetList(index, filters)
  return (
    <PagedGrid
      cards={list.cards}
      resultText={list.resultText}
      paging={list.paging}
      empty={list.empty}
      resetHref="/sets"
      emptyTitle="ยังไม่มี SET ที่ตรงกับตัวกรองนี้"
      emptyHint={
        <>
          ลองเปลี่ยนระดับชั้น หรือดู{' '}
          <Link href="/courses" className="font-semibold text-ink underline">
            คอร์สเดี่ยวทั้งหมด
          </Link>
        </>
      }
      loadingText="กำลังโหลด SET เพิ่ม…"
      gridClassName="grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] gap-6"
      renderCard={(card) => <SetListCard card={card} />}
    />
  )
}
