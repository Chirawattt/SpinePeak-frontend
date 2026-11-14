'use client'

import { useEffect } from 'react'

/**
 * วัดความสูงจริงของ header ที่ติดบนสุด แล้วเขียนลง --header-h ให้ของที่ติดใต้ header (แถบค้นหา, การ์ดราคา) ไม่ซ้อนทับ
 * cssVar: ใช้วัดแถบที่ติดอื่นได้ด้วย เช่น แถบตัวกรอง → --filter-h
 */
export function HeaderHeight({ targetId, cssVar = '--header-h' }: { targetId: string; cssVar?: string }) {
  useEffect(() => {
    const header = document.getElementById(targetId)
    if (!header) return
    const root = document.documentElement
    const observer = new ResizeObserver(() => root.style.setProperty(cssVar, `${header.offsetHeight}px`))
    observer.observe(header)
    return () => observer.disconnect()
  }, [targetId, cssVar])
  return null
}
