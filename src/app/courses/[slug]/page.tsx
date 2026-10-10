import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { catalog, type CourseDetail, type CourseInstructor, type CoursePreview, type ReviewQuote } from '@/catalog'
import { ClosingBand, DetailHeading, DetailTop, PriceCard, Pill, SectionTitle } from '@/components/detail-page'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { SetOffers } from '@/components/set-offers'

// ตาม docs/design-course-detail.dc.html · build ทุกคอร์สล่วงหน้า slug ที่ไม่มีอยู่ขึ้น 404
export const dynamicParams = false

export function generateStaticParams() {
  return catalog.courseSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/courses/[slug]'>): Promise<Metadata> {
  const detail = catalog.courseDetail((await params).slug)
  return detail ? { title: detail.title, description: detail.tagline } : {}
}

export default async function CourseDetailPage({ params }: PageProps<'/courses/[slug]'>) {
  const detail = catalog.courseDetail((await params).slug)
  if (!detail) notFound()

  return (
    <>
      <Top detail={detail} />
      <Body detail={detail} />
      <ClosingBand price={detail.price} lifetime={detail.lifetime} contactItem={detail.contactItem} />
    </>
  )
}

const OUTLINE_BUTTON = 'block rounded-full border-[1.5px] border-outline py-3.5 text-center font-semibold transition-colors hover:border-brand hover:bg-brand-wash'

function Top({ detail }: { detail: CourseDetail }) {
  return (
    <DetailTop
      crumbs={[{ label: 'หน้าแรก', href: '/' }, detail.group]}
      current={detail.title}
      stats={detail.stats}
      after={detail.preview && <Preview preview={detail.preview} />}
      aside={
        <PriceCard
          cover={detail.cover}
          coverLabel={detail.badge}
          title={detail.title}
          price={detail.price}
          lifetime={detail.lifetime}
          note={detail.deliverables}
          contactItem={detail.contactItem}
          // มีคลิปตัวอย่างก็ชวนดูคลิปก่อน ไม่มีก็ให้ทักทาง Messenger เป็นทางเลือก
          {...(detail.preview && {
            secondary: (
              <a href="#preview" className={OUTLINE_BUTTON}>
                ดูคลิปตัวอย่างฟรี
              </a>
            ),
          })}
        />
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill>{detail.badge}</Pill>
      </div>
      <DetailHeading title={detail.title} tagline={detail.tagline} />
    </DetailTop>
  )
}

/** คลิปตัวอย่างใต้แถวตัวเลข · id="preview" เป็นปลายทางของปุ่ม "ดูคลิปตัวอย่างฟรี" */
function Preview({ preview }: { preview: CoursePreview }) {
  return (
    <div id="preview" className="max-w-[600px] scroll-mt-[calc(var(--header-h)+16px)]">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="font-heading text-[19px] font-semibold">คลิปตัวอย่างจากคอร์สนี้</h2>
        {preview.channelUrl && (
          <a href={preview.channelUrl} target="_blank" rel="noopener noreferrer" className="text-[14.5px] font-semibold hover:text-link-hover">
            ดูช่อง YouTube →
          </a>
        )}
      </div>
      <div className="relative aspect-video overflow-hidden rounded-2xl border border-card-line bg-brand-wash shadow-card">
        <iframe
          src={preview.embedUrl}
          title="คลิปตัวอย่างจากคอร์สนี้"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      <p className="mt-2.5 text-sm text-muted">ดูฟรีไม่ต้องสมัคร</p>
    </div>
  )
}

function Body({ detail }: { detail: CourseDetail }) {
  return (
    <div className="grid gap-x-9 gap-y-10 px-gutter py-12 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-10">
        {detail.content && (
          <Reveal as="section">
            <SectionTitle className="mb-1.5">เนื้อหาในคอร์ส</SectionTitle>
            {detail.content.meta && <p className="mb-5 text-[15px] text-muted">{detail.content.meta}</p>}
            <Stagger as="ol" className="overflow-hidden rounded-2xl border border-line">
              {detail.content.items.map((item, i) => (
                <StaggerItem key={i} as="li" className="flex items-baseline gap-3 border-b border-line px-[22px] py-4 last:border-b-0 odd:bg-row">
                  <span className="w-[26px] flex-none font-mono text-[13px] font-semibold text-eyebrow">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[17px] font-semibold">{item}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        )}

        {detail.forWho && (
          <Reveal as="section">
            <SectionTitle>คอร์สนี้เหมาะกับใคร</SectionTitle>
            <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-3.5">
              {detail.forWho.map((who, i) => (
                <StaggerItem key={i} as="li" className="rounded-[14px] bg-tint p-5 text-[15.5px] leading-[1.65]">
                  {who}
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        )}
      </div>

      {(detail.sets || detail.instructor || detail.reviews.length > 0) && (
        <Reveal className="flex min-w-0 flex-col gap-5 self-start">
          {detail.sets && <SetOffers sets={detail.sets} />}
          {detail.instructor && <Instructor instructor={detail.instructor} />}
          {detail.reviews.length > 0 && <Reviews reviews={detail.reviews} />}
        </Reveal>
      )}
    </div>
  )
}

function Instructor({ instructor }: { instructor: CourseInstructor }) {
  return (
    <aside className="rounded-[20px] border border-line p-6">
      <div className="mb-3.5 flex items-center gap-3.5">
        {instructor.photo ? (
          <div className="flex h-16 w-16 flex-none items-end justify-center overflow-hidden rounded-full bg-brand">
            <Image src={instructor.photo} alt={instructor.name} width={78} height={78} className="-mb-1.5 h-auto w-[78px] max-w-none" />
          </div>
        ) : (
          // ยังไม่มีรูปครู: วงกลมลายทางแทนที่ไว้ตาม design
          <div
            aria-hidden
            className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-[repeating-linear-gradient(135deg,var(--color-brand-wash),var(--color-brand-wash)_8px,#d4f2fb_8px,#d4f2fb_16px)] font-mono text-[10px] text-eyebrow"
          >
            รูปครู
          </div>
        )}
        <div>
          <div className="font-heading text-xl font-semibold">{instructor.name}</div>
          <div className="text-sm text-muted">{instructor.role}</div>
        </div>
      </div>
      <p className="text-[15px] leading-[1.75] text-ink-soft">{instructor.bio}</p>
    </aside>
  )
}

function Reviews({ reviews }: { reviews: ReviewQuote[] }) {
  return (
    <aside className="rounded-[20px] border border-line p-6">
      <h2 className="mb-3.5 font-heading text-lg font-semibold">รีวิวจากผู้เรียนคอร์สนี้</h2>
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
