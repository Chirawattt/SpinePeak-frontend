import Image from 'next/image'
import Link from 'next/link'
import type { ClipCard, FeaturedCard as FeaturedCardData, GroupEntry, Landing, ReviewQuote, Teacher } from '@/catalog'
import { ContactButton } from '@/components/contact-button'
import { CoverBox } from '@/components/cover-box'
import { FaqList } from '@/components/faq-list'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

// ส่วนต่าง ๆ ของหน้าแรก ตาม design-landing.html · ส่วนที่ design ไม่มี (ทางเข้า 3 กลุ่ม, FAQ) ใช้โทนเดียวกัน
// แต่ละส่วนที่ซ่อนได้ (คลิป, รีวิว) ให้ผู้เรียกไม่ render เมื่อว่าง

const SECTION_TITLE = 'font-heading text-[clamp(24px,3.8vw,32px)] font-bold'

/** ทางเข้า 3 กลุ่ม · กดแล้วไปรายการคอร์สที่กรองกลุ่มนั้น */
export function GroupEntries({ groups }: { groups: GroupEntry[] }) {
  return (
    <section aria-labelledby="group-entries" className="px-gutter pt-2 pb-14">
      <Reveal>
        <h2 id="group-entries" className={`${SECTION_TITLE} mb-6`}>
          น้องอยู่ชั้นไหน
        </h2>
      </Reveal>
      <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-4">
        {groups.map((group) => (
          <StaggerItem key={group.href} as="li" lift className="flex">
            <Link
              href={group.href}
              className="flex w-full items-center justify-between gap-3 rounded-[18px] border border-line bg-white p-6 transition-colors hover:border-brand hover:bg-brand-wash"
            >
              <span>
                <span className="block font-heading text-2xl font-semibold">{group.label}</span>
                <span className="text-[14.5px] text-muted">{group.count}</span>
              </span>
              <span aria-hidden className="text-xl">
                →
              </span>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
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

/** รีวิวจากนักเรียน · id="reviews" เป็นปลายทางของเมนู · เลื่อนแนวนอนด้วย scroll-snap ไม่ต้องใช้ JS */
export function ReviewsSection({ reviews }: { reviews: ReviewQuote[] }) {
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="scroll-mt-[90px] px-gutter pb-14">
      <Reveal>
        <h2 id="reviews-title" className={`${SECTION_TITLE} mb-6`}>
          รีวิวจากนักเรียน
        </h2>
      </Reveal>
      {/* ไล่จากซ้าย: เข้ามาทางข้าง ตามทิศที่เลื่อนดู */}
      <Stagger as="ul" className="flex snap-x snap-proximity gap-5 overflow-x-auto pb-1 [scrollbar-width:none]">
        {reviews.map((review, i) => (
          <StaggerItem
            key={i}
            as="li"
            from={{ opacity: 0, x: 24 }}
            className="flex w-[min(340px,80vw)] shrink-0 snap-start flex-col rounded-2xl border border-line bg-white p-6"
          >
            <p className="mb-4 text-base leading-[1.75]">“{review.quote}”</p>
            <p className="mt-auto text-sm text-muted">{review.by}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

/** คำถามที่พบบ่อย · id="faq" เป็นปลายทางของลิงก์ใน footer */
export function FaqSection({ faqs }: { faqs: Landing['faqs'] }) {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-[90px] border-t border-line bg-tint px-gutter py-14">
      <Reveal>
        <h2 id="faq-title" className={`${SECTION_TITLE} mb-4`}>
          คำถามที่พบบ่อย
        </h2>
      </Reveal>
      <Reveal className="max-w-[820px]">
        <FaqList faqs={faqs} />
      </Reveal>
    </section>
  )
}

export function ClosingBand() {
  return (
    <section className="bg-brand px-gutter py-14">
      <Stagger className="flex flex-wrap items-center justify-between gap-x-8 gap-y-6">
        <StaggerItem>
          <h2 className="mb-2.5 font-heading text-[clamp(26px,4.4vw,36px)] font-bold text-band-ink">เริ่มเรียนวันนี้ ดูได้ตลอดชีพ</h2>
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

/** "คอร์สขายดี": ของแนะนำที่เจ้าของเลือกใน site.json ผสมคอร์สกับเซ็ต · ว่างให้ผู้เรียกไม่ render */
export function FeaturedSection({ items }: { items: FeaturedCardData[] }) {
  return (
    <section aria-labelledby="featured-title" className="px-gutter py-14">
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

/** ใช้ข้อมูลการ์ดเดิมของคอร์ส / เซ็ต · ชื่อกดเข้าหน้ารายละเอียด ส่วนปุ่มสมัครเป็นปุ่มติดต่อ (จึงไม่ห่อทั้งใบด้วยลิงก์) */
function FeaturedCard({ item }: { item: FeaturedCardData }) {
  const { card } = item
  const isCourse = item.kind === 'course'
  return (
    <article className="relative flex w-full flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-shadow hover:shadow-card">
      <div className="relative">
        <CoverBox cover={card.cover} label={isCourse ? item.card.label : item.card.codeLabel} title={card.title} className="rounded-none!" />
        {item.label && <span className="absolute top-3 left-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{item.label}</span>}
      </div>
      <div className="flex flex-1 flex-col gap-[9px] px-5 pt-[18px] pb-5">
        <div className="font-mono text-xs font-semibold text-link-hover">{isCourse ? item.card.label : `${item.card.codeLabel} · ${item.card.group}`}</div>
        <h3 className="font-heading text-xl leading-[1.3] font-semibold">
          <Link href={card.href} className="after:absolute after:inset-0 hover:text-link-hover">
            {card.title}
          </Link>
        </h3>
        <p className="flex-1 text-[14.5px] leading-relaxed text-muted">{isCourse ? item.card.tagline : `รวม ${item.card.courseCount}`}</p>
        {isCourse && item.card.facts && <p className="text-[13.5px] text-muted">{item.card.facts}</p>}
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <span className="font-heading text-[26px] font-bold">{card.price}</span>
          {!isCourse && item.card.savings && (
            <span className="text-[15px] text-strike line-through">
              <span className="sr-only">ราคาปกติ </span>
              {item.card.savings.regularPrice}
            </span>
          )}
        </div>
        {!isCourse && item.card.savings && (
          <div className="text-sm font-semibold text-link-hover">
            ประหยัด {item.card.savings.amount} ({item.card.savings.percent})
          </div>
        )}
        <ContactButton item={item.contactItem} variant="brand" className="relative z-10 mt-1 p-[13px] text-base">
          สมัครเรียนเลย
        </ContactButton>
      </div>
    </article>
  )
}
