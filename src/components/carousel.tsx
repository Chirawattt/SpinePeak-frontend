'use client'

// แถบเลื่อนแนวนอน (โปรโมชัน, รีวิว) · มือถือปัดนิ้ว trackpad ปัดสองนิ้วได้เองด้วย scroll-snap
// เมาส์ใช้ปุ่ม ‹ › ที่หัวแถบ (ซ่อนบนจอสัมผัส) · ไม่แปลงล้อเมาส์แนวตั้งเป็นแนวนอน จะได้ไม่ดักคนที่เลื่อนหน้าลงมา

import { useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

// เส้นบาง 1px สี ring พื้นขาว ต่างจากปุ่ม outline ทั่วไป (1.5px สี outline)
const ARROW = 'border border-ring bg-white text-[17px] leading-none pointer-coarse:hidden'

export function Carousel({
  header,
  label,
  autoplaySeconds = 0,
  gap,
  className = '',
  children,
}: {
  /** หัวข้อของแถบ อยู่ซ้ายของปุ่ม ‹ › */
  header: React.ReactNode
  /** ชื่อแถบสำหรับ screen reader เช่น "โปรโมชัน" */
  label: string
  /** เลื่อนไปการ์ดถัดไปเองทุก N วินาที วนกลับเมื่อถึงท้าย · 0 = ไม่เลื่อนเอง · หยุดเมื่อชี้ แตะ หรือ focus อยู่ในแถบ */
  autoplaySeconds?: number
  /** ระยะห่างระหว่างการ์ด (px) ต้องตรงกับ gap ของ className ใช้คำนวณระยะที่ปุ่มเลื่อน */
  gap: number
  className?: string
  /** <li> ของแต่ละการ์ด */
  children: React.ReactNode
}) {
  const scroller = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const paused = useRef(false)
  const lastUserAt = useRef(0)

  const step = (dir: 1 | -1) => {
    const el = scroller.current
    const card = el?.firstElementChild
    if (!el || !card) return
    lastUserAt.current = Date.now()
    el.scrollBy({ left: dir * (card.getBoundingClientRect().width + gap), behavior: reduce ? 'auto' : 'smooth' })
  }

  useEffect(() => {
    const el = scroller.current
    if (!el || !autoplaySeconds || reduce) return
    const markUser = () => (lastUserAt.current = Date.now())
    el.addEventListener('pointerdown', markUser, { passive: true })
    el.addEventListener('wheel', markUser, { passive: true })
    lastUserAt.current = Date.now()

    const tick = setInterval(() => {
      if (paused.current || Date.now() - lastUserAt.current < autoplaySeconds * 1000) return
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) return
      const base = (el.firstElementChild as HTMLElement | null)?.offsetLeft ?? 0
      const next = [...el.children].find((c) => (c as HTMLElement).offsetLeft - base > el.scrollLeft + 4) as HTMLElement | undefined
      const to = el.scrollLeft >= max - 4 || !next ? 0 : Math.min(max, next.offsetLeft - base)
      el.scrollTo({ left: to, behavior: 'smooth' })
      lastUserAt.current = Date.now()
    }, 500)

    return () => {
      clearInterval(tick)
      el.removeEventListener('pointerdown', markUser)
      el.removeEventListener('wheel', markUser)
    }
  }, [autoplaySeconds, reduce])

  const pause = () => (paused.current = true)
  const resume = () => {
    paused.current = false
    lastUserAt.current = Date.now()
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        {header}
        <div className="flex gap-2.5">
          <Button variant="outline" size="icon" aria-label="เลื่อนไปทางซ้าย" onClick={() => step(-1)} className={ARROW}>
            ‹
          </Button>
          <Button variant="outline" size="icon" aria-label="เลื่อนไปทางขวา" onClick={() => step(1)} className={ARROW}>
            ›
          </Button>
        </div>
      </div>
      <ul
        ref={scroller}
        aria-label={label}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onFocus={pause}
        onBlur={resume}
        className={`flex overflow-x-auto overscroll-x-contain [scrollbar-width:none] ${className}`}
      >
        {children}
      </ul>
    </>
  )
}
