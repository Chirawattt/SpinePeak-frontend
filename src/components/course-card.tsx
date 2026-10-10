import Link from 'next/link'
import type { CourseCard as CourseCardData } from '@/catalog'
import { CoverBox } from '@/components/cover-box'

/** การ์ดคอร์สตาม docs/design-courses.dc.html · ทั้งใบกดเข้าหน้ารายละเอียดคอร์ส (design ให้กดแค่ปุ่ม แต่ทั้งใบกดง่ายกว่าบนมือถือ) */
export function CourseCard({ card }: { card: CourseCardData }) {
  return (
    <Link
      href={card.href}
      className="group flex w-full flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-shadow hover:shadow-card"
    >
      <CoverBox cover={card.cover} label={card.label} title={card.title} className="rounded-none!" />
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
          {card.setCount && <span className="rounded-full bg-brand-wash px-[11px] py-[5px] text-[12.5px] font-semibold">{card.setCount}</span>}
        </div>
        <span className="mt-1 rounded-full bg-brand p-[13px] text-center font-semibold transition-colors group-hover:bg-brand/85">ดูรายละเอียด</span>
      </div>
    </Link>
  )
}
