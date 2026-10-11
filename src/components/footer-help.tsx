'use client'

import dynamic from 'next/dynamic'
import { useRef, useState, type ReactNode } from 'react'
import type { Faq, HelpStep } from '@/catalog'
import type { HelpSection } from '@/components/help-dialog'

// modal โหลดตอนกดครั้งแรก · เอาเมาส์ไปชี้หรือโฟกัสลิงก์ก็เริ่มโหลดล่วงหน้า
const loadDialog = () => import('@/components/help-dialog').then((m) => m.HelpDialog)
const HelpDialog = dynamic(loadDialog, { ssr: false })

/**
 * ลิงก์ "วิธีสมัครเรียน" / "คำถามที่พบบ่อย" ใน footer ที่เปิด modal แทนการเปลี่ยนหน้า (URL ไม่เปลี่ยน)
 * ส่วนที่ไม่มีเนื้อหาใน site.json จะไม่มีลิงก์และไม่มีแท็บ
 */
export function FooterHelp({
  steps,
  faqs,
  linkClassName,
  children,
}: {
  steps: HelpStep[]
  faqs: Faq[]
  linkClassName: string
  /** ปุ่มทักแอดมินท้าย modal */
  children: ReactNode
}) {
  const sections: { id: HelpSection; label: string }[] = []
  if (steps.length > 0) sections.push({ id: 'apply', label: 'วิธีสมัครเรียน' })
  if (faqs.length > 0) sections.push({ id: 'faq', label: 'คำถามที่พบบ่อย' })

  // เคยกดแล้ว = โหลดโค้ด modal แล้ว · ปิดแล้วยังคงไว้ เพื่อให้เล่น animation ตอนปิดได้
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<HelpSection>('apply')
  const opener = useRef<HTMLElement | null>(null)

  return (
    <>
      {sections.map((s) => (
        <button
          key={s.id}
          type="button"
          aria-haspopup="dialog"
          onPointerEnter={loadDialog}
          onFocus={loadDialog}
          onClick={(e) => {
            opener.current = e.currentTarget
            setSection(s.id)
            setLoaded(true)
            setOpen(true)
          }}
          className={`cursor-pointer text-left ${linkClassName}`}
        >
          {s.label}
        </button>
      ))}
      {loaded && (
        <HelpDialog
          open={open}
          onOpenChange={setOpen}
          section={section}
          onSectionChange={setSection}
          sections={sections}
          steps={steps}
          faqs={faqs}
          finalFocus={opener}
        >
          {children}
        </HelpDialog>
      )}
    </>
  )
}
