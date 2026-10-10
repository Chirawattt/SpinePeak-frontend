// โครงของหน้ารายละเอียด ใช้ร่วมกันระหว่างหน้าคอร์ส (หัวพื้นขาว) กับหน้า SET (หัวพื้นเข้ม)

import Image from 'next/image'
import Link from 'next/link'
import type { Cover, CoursePreview, NavLink, ReviewQuote, Stat } from '@/catalog'
import type { ContactItem } from '@/contact'
import { ContactButton } from '@/components/contact-button'
import { CoverBox } from '@/components/cover-box'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

export type Tone = 'light' | 'dark'

const TOP_TONE: Record<Tone, { section: string; dots: string; crumb: string; crumbHover: string; current: string; statLabel: string; statValue: string }> = {
  light: {
    section:
      'border-b border-card-line bg-white bg-[radial-gradient(circle_at_96%_70%,var(--color-glow-soft)_0,transparent_40%),radial-gradient(circle_at_78%_6%,var(--color-glow-faint)_0,transparent_30%)]',
    dots: 'bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] opacity-35',
    crumb: 'text-muted',
    crumbHover: 'hover:text-ink',
    current: 'text-ink',
    statLabel: 'text-muted',
    statValue: '',
  },
  dark: {
    section: 'bg-ink text-white',
    dots: 'bg-[radial-gradient(var(--color-dot-dark)_1.4px,transparent_1.5px)] opacity-70',
    crumb: 'text-[#9fc3cc]',
    crumbHover: 'hover:text-white',
    current: 'text-white',
    statLabel: 'text-[#9fc3cc]',
    statValue: 'text-white',
  },
}

/**
 * ส่วนหัว: breadcrumb, ชื่อ (children), การ์ดราคา (aside) แถวตัวเลข และของต่อท้าย (after เช่น คลิปตัวอย่าง)
 * มือถือ: การ์ดราคาอยู่ต่อจากชื่อทันที เห็นราคาและปุ่มติดต่อโดยไม่ต้องเลื่อน · จอใหญ่: คอลัมน์ขวา
 * columns: ความกว้างคอลัมน์ขวาบนจอใหญ่ ยืดตามจอแบบ design (คอลัมน์ flex สองฝั่งแบ่งที่เหลือเท่ากัน)
 */
