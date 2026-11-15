'use client'

// ส่วนที่กรองตาม URL ของหน้ารายการ (/courses): SET ปูพื้นฐาน → SET ตะลุยโจทย์ → คอร์สเดี่ยว ใช้ตัวกรองชุดเดียวกัน
// หน้า build แบบ static แล้วมากรองฝั่ง client ตาม query string
// import จาก catalog-list / course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import type { SetKind } from '@content/types'
import { filterCatalogList, SET_KINDS, type CatalogListIndex, type SetKindList } from '@/catalog/catalog-list'
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

/** มีตัวกรองอยู่ (กลุ่ม หมวดหมู่ หรือคำค้น) · ลิงก์ "ล้างตัวกรองทั้งหมด" ขึ้นเฉพาะตอนนี้ */
function isFiltered(filters: CourseFilters): boolean {
  return Boolean(filters.group || filters.category || filters.q?.trim())
}

const RESET_HREF = '/courses'

/** ลิงก์ล้างตัวกรอง ชิดขวาในแถวหัวข้อของส่วนแรกที่เห็น (ปกติคือ SET ปูพื้นฐาน) */
function ResetLink() {
  return (
    <Link href={RESET_HREF} scroll={false} className="ml-auto self-center border-b border-ring text-[14.5px] text-eyebrow hover:text-ink">
      ล้างตัวกรองทั้งหมด
    </Link>
  )
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

/** หัวข้อและคำอธิบายของแต่ละประเภท SET (CONTEXT.md: ประเภทเซ็ต) · id ของ SET ตะลุยโจทย์ใช้ลิงก์ตรงไปส่วนนั้นได้ */
const KIND_COPY: Record<SetKind, { id: string; title: string; description: string; badge?: string }> = {
  foundation: { id: 'foundation-sets', title: 'SET ปูพื้นฐาน', description: 'เหมาะสำหรับคนที่มีพื้นฐานไม่แน่น', badge: 'ซื้อเป็น SET ถูกกว่าซื้อแยก' },
  practice: { id: 'practice-sets', title: 'SET ตะลุยโจทย์', description: 'เหมาะสำหรับคนที่มีพื้นฐานแน่นและต้องการทำโจทย์เพิ่ม' },
}

/**
 * SET ทั้งสองประเภท เรียง SET ปูพื้นฐาน → SET ตะลุยโจทย์ · id="sets" ครอบทั้งสองส่วน ลิงก์ #sets เดิมจึงไปถึง SET เสมอ แม้ค้นแล้วเหลือประเภทเดียว
 * ประเภทที่ไม่มี SET ผ่านตัวกรองถูกซ่อน · ไม่เหลือเลยก็ซ่อนทั้งหมด
 */
export function SetSection({ index, filters }: { index: CatalogListIndex; filters: CourseFilters }) {
  const { sets } = filterCatalogList(index, filters)
  const kinds = SET_KINDS.filter((kind) => sets[kind].cards.length > 0)
  if (kinds.length === 0) return null

  return (
    <div id={SETS_ID} className={`flex flex-col gap-14 px-gutter pt-[26px] pb-8 ${SECTION_SCROLL}`}>
      {kinds.map((kind, i) => (
        <KindSection key={kind} kind={kind} list={sets[kind]} reset={i === 0 && isFiltered(filters)} />
      ))}
    </div>
  )
}

/** พื้นขาวเรียบเหมือนส่วนคอร์สเดี่ยว · แต่ละประเภทขยาย "ดู SET ทั้งหมด" แยกกัน */
function KindSection({ kind, list, reset }: { kind: SetKind; list: SetKindList; reset: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const copy = KIND_COPY[kind]
  const shown = expanded ? list.cards : list.cards.slice(0, list.preview)
  const hidden = list.cards.length - shown.length
  const titleId = `${copy.id}-title`

  return (
    <section id={copy.id} aria-labelledby={titleId} className={SECTION_SCROLL}>
      {copy.badge && <p className={badgeVariants({ className: 'mb-3.5 inline-block' })}>{copy.badge}</p>}
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3">
        <h2 id={titleId} className="font-heading text-[clamp(24px,3.6vw,30px)] font-bold">
          {copy.title}
        </h2>
        <p className="font-mono text-[13px] font-semibold text-eyebrow" aria-live="polite">
          {list.resultText}
        </p>
        {reset && <ResetLink />}
      </div>
      <p className="mb-7 max-w-156 text-[16.5px] leading-[1.7] text-ink-soft">{copy.description}</p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[22px]">
        {shown.map((card, i) => (
          <Reveal key={card.slug} as="li" lift delay={Math.min((i < list.preview ? i : i - list.preview) * STAGGER, STAGGER_CAP)} className="flex">
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
            ดู {copy.title}ทั้งหมด ({list.cards.length})
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
  const { courses, sets } = filterCatalogList(index, filters)
  // ไม่มี SET ผ่านตัวกรองเลย ส่วน SET ถูกซ่อน ลิงก์ล้างตัวกรองจึงย้ายมาอยู่แถวหัวข้อคอร์สเดี่ยวแทน
  const noSets = SET_KINDS.every((kind) => sets[kind].cards.length === 0)
  return (
    <section id={COURSES_ID} aria-label="คอร์สเดี่ยว" className={SECTION_SCROLL}>
      <PagedGrid
        title="คอร์สเดี่ยว"
        cards={courses.cards}
        resultText={courses.resultText}
        paging={courses.paging}
        empty={courses.empty}
        {...(noSets && isFiltered(filters) && { resetHref: RESET_HREF })}
        emptyTitle="ยังไม่มีคอร์สที่ตรงกับตัวกรองนี้"
        emptyHint="ลองลดตัวกรองลงสักข้อ หรือทักมาถามครูพี่หนามได้เลย"
        loadingText="กำลังโหลดคอร์สเพิ่ม…"
        renderCard={(card) => <CourseCard card={card} />}
      />
    </section>
  )
}
