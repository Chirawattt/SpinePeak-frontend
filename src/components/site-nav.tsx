'use client'

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import type { NavLink } from '@/catalog'
import { QUICK } from '@/components/motion/tokens'

const MotionLink = motion.create(Link)

// เส้นใต้โผล่ = ยืดจากซ้าย · หาย = หดออกไปทางขวา (ทั้งเส้น hover และเส้น active)
const HIDDEN_LEFT = { clipPath: 'inset(0% 100% 0% 0%)' }
const SHOWN = { clipPath: 'inset(0% 0% 0% 0%)' }
const HIDDEN_RIGHT = { clipPath: 'inset(0% 0% 0% 100%)' }
const INSTANT = { duration: 0 }

const BAR = 'pointer-events-none absolute inset-x-0 -bottom-1 h-0.5 rounded-full'

// ลิงก์ไปส่วนในหน้าแรก (/#teacher) ไม่นับเป็น active
// หน้าย่อยนับด้วย: /courses/c1 ทำให้ "คอร์สเรียน" active
export function isNavActive(href: string, pathname: string): boolean {
  if (href.includes('#')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

type Bar = { active: string | null; entering: string | null; leaving: string | null }

/**
 * เส้น active ย้ายเมนู → เลื่อนข้าม (layoutId)
 * จากหน้าที่ไม่มีเมนู active → ยืดออก (entering) · ไปหน้าที่ไม่มีเมนู active → หดออก (leaving)
 * โหลดหน้าครั้งแรกไม่มี motion: entering เป็น null
 */
function nextBar(prev: Bar, active: string | null): Bar {
  return {
    active,
    entering: prev.active === null ? active : null,
    leaving: active === null ? prev.active : null,
  }
}

export function SiteNav({ items }: { items: NavLink[] }) {
  const pathname = usePathname()
  const active = items.find((item) => isNavActive(item.href, pathname))?.href ?? null

  const [bar, setBar] = useState<Bar>({ active, entering: null, leaving: null })
  if (bar.active !== active) setBar(nextBar(bar, active))

  return (
    // layoutRoot: header เป็น sticky ให้วัดตำแหน่งเส้นเทียบกับเมนู ไม่ใช่ทั้งหน้า (ไม่งั้นเส้นจะลอยตามระยะ scroll)
    <motion.nav layoutRoot className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium sm:gap-x-5 sm:text-[15px]">
      {items.map((item) => (
        <NavItem
          key={item.href}
          item={item}
          active={item.href === active}
          entering={item.href === bar.entering}
          leaving={item.href === bar.leaving}
          onLeft={() => setBar((b) => ({ ...b, leaving: null }))}
        />
      ))}
    </motion.nav>
  )
}

function NavItem({
  item,
  active,
  entering,
  leaving,
  onLeft,
}: {
  item: NavLink
  active: boolean
  entering: boolean
  leaving: boolean
  onLeft: () => void
}) {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)

  return (
    <MotionLink
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className="relative transition-colors hover:text-link-hover aria-[current=page]:text-link-hover"
      // motion ไม่นับการแตะบนจอสัมผัสเป็น hover เส้นจึงไม่ค้าง
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
    >
      {item.label}

      <AnimatePresence>
        {(hovered || focused) && !active && (
          <motion.span
            key="hover"
            aria-hidden
            className={`${BAR} bg-link-hover/40`}
            initial={HIDDEN_LEFT}
            animate={SHOWN}
            exit={HIDDEN_RIGHT}
            transition={reduce ? INSTANT : QUICK}
          />
        )}
      </AnimatePresence>

      {(active || leaving) && (
        <motion.span
          layoutId="nav-active-bar"
          aria-hidden
          className={`${BAR} bg-link-hover`}
          initial={entering ? HIDDEN_LEFT : false}
          animate={active ? SHOWN : HIDDEN_RIGHT}
          // clipPath ไม่ถูกปิดโดย reducedMotion="user" ของ MotionProvider จึงปิดเอง (layout ถูกปิดให้แล้ว)
          transition={reduce ? INSTANT : undefined}
          onAnimationComplete={() => {
            if (leaving) onLeft()
          }}
        />
      )}
    </MotionLink>
  )
}
