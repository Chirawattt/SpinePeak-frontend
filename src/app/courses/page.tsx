import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { catalog, type GoalLink, type ReviewQuote } from '@/catalog'
import { ContactButton } from '@/components/contact-button'
import { CourseGrid, CourseFilterBar, CourseGridFromUrl, FilterBarFromUrl, GroupTabs, GroupTabsFromUrl } from '@/components/course-browser'
import { FaqList } from '@/components/faq-list'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

// build แบบ static ทั้งหน้า แล้วกรองฝั่ง client ตาม query string (?group=mplai)
// fallback ของ Suspense คือรายการที่ยังไม่กรอง HTML ที่ build ไว้จึงมีการ์ดจริงตั้งแต่แรก

const TITLE = 'คอร์สเรียนทั้งหมด'
const INTRO = 'เลือกระดับชั้นของน้องก่อน แล้วค่อยกรองตามหัวข้อที่สนใจ ทุกคอร์สซื้อครั้งเดียวดูได้ไม่จำกัดอายุ'

export const metadata: Metadata = { title: TITLE, description: INTRO }

export default function CoursesPage() {
  const index = catalog.courseListIndex()
  const page = catalog.coursesPage()

  const emptyAction = <ContactButton variant="brand" className="text-base">ทักแอดมินให้ช่วยเลือก</ContactButton>

  return (
    <>
      <section className="relative overflow-hidden border-b border-card-line bg-white bg-[radial-gradient(circle_at_6%_18%,var(--color-glow)_0,transparent_38%),radial-gradient(circle_at_94%_70%,var(--color-glow-soft)_0,transparent_42%)]">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] bg-size-[26px_26px] opacity-35" />
        <nav aria-label="breadcrumb" className="relative px-gutter pt-5 text-sm text-muted">
          <Link href="/" className="hover:text-ink">หน้าแรก</Link>
          {' / '}
          <span className="text-ink">{TITLE}</span>
        </nav>
        <Stagger trigger="mount" className="relative px-gutter pt-[22px] pb-10">
          <StaggerItem>
            <h1 className="mb-3 font-heading text-[clamp(29px,5.6vw,46px)] leading-[1.15] font-bold tracking-[-0.01em]">{TITLE}</h1>
          </StaggerItem>
          <StaggerItem as="p" className="mb-[26px] max-w-[560px] text-[17px] leading-[1.7] text-ink-soft">
            {INTRO}
          </StaggerItem>
          <StaggerItem>
          <Suspense fallback={<GroupTabs index={index} filters={{}} />}>
            <GroupTabsFromUrl index={index} />
          </Suspense>
          <Suspense fallback={<CourseFilterBar index={index} filters={{}} />}>
            <FilterBarFromUrl index={index} />
          </Suspense>
          </StaggerItem>
        </Stagger>
      </section>

      <Suspense fallback={<CourseGrid index={index} filters={{}} emptyAction={emptyAction} />}>
        <CourseGridFromUrl index={index} emptyAction={emptyAction} />
      </Suspense>

      <Goals goals={page.goals} />
      {page.reviews.length > 0 && <Reviews reviews={page.reviews} />}

      <Stagger as="section" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-9 px-gutter py-[52px]">
        <StaggerItem>
          <h2 id="faq" className="mb-3 scroll-mt-[90px] font-heading text-[30px] font-bold">คำถามที่พบบ่อย</h2>
          <FaqList faqs={page.faqs} />
        </StaggerItem>
        <StaggerItem className="rounded-[20px] border border-line bg-footer p-7">
          <h2 className="mb-2.5 font-heading text-[clamp(22px,3.2vw,26px)] font-bold">ยังเลือกไม่ถูก ทักมาได้เลย</h2>
          {page.hours && <p className="mb-5 text-[15.5px] leading-[1.75] text-ink-soft">ตอบกลับภายในวันทำการ {page.hours}</p>}
          <div className="mt-5 flex flex-col gap-2.5">
            <ContactButton variant="brand" className="text-base">ทักทาง LINE</ContactButton>
            <ContactButton channel="facebook" variant="outline" className="text-base" />
          </div>
        </StaggerItem>
      </Stagger>
    </>
  )
}

function Goals({ goals }: { goals: GoalLink[] }) {
  return (
    <section className="relative overflow-hidden border-t border-line bg-tint px-gutter py-[52px]">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] bg-size-[24px_24px] opacity-30" />
      <div className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-center gap-9">
        <Reveal>
          <p className="mb-3 font-mono text-xs font-semibold text-link-hover">ไม่แน่ใจว่าเรียนอะไรดี</p>
          <h2 className="mb-3.5 font-heading text-[clamp(25px,3.8vw,32px)] leading-[1.25] font-bold">
            บอกชั้นปีกับเป้าหมาย
            <br />
            เดี๋ยวครูจัดคอร์สให้
          </h2>
          <p className="mb-[22px] max-w-[380px] text-[16.5px] leading-[1.75] text-ink-soft">
            ทักมาบอกว่าอยู่ชั้นไหน คะแนนตอนนี้ประมาณเท่าไหร่ และอยากไปถึงไหน ครูพี่หนามจะแนะนำลำดับคอร์สที่ควรเรียนให้
          </p>
          <ContactButton className="w-fit px-[30px] py-[15px] text-base">ขอคำแนะนำจากครู</ContactButton>
        </Reveal>
        <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5">
          {goals.map((goal) => (
            <StaggerItem key={goal.title} as="li" lift className="flex">
              <Link href={goal.href} className="w-full rounded-2xl border border-line bg-white p-5 transition-colors hover:border-brand">
                <div className="mb-1.5 font-heading text-lg font-semibold">{goal.title}</div>
                <div className="text-[14.5px] leading-relaxed text-muted">{goal.desc}</div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}

function Reviews({ reviews }: { reviews: ReviewQuote[] }) {
  return (
    <section className="px-gutter pt-[52px]">
      <Reveal>
        <h2 className="mb-6 font-heading text-[clamp(24px,3.6vw,30px)] font-bold">รีวิวจากนักเรียน</h2>
      </Reveal>
      <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-5">
        {reviews.map((review, i) => (
          <StaggerItem key={i} as="li" className="rounded-2xl border border-line p-6">
            <p className="mb-4 text-base leading-[1.75]">“{review.quote}”</p>
            <p className="text-sm text-muted">{review.by}</p>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}
