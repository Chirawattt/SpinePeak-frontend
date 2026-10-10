'use client'

import { useEffect } from 'react'

/** วัดความสูงจริงของ header ที่ติดบนสุด แล้วเขียนลง --header-h ให้ของที่ติดใต้ header (แถบค้นหา, การ์ดราคา) ไม่ซ้อนทับ */
export function HeaderHeight({ targetId }: { targetId: string }) {
  useEffect(() => {
    const header = document.getElementById(targetId)
    if (!header) return
    const root = document.documentElement
    const observer = new ResizeObserver(() => root.style.setProperty('--header-h', `${header.offsetHeight}px`))
    observer.observe(header)
    return () => observer.disconnect()
  }, [targetId])
  return null
}
