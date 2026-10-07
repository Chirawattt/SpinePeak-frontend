'use client'

import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import type { Faq } from '@/catalog'

/** accordion ปิดไว้ทุกข้อ เปิดได้หลายข้อพร้อมกัน · คำตอบยังอยู่ใน DOM (hidden="until-found") Ctrl+F หาเจอและกางให้เอง */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="flex flex-col">
      {faqs.map((faq) => (
        <FaqItem key={faq.q} faq={faq} />
      ))}
    </div>
  )
}

function FaqItem({ faq }: { faq: Faq }) {
  const id = useId()
  const reduce = useReducedMotion()
  const [open, setOpen] = useState(false)
  // หุบเสร็จแล้ว (ไม่ใช่กำลังหุบ) ถึงจะซ่อนด้วย hidden="until-found" ไม่งั้น animation หุบจะไม่ทันเห็น
  const [collapsed, setCollapsed] = useState(true)
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = panel.current
    if (!el) return
    // React ยังไม่รู้จักค่า "until-found" ของ hidden จึงตั้งเอง
    if (collapsed) el.setAttribute('hidden', 'until-found')
    else el.removeAttribute('hidden')
  }, [collapsed])

  useEffect(() => {
    const el = panel.current
    if (!el) return
    // เบราว์เซอร์เจอคำที่ค้นในคำตอบที่หุบอยู่ → กางให้
    const reveal = () => {
      setCollapsed(false)
      setOpen(true)
    }
    el.addEventListener('beforematch', reveal)
    return () => el.removeEventListener('beforematch', reveal)
  }, [])

  const toggle = () => {
    if (!open) setCollapsed(false)
    setOpen(!open)
  }

  return (
    <div className="border-b border-line last:border-b-0">
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={toggle}
          className="flex w-full cursor-pointer items-start justify-between gap-4 py-[18px] text-left text-[17px] font-semibold hover:text-link-hover"
        >
          {faq.q}
          <motion.span aria-hidden animate={{ rotate: open ? 180 : 0 }} className="mt-0.5 flex-none text-[13px] text-muted">
            ▼
          </motion.span>
        </button>
      </h3>
      <motion.div
        ref={panel}
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        initial={false}
        animate={open ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={reduce ? { duration: 0 } : { type: 'spring', bounce: 0, visualDuration: 0.3 }}
        onAnimationComplete={() => {
          if (!open) setCollapsed(true)
        }}
        className="overflow-hidden"
      >
        <p className="pb-[18px] text-[15px] leading-[1.7] text-muted">{faq.a}</p>
      </motion.div>
    </div>
  )
}
