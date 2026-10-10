'use client'

// ชิ้นส่วนที่หน้ารายการคอร์ส (/courses) กับหน้ารายการ SET (/sets) ใช้ร่วมกัน: แท็บกลุ่ม, แถบค้นหา/กรอง, กริดที่โหลดเพิ่มเอง
// import จาก @/catalog/course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { listHref, type CourseFilters } from '@/catalog/course-filters'
import type { GroupTab } from '@/catalog/group-tabs'
import { PressLink } from '@/components/motion/press'
import { Reveal } from '@/components/motion/reveal'
import { STAGGER, STAGGER_CAP } from '@/components/motion/tokens'

const TAB_TONE = {
  light: { on: 'border-ink bg-ink text-white', off: 'border-outline bg-white hover:border-brand' },
  // บนพื้นเข้ม (hero ของหน้า SET)
  dark: { on: 'border-brand bg-brand text-ink', off: 'border-[#3e6b76] bg-transparent text-white hover:border-brand' },
}

/** แท็บกลุ่ม · กดแล้วเปลี่ยน URL จึงแชร์ลิงก์ได้และกดย้อนกลับได้ */
export function TabNav({ tabs, tone = 'light' }: { tabs: GroupTab[]; tone?: keyof typeof TAB_TONE }) {
  return (
    <nav aria-label="กลุ่ม" className="flex flex-wrap gap-2.5">
      {tabs.map((tab) => (
        <PressLink
          key={tab.href}
          href={tab.href}
          scroll={false}
          aria-current={tab.active ? 'page' : undefined}
          className={`rounded-full border-[1.5px] px-[26px] py-3 font-heading text-[17px] font-semibold transition-colors ${tab.active ? TAB_TONE[tone].on : TAB_TONE[tone].off}`}
        >
          {tab.label} <span className="text-sm font-normal opacity-70">{tab.count}</span>
        </PressLink>
      ))}
    </nav>
  )
}

const CONTROL = 'min-w-0 rounded-full border border-outline bg-white px-5 py-3 text-[15px] outline-none focus:border-brand'

/** แถบที่ติดอยู่ใต้ header ตอนเลื่อน · ใส่ FilterBar ไว้ข้างใน */
export function StickyFilterBand({ children }: { children: ReactNode }) {
  return <div className="sticky top-(--header-h) z-[5] border-b border-divider-soft bg-footer px-gutter py-5">{children}</div>
}

/**
 * ช่องค้นหา + เลือกหัวข้อ
 * เลือกหัวข้อเปลี่ยน URL แบบ push (ย้อนกลับได้) · พิมพ์ค้นหาเปลี่ยน URL แบบ replace หลังหยุดพิมพ์ จะได้ไม่เต็มประวัติ
 * ใส่ key ตามตัวกรองไว้ที่ผู้เรียก: กดย้อนกลับหรือล้างตัวกรองแล้วช่องค้นหาจะตามค่าใน URL
 */
export function FilterBar({
  base,
  filters,
  topicOptions,
  placeholder,
  label,
}: {
  base: '/courses' | '/sets'
  filters: CourseFilters
  topicOptions: string[]
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
      className="flex flex-wrap gap-3"
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
        className={`${CONTROL} flex-[3_1_340px]`}
      />
      <select
        value={filters.topic ?? ''}
        onChange={(e) => go({ ...filters, topic: e.target.value || undefined, q: text })}
        aria-label="หัวข้อ"
        className={`${CONTROL} flex-[1_1_200px] cursor-pointer`}
      >
        <option value="">ทุกหัวข้อ</option>
        {topicOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </form>
  )
}

/** การ์ดในชุดเดียวกันขึ้นไล่กัน: ชุดแรก (first ใบ) และชุดที่โหลดเพิ่มทีละ step ใบ ใบที่แสดงอยู่แล้วไม่เล่นซ้ำ */
function batchDelay(i: number, paging: { first: number; step: number }) {
  const inBatch = i < paging.first ? i : (i - paging.first) % paging.step
  return Math.min(inBatch * STAGGER, STAGGER_CAP)
}

/**
 * แถว "พบ N …" + ล้างตัวกรอง แล้วกริดการ์ดที่โหลดเพิ่มเองเมื่อเลื่อนถึงท้ายรายการ
 * ใส่ key ตามตัวกรองไว้ที่ผู้เรียก จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง
 */
export function PagedGrid<T extends { slug: string }>({
  cards,
  resultText,
  paging,
  empty,
  resetHref,
  emptyTitle,
  emptyHint,
  loadingText,
  gridClassName = 'grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[22px]',
  renderCard,
}: {
  cards: T[]
  resultText: string
  paging: { first: number; step: number }
  empty: boolean
  /** หน้ารายการที่ไม่กรองอะไร */
  resetHref: string
  emptyTitle: string
  emptyHint: ReactNode
  loadingText: string
  gridClassName?: string
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
      <div className="flex items-baseline justify-between gap-4 px-gutter pt-[26px] pb-2.5">
        <p className="font-mono text-[13px] font-semibold text-eyebrow" aria-live="polite">
          {resultText}
        </p>
        <Link href={resetHref} scroll={false} className="border-b border-ring text-[14.5px] text-eyebrow hover:text-ink">
          ล้างตัวกรองทั้งหมด
        </Link>
      </div>
      <ul className={`grid px-gutter pt-3 pb-5 ${gridClassName}`}>
        {cards.slice(0, shown).map((card, i) => (
          <Reveal key={card.slug} as="li" lift delay={batchDelay(i, paging)} className="flex">
            {renderCard(card)}
          </Reveal>
        ))}
      </ul>
      {empty && (
        <div className="mx-gutter mb-6 rounded-[18px] border border-dashed border-ring bg-footer p-[clamp(26px,5vw,44px)] text-center">
          <h2 className="mb-2 font-heading text-[22px] font-semibold">{emptyTitle}</h2>
          <p className="text-[15.5px] text-muted">{emptyHint}</p>
        </div>
      )}
      {hasMore && (
        <div ref={sentinel} className="px-gutter pt-5 pb-10 text-center font-mono text-sm text-muted">
          {loadingText}
        </div>
      )}
    </>
  )
}
