import Link from 'next/link'
import type { CourseSets, SetOffer } from '@/catalog'
import { SectionTitle } from '@/components/detail-page'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { SetCard } from '@/components/set-list-card'

/** การ์ด SET ที่มีคอร์สนี้ (ไม่เกิน 2 ใบ) ในคอลัมน์ขวาของหน้าคอร์ส ตาม docs/design-course-detail.dc.html · ที่เหลือลิงก์ไปหน้ารายการ SET */
export function SetOffers({ sets }: { sets: CourseSets }) {
  return (
    // หัวข้อแบบเดียวกับ "เนื้อหาในคอร์ส" · บนจอใหญ่อยู่แนวเดียวกับหัวข้อคอลัมน์ซ้าย
    <section aria-labelledby="set-offers-title">
      <SectionTitle id="set-offers-title">SET ที่มีคอร์สนี้</SectionTitle>
      {/* การ์ดกว้างเท่าการ์ดคอร์ส: คอลัมน์ขวาบนจอใหญ่วางได้ 2 ใบเคียงกัน */}
      <Stagger className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-5">
      {sets.offers.map((set) => (
        <StaggerItem key={set.slug} lift className="flex">
          <OfferCard set={set} />
        </StaggerItem>
      ))}
      {sets.more && (
        <StaggerItem className="col-span-full text-center">
          <Link href={sets.more.href} className="inline-flex min-h-11 items-center text-[14.5px] font-semibold hover:text-link-hover">
            {sets.more.label} →
          </Link>
        </StaggerItem>
      )}
      </Stagger>
    </section>
  )
}

/** การ์ด SET ใบเดียวกับหน้ารายการ · บรรทัดใต้ชื่อเทียบกับคอร์สที่ดูอยู่: จ่ายเพิ่มเท่าไร ได้อีกกี่คอร์ส */
function OfferCard({ set }: { set: SetOffer }) {
  return (
    <SetCard
      href={set.href}
      stack={set.stack}
      moreInStack={set.moreInStack}
      courseCount={set.courseCount}
      eyebrow={set.label}
      title={set.title}
      blurb={
        set.extra && (
          <>
            จ่ายเพิ่ม <span className="font-semibold text-ink">{set.extra.price}</span> ได้อีก {set.extra.courses} คอร์ส
          </>
        )
      }
      price={set.price}
      savings={set.savings}
    />
  )
}
