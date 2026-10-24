import Link from 'next/link'
import { catalog } from '@/catalog'
import { HeaderHeight } from '@/components/header-height'
import { Logo } from '@/components/logo'
import { SiteNav } from '@/components/site-nav'

// ไม่มีปุ่ม "เข้าสู่ระบบ": ระบบสมาชิกเป็นเฟส 2
// เมนูมาจาก catalog: ลิงก์ไปส่วนที่ซ่อนอยู่ (เช่น รีวิวที่ยังว่าง) จะไม่โผล่
export function SiteHeader() {
  const nav = catalog.landing().nav
  return (
    <header id="site-header" className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-divider bg-white/95 px-gutter py-3 backdrop-blur-sm">
      <Link href="/" className="shrink-0">
        <Logo size={50} eager />
      </Link>
      <SiteNav items={nav} />
      <HeaderHeight targetId="site-header" />
    </header>
  )
}
