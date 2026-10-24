import Image from 'next/image'
import { catalog } from '@/catalog'

// eager: โลโก้ใน header โหลดทันที ไม่ preload เพราะไม่ใช่ LCP จะได้ไม่แย่งรูปหลักของหน้า
// ใช้ไฟล์ใน public/ ตรง ๆ: brand.logo ใน site.json ยังชี้ path เก่าที่ไม่มีไฟล์จริง
export function Logo({ size, eager, className = '' }: { size: number; eager?: boolean; className?: string }) {
  const { name } = catalog.siteInfo()

  return (
    <Image
      src="/spine-peak-logo.png"
      alt={name}
      width={size}
      height={size}
      loading={eager ? 'eager' : undefined}
      className={`block ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
