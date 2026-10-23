import Link from 'next/link'
import type { SetListCard as SetListCardData } from '@/catalog/set-list'
import { SetCoverStack } from '@/components/set-cover-stack'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cardVariants } from '@/components/ui/card'

/** การ์ด SET ในหน้ารายการ SET · ทั้งใบกดเข้าหน้ารายละเอียด SET */
export function SetListCard({ card }: { card: SetListCardData }) {
  return (
    <Link
      href={card.href}
      className={cardVariants({
        variant: 'featured',
        className: 'group flex w-full flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_12px_32px_rgb(11_43_51/0.08)] transition-shadow hover:shadow-[0_18px_40px_rgb(11_43_51/0.14)]',
      })}
    >
      <div className="relative overflow-hidden bg-ink px-[22px] pt-5 pb-[22px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.3px,transparent_1.4px)] bg-size-[22px_22px] opacity-70" />
        <div className="relative mb-[18px] flex items-center justify-between gap-2.5">
          <Badge className="font-bold">SET · {card.courseCount}</Badge>
          {card.savings && <span className="font-mono text-[12.5px] font-semibold text-brand">ประหยัด {card.savings.percent}</span>}
        </div>
        <SetCoverStack stack={card.stack} more={card.moreInStack} />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 px-[22px] pt-5 pb-[22px]">
        <div className="font-mono text-xs font-semibold text-eyebrow">{card.eyebrow}</div>
        <h3 className="font-heading text-[22px] leading-[1.3] font-bold text-pretty">{card.title}</h3>
        <p className="text-[15px] leading-[1.6] text-ink-soft">{card.tagline}</p>
        <ul className="mt-1 flex flex-1 flex-col gap-[7px] border-y border-divider-soft py-3.5">
          {card.listed.map((course) => (
            <li key={course.title} className="flex justify-between gap-3 text-[14.5px]">
              <span className="flex min-w-0 items-baseline gap-[9px]">
                <span aria-hidden className="h-[7px] w-[7px] flex-none -translate-y-px rounded-full border-[1.5px] border-ink bg-brand" />
                {course.title}
              </span>
              <span className="flex-none text-[13.5px] text-strike">{course.price}</span>
            </li>
          ))}
          {card.moreListed > 0 && <li className="pl-4 text-sm text-eyebrow">และอีก {card.moreListed} คอร์ส</li>}
        </ul>
        {card.stats.length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13.5px] text-muted">
            {card.stats.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        )}
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2.5">
              <span className="font-heading text-[28px] font-bold">{card.price}</span>
              {card.savings && (
                <span className="text-[15px] text-strike line-through">
                  <span className="sr-only">ราคาปกติ </span>
                  {card.savings.regularPrice}
                </span>
              )}
            </div>
            {card.savings && <div className="text-[13.5px] text-eyebrow">ประหยัด {card.savings.amount} เทียบกับซื้อแยก</div>}
          </div>
          <span className={buttonVariants({ variant: 'brand', className: 'group-hover:bg-brand/85' })}>ดู SET นี้</span>
        </div>
      </div>
    </Link>
  )
}
