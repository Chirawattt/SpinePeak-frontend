import Image from 'next/image'
import Link from 'next/link'
import type { ClipCard, FeaturedCard as FeaturedCardData, Promo, ReviewQuote, Teacher } from '@/catalog'
import { Carousel } from '@/components/carousel'
import { ContactButton } from '@/components/contact-button'
import { CoverBox } from '@/components/cover-box'
import { SeasonalPromo } from '@/components/landing/seasonal-promo'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { contactHref } from '@/contact'

// ส่วนต่าง ๆ ของหน้าแรก ตาม docs/design-landing.dc.html
// แต่ละส่วนที่ซ่อนได้ (โปรโมชัน, คลิป, รีวิว) ให้ผู้เรียกไม่ render เมื่อว่าง

const SECTION_TITLE = 'font-heading text-[clamp(24px,3.8vw,32px)] font-bold'

/** แถบโปรโมชัน ต่อจาก hero · เลื่อนไปการ์ดถัดไปเองทุก 4 วินาที */
export function PromoSection({ promos }: { promos: Promo[] }) {
  return (
    <Reveal as="section" className="px-gutter pt-5 pb-2">
      <Carousel
        label="โปรโมชัน"
        autoplaySeconds={4}
        gap={18}
        className="snap-x snap-mandatory gap-[18px] pb-2"
        header={
          <div className="flex flex-1 flex-wrap items-baseline justify-between gap-3">
            <h2 id="promo" className={`${SECTION_TITLE} scroll-mt-[90px]`}>
              โปรโมชัน
            </h2>
            <Link href="/sets" className="text-[15px] font-semibold hover:text-link-hover">
              ดู SET ทั้งหมด →
            </Link>
          </div>
        }
      >
        {promos.map((promo) =>
          promo.kind === 'seasonal' ? (
            <SeasonalPromo key={promo.name} name={promo.name} headline={promo.headline} detail={promo.detail} endsAt={promo.endsAt} href={contactHref(promo.contactItem, 'line')} />
          ) : (
            <li key={promo.name} className="flex w-[min(72vw,300px)] shrink-0 snap-start">
              <EvergreenPromo promo={promo} />
            </li>
          ),
        )}
      </Carousel>
    </Reveal>
  )
}

