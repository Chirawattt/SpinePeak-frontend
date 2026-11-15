import Link from 'next/link'
import type { CourseCard as CourseCardData } from '@/catalog'
import { CoverBox } from '@/components/cover-box'
import { Badge } from '@/components/ui/badge'
import { CardMore } from '@/components/card-more'
import { cardVariants } from '@/components/ui/card'

/** การ์ดคอร์สตาม docs/design-courses.dc.html · ใช้ทั้งหน้ารายการและคอร์สขายดีบนหน้าแรก (label = ป้ายที่เจ้าของใส่) · ทั้งใบกดเข้าหน้ารายละเอียดคอร์ส (design ให้กดแค่ปุ่ม แต่ทั้งใบกดง่ายกว่าบนมือถือ) */
export function CourseCard({ card, label }: { card: CourseCardData; label?: string }) {
  return (
    <Link
      href={card.href}
      className={cardVariants({ variant: 'tile', className: 'group flex w-full flex-col' })}
    >
      <div className="relative">
        <CoverBox cover={card.cover} label={card.label} title={card.title} className="rounded-none!" />
        {label && (
          <Badge variant="ink" size="sm" className="absolute top-3 left-3 leading-4 text-white ring-1 ring-brand/40">
            {label}
          </Badge>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[9px] px-5 pt-[18px] pb-5">
        <div className="font-mono text-xs font-semibold text-eyebrow">{card.eyebrow}</div>
        <h3 className="font-heading text-xl leading-[1.3] font-semibold">{card.title}</h3>
        <p className="flex-1 text-[14.5px] leading-[1.6] text-muted">{card.tagline}</p>
        {(card.facts || card.teacher) && (
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[13.5px] text-muted">
            {card.facts && <span>{card.facts}</span>}
            {card.teacher && <span>{card.teacher}</span>}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2.5">
          <span className="font-heading text-[25px] font-bold">{card.price}</span>
          {card.setCount && <Badge variant="wash" size="sm">{card.setCount}</Badge>}
        </div>
        <CardMore>ดูรายละเอียด</CardMore>
      </div>
    </Link>
  )
}
