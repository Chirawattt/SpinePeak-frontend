'use client'

// ลิงก์ / ปุ่มที่ยุบลงนิดหนึ่งตอนกด · สี hover ยังเป็น CSS เดิม

import { motion } from 'motion/react'
import Link from 'next/link'
import { PRESS } from './tokens'

const MotionLink = motion.create(Link)

export function PressAnchor(props: React.ComponentProps<typeof motion.a>) {
  return <motion.a whileTap={PRESS} {...props} />
}

export function PressLink(props: React.ComponentProps<typeof MotionLink>) {
  return <MotionLink whileTap={PRESS} {...props} />
}