export function DetailTop({
  tone = 'light',
  columns = 'lg:grid-cols-[minmax(0,1fr)_calc(50%-112px)]',
  crumbs,
  current,
  aside,
  stats,
  after,
  children,
}: {
  tone?: Tone
  columns?: string
  crumbs: NavLink[]
  current: string
  aside: React.ReactNode
  stats: Stat[]
  after?: React.ReactNode
  children: React.ReactNode
}) {
  const t = TOP_TONE[tone]
  return (
    <section className={`relative overflow-hidden ${t.section}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-size-[26px_26px] ${t.dots}`} />
        {tone === 'dark' && <div className="absolute -top-[70px] -right-[70px] h-[280px] w-[280px] rounded-full border-[1.5px] border-[#1d4a55]" />}
      </div>

      <nav aria-label="breadcrumb" className={`relative px-gutter py-5 text-sm ${t.crumb}`}>
        {crumbs.map((crumb) => (
          <span key={crumb.href}>
            <Link href={crumb.href} className={t.crumbHover}>
              {crumb.label}
            </Link>
            {' / '}
          </span>
        ))}
        <span className={t.current}>{current}</span>
      </nav>

      <div className={`relative grid gap-x-9 gap-y-7 px-gutter pt-1 pb-14 lg:grid-rows-[auto_1fr] lg:pb-16 ${columns}`}>
        <Reveal trigger="mount" className="min-w-0 lg:col-start-1 lg:row-start-1">
          {children}
        </Reveal>

        {aside}

        <Reveal trigger="mount" delay={0.2} className="flex flex-col gap-8 lg:col-start-1 lg:row-start-2">
          {stats.length > 0 && (
            <dl className="flex flex-wrap content-start gap-x-7 gap-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse">
                  <dt className={`text-sm ${t.statLabel}`}>{stat.label}</dt>
                  <dd className={`font-heading text-2xl font-bold ${t.statValue}`}>{stat.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {after}
        </Reveal>
      </div>
    </section>
  )
}

/** ป้ายเม็ดยาในส่วนหัว · onDark = ขอบอ่อนบนพื้นเข้ม */
export function Pill({ variant = 'brand', children }: { variant?: 'brand' | 'onDark'; children: React.ReactNode }) {
  const style = {
    brand: 'bg-brand px-4 py-[7px] text-ink',
    onDark: 'border-[1.5px] border-[#3e6b76] px-[15px] py-1.5 text-on-dark-soft',
  }[variant]
  return <span className={`rounded-full text-[13px] font-semibold ${style}`}>{children}</span>
}

export function DetailHeading({ title, tagline, tone = 'light' }: { title: string; tagline: string; tone?: Tone }) {
  return (
    <>
      <h1 className="mb-3.5 font-heading text-[clamp(28px,5.2vw,44px)] leading-[1.2] font-bold text-pretty">{title}</h1>
      <p className={`max-w-[600px] text-lg leading-[1.75] ${tone === 'dark' ? 'text-on-dark-soft' : 'text-ink-soft'}`}>{tagline}</p>
    </>
  )
}

/** คลิปตัวอย่างใต้แถวตัวเลข · id="preview" เป็นปลายทางของปุ่ม "ดูคลิปตัวอย่างฟรี" */
export function PreviewClip({ preview, title, tone = 'light' }: { preview: CoursePreview; title: string; tone?: Tone }) {
  return (
    <div id="preview" className="max-w-[600px] scroll-mt-[calc(var(--header-h)+16px)]">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-[19px] font-semibold">{title}</h2>
        {preview.channelUrl && (
          <a
            href={preview.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[14.5px] font-semibold ${tone === 'dark' ? 'text-brand hover:text-white' : 'hover:text-link-hover'}`}
          >
            ดูช่อง YouTube →
          </a>
        )}
      </div>
      <div className={`relative aspect-video overflow-hidden rounded-2xl border bg-brand-wash shadow-card ${tone === 'dark' ? 'border-dot-dark' : 'border-card-line'}`}>
        <iframe
          src={preview.embedUrl}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {tone === 'light' && <p className="mt-2.5 text-sm text-muted">ดูฟรีไม่ต้องสมัคร</p>}
    </div>
  )
}

/** ปุ่มรองในการ์ดราคา (ขอบบาง) */
export const OUTLINE_BUTTON =
  'block rounded-full border-[1.5px] border-outline py-3.5 text-center font-semibold transition-colors hover:border-brand hover:bg-brand-wash'

const COURSE_BULLETS = ['ดูย้อนหลังได้ไม่จำกัดอายุ', 'ไฟล์ PDF ดาวน์โหลดได้', 'เรียนได้ทั้งคอมและมือถือ']

/** การ์ดราคาของหน้าคอร์ส · ปกแสดงทุกขนาดจอ */
export function PriceCard({
  cover,
  coverLabel,
  title,
  price,
  lifetime,
  note,
  contactItem,
  secondary = <ContactButton item={contactItem} channel="facebook" variant="outline" />,
}: {
  cover: Cover
  coverLabel: string
  title: string
  price: string
  lifetime: string
  /** บรรทัดเล็กใต้ราคา เช่น "ไฟล์ PDF + คลิปวิดีโอ (ไม่จำกัดอายุ)" · ไม่มีค่าใช้ป้ายอายุคอร์สแทน */
  note?: string
  contactItem: ContactItem
  /** ปุ่มรองใต้ปุ่มสมัคร · ค่าเริ่มต้นทักทาง Messenger */
  secondary?: React.ReactNode
}) {
  return (
    <Reveal
      as="aside"
      trigger="mount"
      delay={0.12}
      className="min-w-0 self-start rounded-[20px] border border-card-line bg-white p-5 shadow-card lg:col-start-2 lg:row-span-2 lg:row-start-1"
    >
      <CoverBox cover={cover} label={coverLabel} title={title} className="mb-[18px]" />
      <div className="mb-[18px]">
        <div className="mb-1 font-heading text-[clamp(31px,4.4vw,38px)] font-bold">{price}</div>
        <div className="text-sm text-eyebrow">{note ?? lifetime}</div>
      </div>
      <ContactButton item={contactItem} className="mb-2.5 py-4 text-[17px]">
        สมัครเรียนเลย
      </ContactButton>
      {secondary}
      <Bullets items={COURSE_BULLETS} />
    </Reveal>
  )
}

export function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-[18px] flex flex-col gap-[9px] border-t border-divider-soft pt-[18px] text-[14.5px] leading-relaxed text-ink-soft">
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  )
}

export function SectionTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <h2 className={`mb-4 font-heading text-[clamp(23px,3.4vw,28px)] font-bold ${className}`}>{children}</h2>
}

/** การ์ดรีวิวในคอลัมน์ขวา */
export function ReviewsCard({ title, reviews }: { title: string; reviews: ReviewQuote[] }) {
  return (
    <aside className="rounded-[20px] border border-line p-6">
      <h2 className="mb-3.5 font-heading text-lg font-semibold">{title}</h2>
      <ul className="flex flex-col">
        {reviews.map((review, i) => (
          <li key={i} className="border-b border-divider-soft py-3.5 text-[15px] leading-[1.75] first:pt-0 last:border-b-0 last:pb-0">
            “{review.quote}”<div className="mt-2 text-[13.5px] text-muted">{review.by}</div>
          </li>
        ))}
      </ul>
    </aside>
  )
}

/** วงกลมรูปครู · ยังไม่มีรูปก็ใช้วงกลมลายทางแทนที่ไว้ตาม design */
export function TeacherAvatar({ name, photo, size = 64 }: { name: string; photo?: string; size?: 60 | 64 }) {
  const box = size === 60 ? 'h-[60px] w-[60px]' : 'h-16 w-16'
  if (!photo) {
    return (
      <div
        aria-hidden
        className={`flex flex-none items-center justify-center rounded-full bg-[repeating-linear-gradient(135deg,var(--color-brand-wash),var(--color-brand-wash)_8px,#d4f2fb_8px,#d4f2fb_16px)] font-mono text-[10px] text-eyebrow ${box}`}
      >
        รูปครู
      </div>
    )
  }
  return (
    <div className={`flex flex-none items-end justify-center overflow-hidden rounded-full bg-brand ${box}`}>
      <Image src={photo} alt={name} width={size + 14} height={size + 14} className="-mb-1.5 h-auto max-w-none" />
    </div>
  )
}

/** แถบท้ายหน้า ปุ่มติดต่ออีกครั้ง · ค่าเริ่มต้นเป็นข้อความของหน้าคอร์ส */
export function ClosingBand({
  title = 'พร้อมเริ่มเรียนแล้วใช่ไหม',
  line,
  button = 'สมัครเรียนเลย',
  contactItem,
}: {
  title?: string
  line: string
  button?: string
  contactItem: ContactItem
}) {
  return (
    <section className="bg-brand px-gutter py-11">
      <Stagger className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
        <StaggerItem>
          <h2 className="mb-2 font-heading text-[clamp(24px,4vw,30px)] font-bold text-band-ink">{title}</h2>
          <p className="text-base">{line}</p>
        </StaggerItem>
        <StaggerItem>
          <ContactButton item={contactItem} className="px-10 py-[17px] text-lg whitespace-nowrap">
            {button}
          </ContactButton>
        </StaggerItem>
      </Stagger>
    </section>
  )
}
