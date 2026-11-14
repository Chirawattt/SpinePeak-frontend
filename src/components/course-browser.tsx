'use client'

// ส่วนที่กรองตาม URL ของหน้ารายการ (/courses): ส่วน SET ขึ้นก่อน แล้วค่อยคอร์สเดี่ยว ใช้ตัวกรองชุดเดียวกัน
// หน้า build แบบ static แล้วมากรองฝั่ง client ตาม query string
// import จาก catalog-list / course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { filterCatalogList, type CatalogListIndex } from '@/catalog/catalog-list'
import { filterBarKey, filtersToQuery, parseFilters, type CourseFilters } from '@/catalog/course-filters'
import { CourseCard } from '@/components/course-card'
import { FilterBar, PagedGrid, TabNav } from '@/components/list-browser'
import { Reveal } from '@/components/motion/reveal'
import { STAGGER, STAGGER_CAP } from '@/components/motion/tokens'
import { SetListCard } from '@/components/set-list-card'
import { badgeVariants } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

const SETS_ID = 'sets'
const COURSES_ID = 'single-courses'

/** เลื่อนไปแต่ละส่วนแล้วหัวข้อไม่จมใต้ header กับแถบตัวกรองที่ติดอยู่ */
const SECTION_SCROLL = 'scroll-mt-[calc(var(--header-h)+var(--filter-h))]'

function useFilters(): CourseFilters {
  return parseFilters(useSearchParams())
}

/** แท็บกลุ่มตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function GroupTabsFromUrl({ index }: { index: CatalogListIndex }) {
  return <GroupTabs index={index} filters={useFilters()} />
}

export function GroupTabs({ index, filters }: { index: CatalogListIndex; filters: CourseFilters }) {
  return <TabNav tabs={filterCatalogList(index, filters).courses.tabs} />
}

/** ช่องค้นหา + เลือกหมวดหมู่ ตามตัวกรองใน URL · ใช้ใน <Suspense> */
export function FilterBarFromUrl({ index }: { index: CatalogListIndex }) {
  const filters = useFilters()
  return <CatalogFilterBar key={filterBarKey(filters)} index={index} filters={filters} />
}

export function CatalogFilterBar({ index, filters }: { index: CatalogListIndex; filters: CourseFilters }) {
  return (
    <FilterBar
      filters={filters}
      categoryOptions={filterCatalogList(index, filters).categoryOptions}
      placeholder="ค้นหา SET หรือคอร์ส เช่น A-Level, พันธุศาสตร์"
      label="ค้นหา SET และคอร์ส"
    />
  )
}

/** ส่วน SET ตามตัวกรองใน URL · ใช้ใน <Suspense> · ไม่ใส่ key ตามตัวกรอง: กด "ดู SET ทั้งหมด" แล้วเปลี่ยนตัวกรอง ยังขยายค้างไว้ */
export function SetSectionFromUrl({ index }: { index: CatalogListIndex }) {
  return <SetSection index={index} filters={useFilters()} />
}

/** พื้นขาวเรียบเหมือนส่วนคอร์สเดี่ยว · ไม่มี SET ที่ผ่านตัวกรองก็ซ่อนทั้งส่วน */
export function SetSection({ index, filters }: { index: CatalogListIndex; filters: CourseFilters }) {
  const [expanded, setExpanded] = useState(false)
  const { sets, setPreview } = filterCatalogList(index, filters)
  if (sets.cards.length === 0) return null
  const shown = expanded ? sets.cards : sets.cards.slice(0, setPreview)
  const hidden = sets.cards.length - shown.length

  return (
    <section id={SETS_ID} aria-labelledby="sets-title" className={`px-gutter pt-[26px] pb-8 ${SECTION_SCROLL}`}>
      <p className={badgeVariants({ className: 'mb-3.5 inline-block' })}>ซื้อเป็น SET ถูกกว่าซื้อแยก</p>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
        <h2 id="sets-title" className="font-heading text-[clamp(24px,3.6vw,30px)] font-bold">
          SET คอร์ส
        </h2>
        <p className="font-mono text-[13px] font-semibold text-eyebrow" aria-live="polite">
          {sets.resultText}
        </p>
      </div>
      <p className="mb-7 max-w-156 text-[16.5px] leading-[1.7] text-ink-soft">
        รวมคอร์สที่เรียนต่อกันเป็นเส้นทางเดียว จ่ายครั้งเดียวได้ครบทุกคอร์สในชุด ดูได้ไม่จำกัดอายุ
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,440px),1fr))] gap-6">
        {shown.map((card, i) => (
          <Reveal key={card.slug} as="li" lift delay={Math.min((i < setPreview ? i : i - setPreview) * STAGGER, STAGGER_CAP)} className="flex">
            <SetListCard card={card} />
          </Reveal>
        ))}
      </ul>
      {hidden > 0 && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className={buttonVariants({ variant: 'outline', className: 'mx-auto cursor-pointer px-7' })}
          >
            ดู SET ทั้งหมด ({sets.cards.length})
          </button>
        </div>
      )}
    </section>
  )
}

/** กริดคอร์สเดี่ยวตามตัวกรองใน URL · ใช้ใน <Suspense> · key ตามตัวกรอง จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง */
export function CourseSectionFromUrl({ index }: { index: CatalogListIndex }) {
  const filters = useFilters()
  return <CourseSection key={filtersToQuery(filters)} index={index} filters={filters} />
}

export function CourseSection({ index, filters }: { index: CatalogListIndex; filters: CourseFilters }) {
  const { courses } = filterCatalogList(index, filters)
  return (
    <section id={COURSES_ID} aria-label="คอร์สเดี่ยว" className={SECTION_SCROLL}>
      <PagedGrid
        title="คอร์สเดี่ยว"
        cards={courses.cards}
        resultText={courses.resultText}
        paging={courses.paging}
        empty={courses.empty}
        resetHref="/courses"
        emptyTitle="ยังไม่มีคอร์สที่ตรงกับตัวกรองนี้"
        emptyHint="ลองลดตัวกรองลงสักข้อ หรือทักมาถามครูพี่หนามได้เลย"
        loadingText="กำลังโหลดคอร์สเพิ่ม…"
        renderCard={(card) => <CourseCard card={card} />}
      />
    </section>
  )
}
