import { catalog } from '@/catalog'

/**
 * บรรทัดเล็กใต้ปุ่มติดต่อหลัก บอกว่ากดแล้วเกิดอะไร (ข้อความจาก site.json → brand.contactNote) · ว่าง = ไม่แสดง
 * สีค่าเริ่มต้นสำหรับพื้นขาว · บนพื้นฟ้า (แถบท้ายหน้า) ส่ง className="text-band-ink" ให้ตัวอักษรเข้มพอ
 */
export function ContactNote({ className = 'text-muted' }: { className?: string }) {
  const { contactNote } = catalog.siteInfo()
  if (!contactNote) return null
  return <p className={`text-sm leading-normal ${className}`}>{contactNote}</p>
}
