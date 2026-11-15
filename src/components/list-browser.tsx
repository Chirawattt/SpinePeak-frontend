'use client'

// ชิ้นส่วนของหน้ารายการ (/courses มีทั้งส่วน SET และคอร์สเดี่ยว): แท็บกลุ่ม, แถบค้นหา/กรอง, กริดที่โหลดเพิ่มเอง
// import จาก @/catalog/course-filters ตรง ๆ ไม่ผ่าน '@/catalog' เพราะตัวนั้นโหลดข้อมูล content/ ทั้งก้อนเข้ามาใน bundle

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { listHref, normalizeQuery, type CourseFilters } from '@/catalog/course-filters'
import type { GroupTab } from '@/catalog/group-tabs'
import { HeaderHeight } from '@/components/header-height'
import { PressLink } from '@/components/motion/press'
import { Reveal } from '@/components/motion/reveal'
import { STAGGER, STAGGER_CAP } from '@/components/motion/tokens'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'

const TAB_TONE = { on: 'border-ink bg-ink text-white', off: 'border-outline bg-white hover:border-brand' }

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
          className={`rounded-full border-[1.5px] px-[26px] py-3 font-heading text-[17px] font-semibold transition-colors ${tab.active ? TAB_TONE.on : TAB_TONE.off}`}
        >
          {tab.label} <span className="text-sm font-normal opacity-70">{tab.count}</span>
        </PressLink>
      ))}
    </nav>
  )
}

/** แถบที่ติดอยู่ใต้ header ตอนเลื่อน · ใส่ FilterBar ไว้ข้างใน · วัดความสูงลง --filter-h ให้ลิงก์ข้ามไปแต่ละส่วนเลื่อนไปไม่จมใต้แถบ */
export function StickyFilterBand({ children }: { children: ReactNode }) {
  return (
    <div id="filter-band" className="sticky top-(--header-h) z-[5] border-b border-divider-soft bg-footer px-gutter py-5">
      {children}
      <HeaderHeight targetId="filter-band" cssVar="--filter-h" />
    </div>
  )
}

/** หยุดพิมพ์นานเท่านี้ (ms) แล้วค้นหาเอง · กด Enter ค้นหาทันทีไม่ต้องรอ */
const SEARCH_DELAY = 700

/**
 * ช่องค้นหา + เลือกหมวดหมู่
 * เลือกหมวดหมู่เปลี่ยน URL แบบ push (ย้อนกลับได้) · พิมพ์ค้นหาเปลี่ยน URL แบบ replace หลังหยุดพิมพ์ จะได้ไม่เต็มประวัติ
 * ผู้เรียกใส่ key={filterBarKey(filters)} (ไม่รวมคำค้น): ช่องค้นหาไม่ถูกสร้างใหม่ระหว่างพิมพ์ focus จึงไม่หาย
 * คำค้นใน URL ที่เปลี่ยนจากที่อื่น (ล้างตัวกรอง, ย้อนกลับ) ซิงก์เข้าช่องค้นหาเอง · ที่ช่องค้นหาส่งไปเองไม่ซิงก์กลับ จะได้ไม่ทับตัวที่พิมพ์ต่อ
 */
