'use client'

// ตัวห่อให้ของ "ปรากฏ" (fade + เลื่อนขึ้น) ใช้ใน Server Component ได้ตรง ๆ: ห่อ markup เดิม หน้ายังเป็น server
// trigger="mount" เล่นทันทีที่โหลด (ของบนสุดของหน้า) ด้วย CSS (.rise ใน globals.css) ไม่รอ JS
//   ของบนสุดคือชื่อ ราคา และปุ่มติดต่อ ถ้ารอ React โหลดก่อน คนที่เปิดลิงก์จากมือถือจะเห็นหน้าว่างไปครู่หนึ่ง
// trigger="view" เล่นครั้งเดียวเมื่อเลื่อนมาถึง ด้วย motion

import { createContext, useContext, type CSSProperties } from 'react'
import { motion, type TargetAndTransition, type Variants } from 'motion/react'
import { LIFT, RISE, SPRING, STAGGER, STAGGER_CAP, VIEWPORT } from './tokens'

type Tag = 'div' | 'section' | 'aside' | 'ul' | 'ol' | 'li' | 'span' | 'dl' | 'p' | 'nav'
type Trigger = 'mount' | 'view'

type Props = {
  as?: Tag
  className?: string
  children?: React.ReactNode
}

const HIDDEN: TargetAndTransition = { opacity: 0, y: RISE }
const SHOWN: TargetAndTransition = { opacity: 1, x: 0, y: 0, scale: 1 }

// ตารางคงที่ หยิบตาม as ตอน render · ห้ามหยิบผ่านฟังก์ชัน: lint (react-hooks/static-components) จะมองว่าสร้าง component ใหม่ทุก render
// motion.ul / motion.li / ... มี props ต่างกันเล็กน้อย แต่ที่ใช้ที่นี่ใช้ได้ทุกตัว
const TAGS = {
  div: motion.div,
  section: motion.section,
  aside: motion.aside,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  span: motion.span,
  dl: motion.dl,
  p: motion.p,
  nav: motion.nav,
} as Record<Tag, typeof motion.div>

function playProps(trigger: Trigger) {
  return trigger === 'mount' ? { initial: 'hidden', animate: 'shown' } : { initial: 'hidden', whileInView: 'shown', viewport: VIEWPORT }
}

/** สภาพตอนเริ่มของ .rise จาก from แบบเดียวกับ motion · ไม่ระบุ opacity = ไม่ fade (เช่นรูปที่เป็น LCP) */
function riseStyle(from: TargetAndTransition, delay: number) {
  const num = (v: unknown, fallback: number) => (typeof v === 'number' ? v : fallback)
  return {
    '--rise-opacity': num(from.opacity, 1),
    '--rise-y': `${num(from.y, 0)}px`,
    '--rise-scale': num(from.scale, 1),
    '--rise-delay': `${delay}s`,
  } as CSSProperties
}

/** ของชิ้นเดียว · from = สภาพตอนเริ่ม (ค่าเริ่มต้น: โปร่งใส + ต่ำลง 16px) · lift = hover แล้วยกขึ้น (ใช้กับการ์ด) */
export function Reveal({
  as = 'div',
  trigger = 'view',
  delay = 0,
  from = HIDDEN,
  lift = false,
  className,
  children,
}: Props & { trigger?: Trigger; delay?: number; from?: TargetAndTransition; lift?: boolean }) {
  const Component = TAGS[as]
  if (trigger === 'mount') {
    const Plain = as
    return (
      <Plain className={`rise ${className ?? ''}`} style={riseStyle(from, delay)}>
        {children}
      </Plain>
    )
  }
  const variants: Variants = { hidden: from, shown: { ...SHOWN, transition: { ...SPRING, delay } } }
  return (
    <Component variants={variants} {...playProps(trigger)} whileHover={lift ? LIFT : undefined} className={className}>
      {children}
    </Component>
  )
}

/** Stagger แบบ mount ส่งเวลาเริ่มให้ลูก · ลูกบอกลำดับของตัวเองผ่าน order */
const MountStagger = createContext<{ delay: number } | null>(null)

/**
 * กลุ่มที่ลูก (StaggerItem) ขึ้นไล่กันทีละชิ้น · รวมทั้งชุดไม่เกิน STAGGER_CAP ต่อให้รายการยาว
 * trigger="mount": ลูกแต่ละตัวต้องใส่ order (0, 1, 2, ...) เพราะ CSS ไม่รู้ลำดับของลูกที่ซ้อนอยู่ลึก (เช่นบรรทัดในหัวข้อ)
 */
export function Stagger({ as = 'div', trigger = 'view', delay = 0, className, children }: Props & { trigger?: Trigger; delay?: number }) {
  const Component = TAGS[as]
  if (trigger === 'mount') {
    const Plain = as
    return (
      <MountStagger.Provider value={{ delay }}>
        <Plain className={className}>{children}</Plain>
      </MountStagger.Provider>
    )
  }
  const variants: Variants = {
    hidden: {},
    shown: { transition: { delayChildren: (i: number) => delay + Math.min(i * STAGGER, STAGGER_CAP) } },
  }
  return (
    <Component variants={variants} {...playProps(trigger)} className={className}>
      {children}
    </Component>
  )
}

/** ลูกของ Stagger · จังหวะมาจากตัวแม่ · lift = hover แล้วยกขึ้น · order = ลำดับในกลุ่ม ใช้เมื่อแม่เป็น trigger="mount" */
export function StaggerItem({
  as = 'div',
  from = HIDDEN,
  lift = false,
  order = 0,
  className,
  children,
}: Props & { from?: TargetAndTransition; lift?: boolean; order?: number }) {
  const mount = useContext(MountStagger)
  const Component = TAGS[as]
  if (mount) {
    const Plain = as
    return (
      <Plain className={`rise ${className ?? ''}`} style={riseStyle(from, mount.delay + Math.min(order * STAGGER, STAGGER_CAP))}>
        {children}
      </Plain>
    )
  }
  return (
    <Component variants={{ hidden: from, shown: SHOWN }} whileHover={lift ? LIFT : undefined} className={className}>
      {children}
    </Component>
  )
}
