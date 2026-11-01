import Link from 'next/link'
import type { CourseSets, SetOffer } from '@/catalog'
import { SectionTitle } from '@/components/detail-page'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { SetCoverFan } from '@/components/set-cover-stack'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cardVariants } from '@/components/ui/card'

/** การ์ด SET ที่มีคอร์สนี้ (ไม่เกิน 2 ใบ) ในคอลัมน์ขวาของหน้าคอร์ส ตาม docs/design-course-detail.dc.html · ที่เหลือลิงก์ไปหน้ารายการ SET */
export function SetOffers({ sets }: { sets: CourseSets }) {
  return (
    // หัวข้อแบบเดียวกับ "เนื้อหาในคอร์ส" · บนจอใหญ่อยู่แนวเดียวกับหัวข้อคอลัมน์ซ้าย
    <section aria-labelledby="set-offers-title">
      <SectionTitle id="set-offers-title">SET ที่มีคอร์สนี้</SectionTitle>
      <Stagger className="flex flex-col gap-5">
      {sets.offers.map((set) => (
        <StaggerItem key={set.slug} lift>
          <OfferCard set={set} />
        </StaggerItem>
      ))}
      {sets.more && (
        <StaggerItem className="text-center">
          <Link href={sets.more.href} className="inline-flex min-h-11 items-center text-[14.5px] font-semibold hover:text-link-hover">
            {sets.more.label} →
          </Link>
        </StaggerItem>
      )}
      </Stagger>
    </section>
  )
}

/**
 * การ์ด SET แบบเดียวกับหน้ารายการ SET (หัวพื้น ink + ปกแบบพัด) แต่หัวเตี้ยกว่า เพราะอยู่ในคอลัมน์ข้างเนื้อหา
 * เนื้อการ์ดเทียบกับคอร์สที่ดูอยู่: จ่ายเพิ่มเท่าไร ได้คอร์สอะไรเพิ่ม
 */
function OfferCard({ set }: { set: SetOffer }) {
  return (
    <Link
      href={set.href}
      className={cardVariants({
        variant: 'featured',
        className:
          'group group/card flex flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_12px_32px_rgb(11_43_51/0.08)] transition-shadow hover:shadow-[0_18px_40px_rgb(11_43_51/0.14)]',
      })}
    >
      <div className="relative isolate flex items-center justify-between gap-3 overflow-hidden bg-ink py-3 pr-2 pl-[22px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.3px,transparent_1.4px)] bg-size-[22px_22px] opacity-70" />
        <Badge className="relative z-10 font-bold whitespace-nowrap">SET · {set.courseCount}</Badge>
        <div className="relative h-[84px] w-[168px] flex-none sm:h-[100px] sm:w-[200px]">
          <SetCoverFan stack={set.stack} more={set.moreInStack} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-[22px] pt-5 pb-[22px]">
        <div className="text-[13px] font-semibold text-eyebrow">{set.label}</div>
        <h3 className="font-heading text-[22px] leading-[1.3] font-bold text-pretty group-hover:text-link-hover">{set.title}</h3>
        {set.extra && (
          <p className="text-[15px] leading-[1.6] text-ink-soft">
            จ่ายเพิ่ม <span className="font-semibold text-ink">{set.extra.price}</span> ได้อีก {set.extra.courses} คอร์ส
          </p>
        )}
        {set.added.length > 0 && (
          <ul aria-label="คอร์สที่ได้เพิ่ม" className="flex flex-col gap-[7px] border-y border-divider-soft py-3.5">
            {set.added.map((title) => (
              <li key={title} className="flex items-baseline gap-[9px] text-[14.5px]">
                <span aria-hidden className="h-[7px] w-[7px] flex-none -translate-y-px rounded-full border-[1.5px] border-ink bg-brand" />
                {title}
              </li>
            ))}
            {set.moreAdded > 0 && <li className="pl-4 text-sm text-eyebrow">และอีก {set.moreAdded} คอร์ส</li>}
          </ul>
        )}
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-2.5">
              <span className="font-heading text-[28px] font-bold">{set.price}</span>
              {set.savings && (
                <span className="text-[15px] text-strike line-through">
                  <span className="sr-only">ราคาปกติ </span>
                  {set.savings.regularPrice}
                </span>
              )}
            </div>
            {set.savings && (
              // ยอดเงินกับ % เป็นก้อนเดียว ไม่ตัดบรรทัดกลาง เช่น "ประหยัด 506.- (25%) เทียบกับซื้อแยก"
              <div className="text-[13.5px] text-eyebrow">
                ประหยัด{' '}
                <span className="font-semibold whitespace-nowrap">
                  {set.savings.amount} ({set.savings.percent})
                </span>{' '}
                เทียบกับซื้อแยก
              </div>
            )}
          </div>
          <span className={buttonVariants({ variant: 'brand', className: 'group-hover:bg-brand/85' })}>ดู SET นี้</span>
        </div>
      </div>
    </Link>
  )
}
