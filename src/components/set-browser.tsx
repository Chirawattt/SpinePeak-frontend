'use client'

// ส่วนที่กรองตาม URL ของหน้ารายการเซ็ต · โครงเดียวกับ course-browser ใช้ชิ้นส่วนร่วมจาก list-browser
// import จาก set-list / course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import { useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { filtersToQuery } from '@/catalog/course-filters'
import { filterSetList, parseSetFilters, type SetFilters, type SetListIndex } from '@/catalog/set-list'
import { FilterBar, PagedGrid, TabNav } from '@/components/list-browser'
import { SetListCard } from '@/components/set-list-card'

function useFilters(): SetFilters {
  return parseSetFilters(useSearchParams())
}

/** แท็บกลุ่มตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function SetTabsFromUrl({ index }: { index: SetListIndex }) {
  return <SetTabs index={index} filters={useFilters()} />
}

export function SetTabs({ index, filters }: { index: SetListIndex; filters: SetFilters }) {
  return <TabNav tabs={filterSetList(index, filters).tabs} />
}

/** แถบค้นหา + ล้างตัวกรอง ตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function SetFilterBarFromUrl({ index }: { index: SetListIndex }) {
  const filters = useFilters()
  return <SetFilterBar key={filtersToQuery(filters)} index={index} filters={filters} />
}

export function SetFilterBar({ index, filters }: { index: SetListIndex; filters: SetFilters }) {
  return (
    <FilterBar
      base="/sets"
      filters={filters}
      topicOptions={[]}
      placeholder="ค้นหาเซ็ต เช่น ชีวะ A-Level"
      label="ค้นหาเซ็ต"
    />
  )
}

/** กริดการ์ดเซ็ตตามตัวกรองใน URL · ใช้ใน <Suspense> · key ตามตัวกรอง จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง */
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
      emptyTitle="ยังไม่เจอเซ็ตที่ตรงกับที่ค้นหา"
      emptyHint="ลองเปลี่ยนคำค้นหา หรือทักมาบอกแอดมินว่าน้องอยากเรียนอะไร จะช่วยเลือกเซ็ตให้"
      loadingText="กำลังโหลดเซ็ตเพิ่ม…"
      renderCard={(card) => <SetListCard card={card} />}
    />
  )
}