export function FilterBar({
  filters,
  categoryOptions,
  placeholder,
  label,
}: {
  filters: CourseFilters
  categoryOptions: string[]
  placeholder: string
  label: string
}) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [text, setText] = useState(filters.q ?? '')
  // คำค้นใน URL ล่าสุดที่เห็น กับคำค้นล่าสุดที่ช่องนี้ส่งไปเอง · ใช้แยกว่าคำค้นใน URL เปลี่ยนเพราะเราหรือเพราะที่อื่น
  const [seenQuery, setSeenQuery] = useState(normalizeQuery(filters.q))
  const [sentQuery, setSentQuery] = useState(normalizeQuery(filters.q))
  const [externalChanges, setExternalChanges] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  const urlQuery = normalizeQuery(filters.q)
  if (urlQuery !== seenQuery) {
    setSeenQuery(urlQuery)
    if (urlQuery !== sentQuery) {
      // ล้างตัวกรอง / ย้อนกลับ: ช่องค้นหาตาม URL และยกเลิกการค้นหาที่รออยู่ (ดู effect ข้างล่าง)
      setText(filters.q ?? '')
      setSentQuery(urlQuery)
      setExternalChanges((n) => n + 1)
    }
  }
  useEffect(() => {
    if (externalChanges > 0) clearTimeout(timer.current)
  }, [externalChanges])

  const go = (next: CourseFilters, replace = false) => {
    const href = listHref(next)
    if (replace) router.replace(href, { scroll: false })
    else router.push(href, { scroll: false })
  }

  const search = (q: string) => {
    setSentQuery(normalizeQuery(q))
    go({ ...filters, q }, true)
  }

  return (
    <form
      role="search"
      className="flex flex-wrap gap-3"
      onSubmit={(e) => {
        e.preventDefault()
        clearTimeout(timer.current)
        search(text)
        // มือถือ: กด "ค้นหา" แปลว่าพิมพ์เสร็จแล้ว ปิดคีย์บอร์ดให้เห็นผลเต็มจอ · จอที่ใช้เมาส์ focus อยู่ที่ช่องเดิม
        if (window.matchMedia('(pointer: coarse)').matches) input.current?.blur()
      }}
    >
      <Input
        ref={input}
        type="search"
        enterKeyHint="search"
        value={text}
        onChange={(e) => {
          const q = e.target.value
          setText(q)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => search(q), SEARCH_DELAY)
        }}
        placeholder={placeholder}
        aria-label={label}
        className="flex-[3_1_340px]"
      />
      <NativeSelect
        value={filters.category ?? ''}
        onChange={(e) => go({ ...filters, category: e.target.value || undefined, q: text })}
        aria-label="หมวดหมู่"
        className="flex-[1_1_200px]"
      >
        <option value="">ทุกหมวดหมู่</option>
        {categoryOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </NativeSelect>
    </form>
  )
}

/** การ์ดในชุดเดียวกันขึ้นไล่กัน: ชุดแรก (first ใบ) และชุดที่โหลดเพิ่มทีละ step ใบ ใบที่แสดงอยู่แล้วไม่เล่นซ้ำ */
function batchDelay(i: number, paging: { first: number; step: number }) {
  const inBatch = i < paging.first ? i : (i - paging.first) % paging.step
  return Math.min(inBatch * STAGGER, STAGGER_CAP)
}

/**
 * แถวหัวข้อ (title + "พบ N …") + ล้างตัวกรอง (ถ้าส่ง resetHref) แล้วกริดการ์ดที่โหลดเพิ่มเองเมื่อเลื่อนถึงท้ายรายการ
 * ใส่ key ตามตัวกรองไว้ที่ผู้เรียก จำนวนที่โหลดจึงนับใหม่เมื่อเปลี่ยนตัวกรอง
 */
export function PagedGrid<T extends { slug: string }>({
  title,
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
  /** หัวข้อของส่วน เช่น "คอร์สเดี่ยว" · ไม่มี = ใช้จำนวนผลลัพธ์เป็นหัวข้อ */
  title?: string
  cards: T[]
  resultText: string
  paging: { first: number; step: number }
  empty: boolean
  /** หน้ารายการที่ไม่กรองอะไร · ไม่ส่ง = ไม่มีลิงก์ล้างตัวกรองในแถวหัวข้อ (หน้ารายการคอร์สย้ายไปไว้ส่วนบนของหน้า) */
  resetHref?: string
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
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-gutter pt-[26px] pb-2.5">
        {/* h2: หัวข้อของรายการ ให้การ์ด (h3) มีหัวข้อแม่ และโปรแกรมอ่านหน้าจอได้ยินจำนวนผลลัพธ์ */}
        {title ? (
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className="font-heading text-[clamp(24px,3.6vw,30px)] font-bold">{title}</h2>
            <p className="font-mono text-[13px] font-semibold text-eyebrow" aria-live="polite">
              {resultText}
            </p>
          </div>
        ) : (
          <h2 className="font-mono text-[13px] font-semibold text-eyebrow" aria-live="polite">
            {resultText}
          </h2>
        )}
        {resetHref && (
          <Link href={resetHref} scroll={false} className="border-b border-ring text-[14.5px] text-eyebrow hover:text-ink">
            ล้างตัวกรองทั้งหมด
          </Link>
        )}
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
