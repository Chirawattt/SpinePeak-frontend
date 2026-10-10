import Image from 'next/image'
import Link from 'next/link'
import type { SetListCard as SetListCardData } from '@/catalog/set-list'

// มุมเอียงของปกในกอง ใบหน้าสุดก่อน ตาม docs/design-sets.dc.html
const TILT = ['-rotate-3', 'rotate-[1.5deg]', 'rotate-[4deg]']

/** การ์ด SET ในหน้ารายการ SET · ทั้งใบกดเข้าหน้ารายละเอียด SET */
export function SetListCard({ card }: { card: SetListCardData }) {
  return (
    <Link
      href={card.href}
      className="group flex w-full flex-col overflow-hidden rounded-[22px] border-[1.5px] border-ink bg-white shadow-[0_12px_32px_rgb(11_43_51/0.08)] transition-shadow hover:shadow-[0_18px_40px_rgb(11_43_51/0.14)]"
    >
      <div className="relative overflow-hidden bg-ink px-[22px] pt-5 pb-[22px]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.3px,transparent_1.4px)] bg-size-[22px_22px] opacity-70" />
        <div className="relative mb-[18px] flex items-center justify-between gap-2.5">
          <span className="rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-bold">SET · {card.courseCount}</span>
          {card.savings && <span className="font-mono text-[12.5px] font-semibold text-brand">ประหยัด {card.savings.percent}</span>}
        </div>
        <div aria-hidden className="relative flex items-center">
          {card.stack.map((tile, i) => (
            <div
              key={tile.title}
              style={{ zIndex: 4 - i }}
              className={`relative flex aspect-[4/3] w-[clamp(96px,28%,128px)] flex-none items-end overflow-hidden rounded-xl border-[3px] border-ink bg-[repeating-linear-gradient(135deg,var(--color-brand-wash),var(--color-brand-wash)_9px,#d4f2fb_9px,#d4f2fb_18px)] p-2 text-[11px] leading-[1.3] font-semibold ${i > 0 ? '-ml-[18px]' : ''} ${TILT[i]}`}
            >
              {tile.image ? <Image src={tile.image} alt="" fill sizes="128px" className="object-cover" /> : tile.title}
            </div>
          ))}
          {card.moreInStack > 0 && (
            <div className="relative z-[5] -ml-3.5 flex h-[52px] w-[52px] flex-none items-center justify-center rounded-full border-[3px] border-ink bg-brand font-mono text-sm font-bold">
              +{card.moreInStack}
            </div>
          )}
        </div>
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
          <span className="rounded-full bg-brand px-6 py-3 text-[15.5px] font-semibold transition-colors group-hover:bg-brand/85">ดู SET นี้</span>
        </div>
      </div>
    </Link>
  )
}
