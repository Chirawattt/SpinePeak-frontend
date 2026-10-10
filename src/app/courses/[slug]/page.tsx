import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalog, type CourseDetail, type CourseInstructor } from '@/catalog'
import { ClosingBand, DetailHeading, DetailTop, OUTLINE_BUTTON, Pill, PreviewClip, PriceCard, ReviewsCard, SectionTitle, TeacherAvatar } from '@/components/detail-page'
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
      <ClosingBand line={`${detail.price} ครั้งเดียว ${detail.lifetime}`} contactItem={detail.contactItem} />
    </>
  )
}

function Top({ detail }: { detail: CourseDetail }) {
  return (
    <DetailTop
      crumbs={[{ label: 'หน้าแรก', href: '/' }, detail.group]}
      current={detail.title}
      stats={detail.stats}
      after={detail.preview && <PreviewClip preview={detail.preview} title="คลิปตัวอย่างจากคอร์สนี้" />}
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

function Body({ detail }: { detail: CourseDetail }) {
  return (
    // คอลัมน์ขวายืดตามจอแบบ design (flex 520px / 290px แบ่งที่เหลือเท่ากัน): ขวา = ครึ่งหนึ่ง − 133px · 1180px → 457px
    <div className="grid gap-x-9 gap-y-10 px-gutter py-12 lg:grid-cols-[minmax(0,1fr)_calc(50%-133px)]">
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
          {detail.reviews.length > 0 && <ReviewsCard title="รีวิวจากผู้เรียนคอร์สนี้" reviews={detail.reviews} />}
        </Reveal>
      )}
    </div>
  )
}

function Instructor({ instructor }: { instructor: CourseInstructor }) {
  return (
    <aside className="rounded-[20px] border border-line p-6">
      <div className="mb-3.5 flex items-center gap-3.5">
        <TeacherAvatar name={instructor.name} {...(instructor.photo && { photo: instructor.photo })} />
        <div>
          <div className="font-heading text-xl font-semibold">{instructor.name}</div>
          <div className="text-sm text-muted">{instructor.role}</div>
        </div>
      </div>
      <p className="text-[15px] leading-[1.75] text-ink-soft">{instructor.bio}</p>
    </aside>
  )
}
