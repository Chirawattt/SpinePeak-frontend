import Link from 'next/link'
import { catalog } from '@/catalog'
import { HeaderHeight } from '@/components/header-height'
import { Logo } from '@/components/logo'

// ไม่มีปุ่ม "เข้าสู่ระบบ": ระบบสมาชิกเป็นเฟส 2
// เมนูมาจาก catalog: ลิงก์ไปส่วนที่ซ่อนอยู่ (เช่น รีวิวที่ยังว่าง) จะไม่โผล่
export function SiteHeader() {
  const nav = catalog.landing().nav
  return (
    <header id="site-header" className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-divider bg-white/95 px-gutter py-[18px] backdrop-blur-sm">
      <Link href="/" className="shrink-0">
        <Logo size={44} priority />
      </Link>
      <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium sm:gap-x-5 sm:text-[15px]">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-link-hover">
            {item.label}
          </Link>
        ))}
      </nav>
      <HeaderHeight targetId="site-header" />
    </header>
  )
}
