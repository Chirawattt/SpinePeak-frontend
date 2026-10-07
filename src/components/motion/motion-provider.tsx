'use client'

import { MotionConfig } from 'motion/react'
import { SPRING } from './tokens'

/** ครอบทั้งเว็บ · reducedMotion="user": เครื่องที่ตั้งลดการเคลื่อนไหวไว้จะไม่มีการเลื่อน / ย่อขยาย เหลือแค่ fade */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      {children}
    </MotionConfig>
  )
}
