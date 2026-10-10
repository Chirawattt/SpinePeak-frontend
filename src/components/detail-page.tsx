// โครงของหน้ารายละเอียด ใช้ร่วมกันระหว่างหน้าคอร์สกับหน้าเซ็ต

import Link from 'next/link'
import type { Cover, NavLink, SetSavings, Stat } from '@/catalog'
import type { ContactItem } from '@/contact'
import { ContactButton } from '@/components/contact-button'
import { CoverBox } from '@/components/cover-box'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

/** ส่วนหัว: breadcrumb, ชื่อ (children), การ์ดราคา (aside) และแถวตัวเลข */
export function DetailTop({
  crumbs,
  current,
  aside,
  details,
  stats,
  statsCaption,
  children,
}: {
  crumbs: NavLink[]
  current: string
  aside: React.ReactNode
  /** ต่อจากชื่อบนจอใหญ่ แต่อยู่ใต้การ์ดราคาบนมือถือ ปุ่มติดต่อจะได้ไม่ตกขอบจอ */
  details?: React.ReactNode
  stats: Stat[]
  /** หัวเล็ก ๆ เหนือแถวตัวเลข เช่น "รวมทุกคอร์สในเซ็ต" */
  statsCaption?: string
  children: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden border-b border-card-line bg-white bg-[radial-gradient(circle_at_96%_70%,var(--color-glow-soft)_0,transparent_40%),radial-gradient(circle_at_78%_6%,var(--color-glow-faint)_0,transparent_30%)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] bg-size-[26px_26px] opacity-35" />

      <nav aria-label="breadcrumb" className="relative px-gutter py-5 text-sm text-muted">
        {crumbs.map((crumb) => (
          <span key={crumb.href}>
            <Link href={crumb.href} className="hover:text-ink">{crumb.label}</Link>
            {' / '}
          </span>
        ))}
        <span className="text-ink">{current}</span>
      </nav>

      <div className="relative grid gap-x-9 gap-y-7 px-gutter pt-1 pb-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:grid-rows-[auto_1fr] lg:pb-16">
        <Reveal trigger="mount" className="min-w-0 lg:col-start-1 lg:row-start-1">
          {children}
        </Reveal>

        {aside}

        {(details || stats.length > 0) && (
          <Reveal trigger="mount" delay={0.2} className="flex flex-col gap-7 lg:col-start-1 lg:row-start-2">
            {details}
            {stats.length > 0 && (
              <div>
                {statsCaption && <p className="mb-2 font-mono text-xs font-semibold text-link-hover">{statsCaption}</p>}
                <dl className="flex flex-wrap content-start gap-x-7 gap-y-4">
                  {stats.map((stat) => (
                    <div key={stat.label} className="flex flex-col-reverse">
                      <dt className="text-sm text-muted">{stat.label}</dt>
                      <dd className="font-heading text-2xl font-bold">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </section>
  )
}

/** ป้ายเม็ดยาในส่วนหัว */
export function Pill({ variant = 'brand', children }: { variant?: 'brand' | 'outline' | 'code'; children: React.ReactNode }) {
  const style = {
    brand: 'bg-brand px-4 py-[7px]',
    outline: 'border-[1.5px] border-ink px-4 py-[5.5px]',
    code: 'border-[1.5px] border-ink px-4 py-[5.5px] font-mono',
  }[variant]
  return <span className={`rounded-full text-[13px] font-semibold ${style}`}>{children}</span>
}

export function DetailHeading({ title, tagline }: { title: string; tagline: string }) {
  return (
    <>
      <h1 className="mb-3.5 font-heading text-[clamp(28px,5.2vw,44px)] leading-[1.2] font-bold">{title}</h1>
      <p className="max-w-[600px] text-lg leading-[1.75] text-ink-soft">{tagline}</p>
    </>
  )
}

/** มือถือ: อยู่ถัดจากชื่อทันที เห็นราคาและปุ่มติดต่อโดยไม่ต้องเลื่อน · จอใหญ่: คอลัมน์ขวา */
export function PriceCard({
  cover,
  coverLabel,
  title,
  price,
  savings,
  lifetime,
  contactItem,
}: {
  cover: Cover
  coverLabel: string
  title: string
  price: string
  /** มีเฉพาะเซ็ตที่ประหยัดถึงเกณฑ์ ไม่มีก็แสดงราคาเดียว */
  savings?: SetSavings
  lifetime: string
  contactItem: ContactItem
}) {
  return (
    <Reveal
      as="aside"
      trigger="mount"
      delay={0.12}
      className="min-w-0 self-start rounded-[20px] border border-card-line bg-white p-5 shadow-card lg:col-start-2 lg:row-span-2 lg:row-start-1"
    >
      <CoverBox cover={cover} label={coverLabel} title={title} className="mb-[18px] hidden lg:block" />
      {savings ? (
        // เซ็ต: ราคา + ราคาปกติขีดฆ่า แล้วป้ายประหยัดกับป้ายอายุคอร์สอยู่แถวเดียวกัน ปุ่มติดต่อจะได้ไม่ตกขอบจอมือถือ
        <div className="mb-[18px] flex flex-col gap-1.5">
          <div className="flex flex-wrap items-baseline gap-x-3">
            <span className="font-heading text-[clamp(31px,4.4vw,38px)] font-bold">{price}</span>
            <span className="text-lg text-strike line-through">
              <span className="sr-only">ราคาปกติ </span>
              {savings.regularPrice}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-brand px-3 py-1 text-[13px] font-semibold">
              ประหยัด {savings.amount} ({savings.percent})
            </span>
            <span className="rounded-full bg-brand-wash px-3 py-1 text-[13px] font-semibold">{lifetime}</span>
          </div>
        </div>
      ) : (
        <div className="mb-[18px] flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-heading text-[clamp(31px,4.4vw,38px)] font-bold">{price}</span>
          <span className="rounded-full bg-brand-wash px-3 py-1 text-[13px] font-semibold">{lifetime}</span>
        </div>
      )}
      <ContactButton item={contactItem} className="mb-2.5 text-[17px]" />
      <ContactButton item={contactItem} channel="facebook" variant="outline" />
      <ul className="mt-[18px] flex flex-col gap-2.5 border-t border-divider-soft pt-[18px] text-[14.5px] leading-relaxed text-ink-soft">
        <li>ดูย้อนหลังได้ไม่จำกัด ไม่มีวันหมดอายุ</li>
        <li>ถ้าอัดเนื้อหาใหม่ คนที่ซื้อแล้วได้ของใหม่ด้วย ไม่ต้องจ่ายเพิ่ม</li>
      </ul>
    </Reveal>
  )
}

export function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`mb-4 font-heading text-[clamp(23px,3.4vw,28px)] font-bold ${className}`}>{children}</h2>
}

/** แถบท้ายหน้า ปุ่มติดต่ออีกครั้ง */
export function ClosingBand({ price, lifetime, contactItem }: { price: string; lifetime: string; contactItem: ContactItem }) {
  return (
    <section className="bg-brand px-gutter py-11">
      <Stagger className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
        <StaggerItem>
          <h2 className="mb-2 font-heading text-[clamp(24px,4vw,30px)] font-bold text-band-ink">พร้อมเริ่มเรียนแล้วใช่ไหม</h2>
          <p className="text-base">
            {price} ครั้งเดียว {lifetime}
          </p>
        </StaggerItem>
        <StaggerItem>
          <ContactButton item={contactItem} className="px-10 text-lg whitespace-nowrap" />
        </StaggerItem>
      </Stagger>
    </section>
  )
}