function EvergreenPromo({ promo }: { promo: Extract<Promo, { kind: 'evergreen' }> }) {
  const body = (
    <>
      <span className="font-mono text-xs font-semibold text-eyebrow">ตลอดปี</span>
      <span className="font-heading text-[42px] leading-none font-bold">{promo.value}</span>
      <span className="font-heading text-lg font-bold">{promo.name}</span>
      <span className="text-[14.5px] leading-[1.6] text-ink-soft">{promo.desc}</span>
    </>
  )
  // การ์ดที่ลิงก์ในเว็บพื้นฟ้าอ่อน การ์ดทักแอดมินพื้นขาวมีขอบ ตาม design
  const card = 'flex w-full flex-col gap-2.5 rounded-[22px] p-[26px] transition-colors'
  if (promo.href) {
    return (
      <Link href={promo.href} className={`${card} bg-brand-wash hover:bg-brand-soft/60`}>
        {body}
      </Link>
    )
  }
  return (
    <a
      href={promo.contactItem && contactHref(promo.contactItem, 'line')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${promo.name} · ทักแอดมินเพื่อใช้โปรนี้`}
      className={`${card} border border-line bg-set-wash hover:border-brand`}
    >
      {body}
    </a>
  )
}

/** "คอร์สขายดี": ของแนะนำที่เจ้าของเลือกใน site.json ผสมคอร์สกับ SET · ว่างให้ผู้เรียกไม่ render */
export function FeaturedSection({ items }: { items: FeaturedCardData[] }) {
  return (
    <section aria-labelledby="featured-title" className="px-gutter pt-[52px] pb-16">
      <Reveal className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 id="featured-title" className={SECTION_TITLE}>
          คอร์สขายดี
        </h2>
        <Link href="/courses" className="text-[15px] font-semibold hover:text-link-hover">
          ดูคอร์สทั้งหมด →
        </Link>
      </Reveal>
      <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-[22px]">
        {items.map((item) => (
          <StaggerItem key={`${item.kind}:${item.card.slug}`} as="li" lift className="flex">
            <FeaturedCard item={item} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

/**
 * ใช้ข้อมูลการ์ดเดิมของคอร์ส / SET · ชื่อกดเข้าหน้ารายละเอียด ส่วนปุ่มสมัครเป็นปุ่มติดต่อ (จึงไม่ห่อทั้งใบด้วยลิงก์)
 * การ์ด SET ใช้โทนเข้ม (ขอบเข้ม ปกเข้ม ปุ่มเข้ม) ให้แยกออกจากคอร์สเดี่ยวได้ทันที
 */
function FeaturedCard({ item }: { item: FeaturedCardData }) {
  const { card } = item
  const isSet = item.kind === 'set'
  return (
    <article
      className={`relative flex w-full flex-col overflow-hidden rounded-[18px] transition-shadow hover:shadow-card ${isSet ? 'border-[1.5px] border-ink bg-set-wash' : 'border border-line bg-white'}`}
    >
      <div className="relative">
        {isSet && !card.cover.image ? (
          <div className="flex h-[150px] items-center justify-center bg-ink px-5 text-center font-heading text-[26px] leading-tight font-bold text-brand">{card.title}</div>
        ) : (
          <CoverBox cover={card.cover} label={isSet ? item.card.codeLabel : item.card.label} title={card.title} className="aspect-auto! h-[150px] rounded-none!" />
        )}
        {item.label && <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white ring-1 ring-brand/40">{item.label}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 px-[22px] pt-5 pb-[22px]">
        <div className="font-mono text-xs font-semibold text-eyebrow">{isSet ? item.eyebrow : item.card.label}</div>
        <h3 className="font-heading text-[21px] leading-[1.3] font-semibold">
          <Link href={card.href} className="after:absolute after:inset-0 hover:text-link-hover">
            {card.title}
          </Link>
        </h3>
        <p className="flex-1 text-[14.5px] leading-[1.6] text-muted">{card.tagline}</p>
        {card.facts && <p className="text-[13.5px] text-muted">{card.facts}</p>}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-heading text-[26px] font-bold">{card.price}</span>
          {isSet && item.card.savings && (
            <span className="text-[15px] text-strike line-through">
              <span className="sr-only">ราคาปกติ </span>
              {item.card.savings.regularPrice}
            </span>
          )}
        </div>
        <ContactButton item={item.contactItem} variant={isSet ? 'dark' : 'brand'} className="relative z-10 mt-1 p-[13px] text-base">
          สมัครเรียนเลย
        </ContactButton>
      </div>
    </article>
  )
}

/** แนะนำครู · id="teacher" เป็นปลายทางของเมนู */
export function TeacherSection({ teacher, photoAlt }: { teacher: Teacher; photoAlt: string }) {
  return (
    <section
      id="teacher"
      className="relative scroll-mt-[90px] overflow-hidden bg-tint bg-[radial-gradient(circle_at_18%_20%,var(--color-glow)_0,transparent_42%),radial-gradient(circle_at_92%_82%,var(--color-glow-soft)_0,transparent_46%)] px-gutter py-14"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] bg-size-[24px_24px] opacity-30" />
      <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-center gap-10">
        <Reveal from={{ opacity: 0, y: 28 }} className="relative flex min-w-0 items-end justify-center">
          <div aria-hidden className="absolute bottom-0 h-[92%] w-[min(310px,86%)] rounded-[28px] bg-brand" />
          <div aria-hidden className="absolute bottom-3.5 h-[96%] w-[min(342px,95%)] rounded-[32px] border-[1.5px] border-brand-soft" />
          <Image src="/kru-nam-full.png" alt={photoAlt} width={1080} height={1080} sizes="(max-width: 400px) 100vw, 360px" className="relative block h-auto w-[min(360px,100%)]" />
        </Reveal>
        <Stagger className="relative min-w-0">
          <StaggerItem as="p" className="mb-3 font-mono text-xs font-semibold text-link-hover">
            แนะนำครู
          </StaggerItem>
          <StaggerItem>
            <h2 className="mb-4 font-heading text-[clamp(27px,4.4vw,36px)] font-bold">{teacher.name}</h2>
          </StaggerItem>
          <StaggerItem as="p" className="mb-6 max-w-[520px] text-[17px] leading-[1.8] text-ink-soft">
            {teacher.bio}
          </StaggerItem>
          <StaggerItem as="ul" className="flex flex-wrap gap-2.5">
            {teacher.tags.map((tag) => (
              <li key={tag} className="rounded-full border border-outline bg-white px-4 py-[9px] text-sm">
                {tag}
              </li>
            ))}
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  )
}

/** ตัวอย่างคลิปสอน · id="clips" เป็นปลายทางของปุ่มใน hero */
export function ClipsSection({ clips }: { clips: ClipCard[] }) {
  return (
    <section id="clips" aria-labelledby="clips-title" className="scroll-mt-[90px] px-gutter py-14">
      <Reveal>
        <h2 id="clips-title" className={`${SECTION_TITLE} mb-6`}>
          ตัวอย่างคลิปสอน
        </h2>
      </Reveal>
      <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
        {clips.map((clip) => (
          <StaggerItem key={clip.href} as="li" lift>
            <a href={clip.href} target="_blank" rel="noopener noreferrer" className="group block">
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-[14px] bg-brand-wash">
                {clip.thumbnail && <Image src={clip.thumbnail} alt="" fill sizes="(max-width: 1024px) 100vw, 340px" className="object-cover" />}
                <span aria-hidden className="relative flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white transition-colors group-hover:bg-link-hover">
                  ▶
                </span>
              </div>
              <div className="mt-2.5 text-base font-semibold group-hover:text-link-hover">{clip.title}</div>
              <div className="text-sm text-muted">{clip.meta}</div>
            </a>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

/** รีวิวจากนักเรียน · id="reviews" เป็นปลายทางของเมนู · ปุ่ม ‹ › เลื่อนทีละใบ */
export function ReviewsSection({ reviews }: { reviews: ReviewQuote[] }) {
  // ต่อจากคลิปไม่ต้องเว้นบนซ้ำ คลิปเว้นล่างไว้แล้ว
  return (
    <Reveal as="section" className="px-gutter pt-14 pb-14 [#clips+&]:pt-0">
      <Carousel
        label="รีวิวจากนักเรียน"
        gap={20}
        className="snap-x snap-proximity gap-5 pb-1"
        header={
          <h2 id="reviews" className={`${SECTION_TITLE} scroll-mt-[90px]`}>
            รีวิวจากนักเรียน
          </h2>
        }
      >
        {reviews.map((review, i) => (
          <li key={i} className="flex w-[min(340px,80vw)] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative flex h-[150px] items-center justify-center bg-brand-wash">
              {review.cover ? (
                <Image src={review.cover} alt="" fill sizes="340px" className="object-cover" />
              ) : (
                // ยังไม่มีรูปปกรีวิว: กล่องสีที่มีชื่อผู้รีวิว
                <span aria-hidden className="font-heading text-xl font-semibold text-eyebrow">
                  {review.name}
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="mb-4 text-base leading-[1.75]">“{review.quote}”</p>
              <p className="mt-auto text-sm text-muted">{review.by}</p>
            </div>
          </li>
        ))}
      </Carousel>
    </Reveal>
  )
}

export function ClosingBand() {
  return (
    <section className="bg-brand px-gutter py-14">
      <Stagger className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
        <StaggerItem>
          <h2 className="mb-2.5 font-heading text-[clamp(26px,4.4vw,36px)] font-bold text-band-ink">เริ่มเรียนวันนี้ ดูได้ไม่จำกัดอายุ</h2>
          <p className="text-[17px]">ไม่มีวันหมดอายุ ทบทวนก่อนสอบกี่รอบก็ได้</p>
        </StaggerItem>
        <StaggerItem>
          <ContactButton className="px-10 py-[18px] text-lg whitespace-nowrap">สมัครเรียนเลย</ContactButton>
        </StaggerItem>
      </Stagger>
    </section>
  )
}

/** ปุ่มติดต่อลอย เฉพาะจอมือถือ · ไม่มีบนจอใหญ่ · footer เว้นที่ท้ายหน้าไว้ให้ไม่ถูกบัง */
export function FloatingContact() {
  return (
    // เลื่อนขึ้นจากขอบล่างหลังโหลดหน้าครู่หนึ่ง ไม่แย่งจังหวะกับ hero
    <Reveal trigger="mount" delay={0.8} from={{ opacity: 0, y: 80 }} className="fixed right-4 bottom-4 z-20 md:hidden">
      <ContactButton variant="brand" className="px-6 py-3 text-[15px] shadow-card">
        ทักแอดมิน
      </ContactButton>
    </Reveal>
  )
}
