'use client'

// ตัวห่อให้ของ "ปรากฏ" (fade + เลื่อนขึ้น) ใช้ใน Server Component ได้ตรง ๆ: ห่อ markup เดิม หน้ายังเป็น server
// trigger="mount" เล่นทันทีที่โหลด (ของบนสุดของหน้า) · "view" เล่นครั้งเดียวเมื่อเลื่อนมาถึง

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

function tag(as: Tag) {
  // motion.ul / motion.li / ... มี props ต่างกันเล็กน้อย แต่ที่ใช้ที่นี่ใช้ได้ทุกตัว
  return motion[as] as typeof motion.div
}

function playProps(trigger: Trigger) {
  return trigger === 'mount' ? { initial: 'hidden', animate: 'shown' } : { initial: 'hidden', whileInView: 'shown', viewport: VIEWPORT }
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
  const Component = tag(as)
  const variants: Variants = { hidden: from, shown: { ...SHOWN, transition: { ...SPRING, delay } } }
  return (
    <Component variants={variants} {...playProps(trigger)} whileHover={lift ? LIFT : undefined} className={className}>
      {children}
    </Component>
  )
}

/** กลุ่มที่ลูก (StaggerItem) ขึ้นไล่กันทีละชิ้น · รวมทั้งชุดไม่เกิน STAGGER_CAP ต่อให้รายการยาว */
export function Stagger({ as = 'div', trigger = 'view', delay = 0, className, children }: Props & { trigger?: Trigger; delay?: number }) {
  const Component = tag(as)
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

/** ลูกของ Stagger · จังหวะมาจากตัวแม่ · lift = hover แล้วยกขึ้น */
export function StaggerItem({ as = 'div', from = HIDDEN, lift = false, className, children }: Props & { from?: TargetAndTransition; lift?: boolean }) {
  const Component = tag(as)
  return (
    <Component variants={{ hidden: from, shown: SHOWN }} whileHover={lift ? LIFT : undefined} className={className}>
      {children}
    </Component>
  )
}
