import { ArrowRightIcon } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * บรรทัดท้ายการ์ดคอร์ส / SET ("ดูรายละเอียด →", "ดู SET นี้ →") · บอกว่าทั้งใบกดได้ โดยไม่เป็นปุ่มทึบที่แย่งความเด่นจากราคา
 * ปุ่มเด่นสงวนไว้ให้ "ทักแอดมินเพื่อสมัคร" ในหน้ารายละเอียด · hover ใช้ group ของการ์ด (การ์ดทั้งใบเป็นลิงก์)
 */
export function CardMore({ children }: { children: ReactNode }) {
  return (
    <span className="mt-1.5 flex items-center justify-between gap-3 border-t border-divider-soft pt-3.5 text-[15px] font-semibold text-ink transition-colors group-hover:text-link-hover">
      {children}
      <ArrowRightIcon aria-hidden className="size-[18px] flex-none transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:translate-x-1" />
    </span>
  )
}
