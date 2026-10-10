import Link from 'next/link'
import type { CourseSets } from '@/catalog'
import { Stagger, StaggerItem } from '@/components/motion/reveal'

/** การ์ด SET ที่มีคอร์สนี้ (ไม่เกิน 2 ใบ) ในคอลัมน์ขวาของหน้าคอร์ส ตาม docs/design-course-detail.dc.html · ที่เหลือลิงก์ไปหน้ารายการ SET */
export function SetOffers({ sets }: { sets: CourseSets }) {
  return (
    <Stagger as="section" aria-label="SET ที่มีคอร์สนี้" className="flex flex-col gap-5">
      {sets.offers.map((set) => (
        <StaggerItem key={set.slug} lift>
          <Link href={set.href} className="group block rounded-[20px] border-[1.5px] border-ink bg-set-wash p-6">
            <div className="mb-2.5 font-mono text-xs font-semibold text-eyebrow">{set.label}</div>
            <div className="mb-2 font-heading text-xl leading-[1.35] font-semibold group-hover:text-link-hover">{set.title}</div>
            <div className="mb-3.5 text-[14.5px] leading-[1.65] text-muted">{set.summary}</div>
            <div className="mb-1 flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-heading text-[28px] font-bold">{set.price}</span>
              {set.savings && (
                <span className="text-[15px] text-strike line-through">
                  <span className="sr-only">ราคาปกติ </span>
                  {set.savings.regularPrice}
                </span>
              )}
            </div>
            {set.savings && <div className="mb-4 text-sm text-eyebrow">ประหยัด {set.savings.amount}</div>}
            <span className="block rounded-full bg-brand p-3.5 text-center font-semibold transition-colors group-hover:bg-brand/85">ดู SET นี้</span>
          </Link>
        </StaggerItem>
      ))}
      {sets.more && (
        <StaggerItem className="text-center">
          <Link href={sets.more.href} className="text-[14.5px] font-semibold hover:text-link-hover">
            {sets.more.label} →
          </Link>
        </StaggerItem>
      )}
    </Stagger>
  )
}
