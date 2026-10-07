'use client'

// ชิ้นส่วนที่หน้ารายการคอร์ส (/courses) กับหน้ารายการเซ็ต (/sets) ใช้ร่วมกัน: แท็บกลุ่ม, แถบค้นหา/กรอง, กริดที่โหลดเพิ่มเอง
// import จาก @/catalog/course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { listHref, type CourseFilters } from '@/catalog/course-filters'
import type { GroupTab } from '@/catalog/group-tabs'
import { PressLink } from '@/components/motion/press'
import { Reveal } from '@/components/motion/reveal'
import { STAGGER, STAGGER_CAP } from '@/components/motion/tokens'

/** แท็บกลุ่ม · กดแล้วเปลี่ยน URL จึงแชร์ลิงก์ได้และกดย้อนกลับได้ */
export function TabNav({ tabs }: { tabs: GroupTab[] }) {
  return (
    <nav aria-label="กลุ่ม" className="flex flex-wrap gap-2.5">
      {tabs.map((tab) => (
        <PressLink
          key={tab.href}
          href={tab.href}
          scroll={false}
          aria-current={tab.active ? 'page' : undefined}
          className={`rounded-full border-[1.5px] px-[26px] py-3 font-heading text-[17px] font-semibold transition-colors ${
            tab.active ? 'border-ink bg-ink text-white' : 'border-outline bg-white hover:border-brand'
          }`}
        >
          {tab.label} <span className="text-sm font-normal opacity-70">{tab.count}</span>
        </PressLink>
      ))}
    </nav>
  )
}

const CONTROL = 'h-12 rounded-full border-[1.5px] border-outline bg-white px-5 text-base outline-none focus:border-brand'

/**
 * แถบค้นหา (+ เลือกสาย ถ้ามี trackOptions) + ล้างตัวกรอง
 * เลือกสายเปลี่ยน URL แบบ push (ย้อนกลับได้) · พิมพ์ค้นหาเปลี่ยน URL แบบ replace หลังหยุดพิมพ์ จะได้ไม่เต็มประวัติ
 * ใส่ key ตามตัวกรองไว้ที่ผู้เรียก: กดย้อนกลับแล้วช่องค้นหาจะตามค่าใน URL
 */
export function FilterBar({
  base,
  filters,
  trackOptions = [],
  clearHref,
  placeholder,
  label,
}: {
  base: '/courses' | '/sets'
  filters: CourseFilters
  trackOptions?: string[]
  clearHref?: string
  placeholder: string
  label: string
}) {
  const router = useRouter()
  const [text, setText] = useState(filters.q ?? '')
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const go = (next: CourseFilters, replace = false) => {
    const href = listHref(next, base)
    if (replace) router.replace(href, { scroll: false })
    else router.push(href, { scroll: false })
  }

  return (
    <form
      role="search"
      className="mt-5 flex flex-wrap items-center gap-2.5"
      onSubmit={(e) => {
        e.preventDefault()
        clearTimeout(timer.current)
        go({ ...filters, q: text })
      }}
    >
      <input
        type="search"
        value={text}
        onChange={(e) => {
          const q = e.target.value
          setText(q)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => go({ ...filters, q }, true), 350)
        }}
        placeholder={placeholder}
        aria-label={label}
        className={`${CONTROL} min-w-[220px] flex-1 sm:max-w-[360px]`}
      />
      {trackOptions.length > 1 && (
        <select
          value={filters.track ?? ''}
          onChange={(e) => go({ ...filters, track: e.target.value || undefined, q: text })}
          aria-label="สาย"
          className={`${CONTROL} max-w-full`}
        >
          <option value="">ทุกสาย</option>
          {trackOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
      {(clearHref || text.trim()) && (
        <Link href={base} scroll={false} onClick={() => setText('')} className="px-2 text-[15px] font-semibold text-link-hover underline">
          ล้างตัวกรองทั้งหมด
        </Link>
      )}
    </form>
  )
}

function batchDelay(i: number, paging: { first: number; step: number }) {
  const inBatch = i < paging.first ? i : (i - paging.first) % paging.step
  return Math.min(inBatch * STAGGER, STAGGER_CAP)
}

/** กริดการ์ด โหลดเพิ่มเองเมื่อเลื่อนถึงท้ายรายการ · ใส่ key ตามตัวกรองไว้ที่ผู้เรียก จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง */
export function PagedGrid<T extends { slug: string }>({
  cards,
  resultText,
  paging,
  empty,
  clearHref,
  emptyTitle,
  emptyHint,
  emptyAction,
  loadingText,
  renderCard,
}: {
  cards: T[]
  resultText: string
  paging: { first: number; step: number }
  empty: boolean
  clearHref?: string
  emptyTitle: string
  emptyHint: string
  emptyAction?: ReactNode
  loadingText: string
  renderCard: (card: T) => ReactNode
}) {
  const [shown, setShown] = useState(paging.first)
  const sentinel = useRef<HTMLDivElement>(null)
  const hasMore = shown < cards.length

  useEffect(() => {
    const el = sentinel.current
    if (!el || !hasMore) return
    // สร้างใหม่ทุกครั้งที่โหลดเพิ่ม: ถ้าจอสูงจนตัวท้ายยังเห็นอยู่ observer ตัวใหม่จะเรียกซ้ำให้เอง
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setShown((n) => n + paging.step)
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [shown, hasMore, paging.step])

  return (
    <>
      <p className="px-gutter pt-[26px] pb-2.5 font-mono text-[13px] font-semibold text-link-hover" aria-live="polite">
        {resultText}
      </p>
      {empty && (
        <div className="mx-gutter mt-3 mb-5 rounded-[20px] border border-line bg-footer p-7 text-center">
          <h2 className="mb-2 font-heading text-xl font-bold">{emptyTitle}</h2>
          <p className="mb-5 text-[15.5px] leading-[1.75] text-ink-soft">{emptyHint}</p>
          <div className="mx-auto flex max-w-[320px] flex-col gap-2.5">
            {emptyAction}
            {clearHref && (
              <Link href={clearHref} scroll={false} className="text-[15px] font-semibold text-link-hover underline">
                ล้างตัวกรองทั้งหมด
              </Link>
            )}
          </div>
        </div>
      )}
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[22px] px-gutter pt-3 pb-5">
        {cards.slice(0, shown).map((card, i) => (
          // ไล่กันเฉพาะในชุดเดียวกัน: ชุดแรก (first ใบ) และชุดที่โหลดเพิ่มทีละ step ใบ ใบที่แสดงอยู่แล้วไม่เล่นซ้ำ
          <Reveal key={card.slug} as="li" lift delay={batchDelay(i, paging)} className="flex">
            {renderCard(card)}
          </Reveal>
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinel} className="px-gutter pt-5 pb-10 text-center font-mono text-sm text-muted">
          {loadingText}
        </div>
      )}
    </>
  )
}
