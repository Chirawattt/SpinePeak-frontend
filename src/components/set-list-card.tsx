import Link from 'next/link'
import type { ReactNode } from 'react'
import type { SetSavings } from '@/catalog/set-card'
import type { CoverTile, SetListCard as SetListCardData } from '@/catalog/set-list'
import { SetCoverFan } from '@/components/set-cover-stack'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cardVariants } from '@/components/ui/card'

export type SetCardProps = {
  href: string
  stack: CoverTile[]
  moreInStack: number
  /** เช่น "3 คอร์ส" */
  courseCount: string
  eyebrow: string
  title: string
  /** บรรทัดใต้ชื่อ: คำโปรยของ SET หรือ "จ่ายเพิ่ม … ได้อีก N คอร์ส" บนหน้าคอร์ส · ไม่เกิน 2 บรรทัด */
  blurb?: ReactNode
  /** ยอดรวมบรรทัดเดียว เช่น "VDO 20 ชม. · PDF 166 หน้า · 220 ข้อ" */
  facts?: string
  price: string
  savings?: SetSavings
  /** ป้ายที่เจ้าของใส่บนการ์ดของแนะนำ เช่น "ขายดี" */
  label?: string
}

/**
 * การ์ด SET ใบเดียวที่ใช้ทุกหน้า (รายการคอร์ส, หน้าแรก, หน้าคอร์ส) · ขนาดและลำดับช่องเดียวกับการ์ดคอร์ส
 * (ปก 16:9 → หมวดหมู่ → ชื่อ → คำโปรย → ยอดรวม → ราคา + ป้าย → ปุ่ม) · ปกพื้นเข้มแบบพัดบอกว่าเป็น SET
 * รายชื่อคอร์สกับราคาเดี่ยวอยู่ในหน้ารายละเอียด SET · ทั้งใบกดเข้าหน้ารายละเอียด SET
 */
export function SetCard({ href, stack, moreInStack, courseCount, eyebrow, title, blurb, facts, price, savings, label }: SetCardProps) {
  return (
    <Link href={href} className={cardVariants({ variant: 'tile', className: 'group group/card flex w-full flex-col' })}>
      <div className="relative isolate aspect-video overflow-hidden bg-ink">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.3px,transparent_1.4px)] bg-size-[22px_22px] opacity-70" />
        <SetCoverFan stack={stack} more={moreInStack} />
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5">
          {label && (
            <Badge variant="ink" size="sm" className="leading-4 text-white ring-1 ring-brand/40">
              {label}
            </Badge>
          )}
          <Badge className="font-bold">SET · {courseCount}</Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-[9px] px-5 pt-[18px] pb-5">
        <div className="font-mono text-xs font-semibold text-eyebrow">{eyebrow}</div>
        <h3 className="font-heading text-xl leading-[1.3] font-semibold text-pretty">{title}</h3>
        <p className="line-clamp-2 flex-1 text-[14.5px] leading-[1.6] text-muted">{blurb}</p>
        {facts && <div className="text-[13.5px] text-muted">{facts}</div>}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2.5">
          <span className="flex items-baseline gap-2">
            <span className="font-heading text-[25px] font-bold">{price}</span>
            {savings && (
              <span className="text-[14px] text-strike line-through">
                <span className="sr-only">ราคาปกติ </span>
                {savings.regularPrice}
              </span>
            )}
          </span>
          {savings && (
            <Badge variant="wash" size="sm">
              ประหยัด {savings.percent}
            </Badge>
          )}
        </div>
        <span className={buttonVariants({ variant: 'brand', className: 'mt-1 group-hover:bg-brand/85' })}>ดู SET นี้</span>
      </div>
    </Link>
  )
}

/** การ์ด SET จากข้อมูลหน้ารายการ · ใช้ในหน้ารายการคอร์สและคอร์สขายดีบนหน้าแรก */
export function SetListCard({ card, label }: { card: SetListCardData; label?: string }) {
  return (
    <SetCard
      href={card.href}
      stack={card.stack}
      moreInStack={card.moreInStack}
      courseCount={card.courseCount}
      eyebrow={card.eyebrow}
      title={card.title}
      blurb={card.tagline}
      facts={card.facts}
      price={card.price}
      savings={card.savings}
      label={label}
    />
  )
}
