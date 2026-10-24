'use client'

// ชิปสนามสอบของหนึ่งกลุ่มในแผง "เรียนอยู่ชั้นไหน" · โชว์ไม่เกิน 2 บรรทัด
// วางครบใน 2 บรรทัดได้ก็โชว์ครบ · ไม่พอ ช่องสุดท้ายเป็น "+N" พาไปหน้าคอร์สของกลุ่ม (มีตัวกรองหมวดหมู่ครบ)
// จำนวนที่พอขึ้นกับความกว้างจอ จึงวัดจากสำเนาที่มองไม่เห็นแล้วคำนวณใหม่ทุกครั้งที่แถบเปลี่ยนขนาด

import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'
import type { NavLink } from '@/catalog'
import { badgeVariants } from '@/components/ui/badge'
import { countChipsThatFit } from '@/components/landing/fit-chips'

const ROWS = 2
/** ต้องตรงกับ gap-2 ของรายการ */
const GAP = 8

const CHIP = badgeVariants({
  variant: 'outline',
  className: 'inline-flex min-h-9 items-center font-medium whitespace-nowrap transition-colors hover:border-brand hover:bg-brand-wash',
})

export function CategoryChips({ groupLabel, groupHref, categories }: { groupLabel: string; groupHref: string; categories: NavLink[] }) {
  const list = useRef<HTMLUListElement>(null)
  const ruler = useRef<HTMLDivElement>(null)
  // null = ยังไม่ได้วัด (ก่อน hydrate) · ระหว่างนั้นโชว์ครบแต่ตัดที่ 2 บรรทัด หน้าจะได้ไม่กระตุกตอนวัดเสร็จ
  const [shown, setShown] = useState<number | null>(null)

  useLayoutEffect(() => {
    const listEl = list.current
    const rulerEl = ruler.current
    if (!listEl || !rulerEl) return
    const measure = () => {
      const chips = [...rulerEl.children] as HTMLElement[]
      const plus = chips.pop()
      if (!plus) return
      setShown(countChipsThatFit(chips.map((c) => c.offsetWidth), plus.offsetWidth, listEl.clientWidth, { rows: ROWS, gap: GAP }))
    }
    measure()
    // แถบเปลี่ยนความกว้าง (หมุนจอ) หรือชิปเปลี่ยนขนาด (ฟอนต์ไทยโหลดเสร็จทีหลัง) ก็วัดใหม่
    const observer = new ResizeObserver(measure)
    observer.observe(listEl)
    observer.observe(rulerEl)
    let alive = true
    document.fonts?.ready.then(() => alive && measure())
    return () => {
      alive = false
      observer.disconnect()
    }
  }, [categories])

  const count = shown ?? categories.length
  const more = categories.length - count

  return (
    <div className="relative">
      {/* 2 บรรทัด = ชิปสูง 36 × 2 + ช่องห่าง 8 = 80px */}
      <ul ref={list} aria-label={`สนามสอบของ${groupLabel}`} className={`flex flex-wrap gap-2 ${shown === null ? 'max-h-20 overflow-hidden' : ''}`}>
        {categories.slice(0, count).map((category) => (
          <li key={category.label}>
            <Link href={category.href} className={CHIP}>
              {category.label}
            </Link>
          </li>
        ))}
        {more > 0 && (
          <li>
            <Link href={groupHref} aria-label={`ดูอีก ${more} สนามสอบของ${groupLabel}`} className={`${CHIP} text-muted`}>
              +{more}
            </Link>
          </li>
        )}
      </ul>

      {/* ไม้บรรทัด: ชิปทุกอัน + ชิป "+N" ที่กว้างที่สุดที่เป็นไปได้ วางเรียงแถวเดียว มองไม่เห็น ใช้วัดความกว้างอย่างเดียว */}
      <div aria-hidden className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden">
        <div ref={ruler} className="flex w-max gap-2">
          {categories.map((category) => (
            <span key={category.label} className={CHIP}>
              {category.label}
            </span>
          ))}
          <span className={CHIP}>+{categories.length}</span>
        </div>
      </div>
    </div>
  )
}
