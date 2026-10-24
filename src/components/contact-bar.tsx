'use client'

import { useEffect, useState } from 'react'

/** ปุ่มติดต่อที่ทำเครื่องหมายไว้ (ContactButton watched) · แถบจะซ่อนเมื่อมีปุ่มพวกนี้อยู่ในจอ */
const WATCHED = '[data-contact-cta]'

/**
 * แถบติดต่อติดขอบล่างบนมือถือ ในหน้ารายละเอียดคอร์ส / SET · จอใหญ่ไม่มี (การ์ดราคาอยู่คอลัมน์ขวาตลอด)
 * ขึ้นเฉพาะตอนที่ไม่มีปุ่มติดต่อตัวอื่นอยู่ในจอ: เลื่อนผ่านการ์ดราคาไปแล้ว และยังไม่ถึงแถบท้ายหน้า ปุ่มเดียวกันจะได้ไม่ซ้อนสองที่
 * children = ปุ่มติดต่อ (Server Component ส่งมา เพื่อให้ลิงก์ผูกกับคอร์ส / SET ที่ดูอยู่)
 */
export function ContactBar({ title, price, children }: { title: string; price: string; children: React.ReactNode }) {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const targets = [...document.querySelectorAll(WATCHED)]
    if (targets.length === 0) return
    const onScreen = new Set<Element>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target)
        else onScreen.delete(entry.target)
      }
      setShown(onScreen.size === 0)
    })
    targets.forEach((t) => observer.observe(t))
    return () => observer.disconnect()
  }, [])

  return (
    <div
      // ซ่อนอยู่ = กด / tab ไม่ได้ และโปรแกรมอ่านหน้าจอไม่อ่าน
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 border-t border-card-line bg-white px-gutter pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(11_43_51/0.08)] transition-[translate,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none md:hidden ${shown ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'}`}
    >
      <div className="min-w-0">
        <div className="truncate text-[13.5px] text-muted">{title}</div>
        <div className="font-heading text-[22px] leading-tight font-bold">{price}</div>
      </div>
      {children}
    </div>
  )
}
