import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { catalog, type SetDetail } from '@/catalog'
import { CourseCard } from '@/components/course-card'
import { ClosingBand, DetailHeading, DetailTop, PriceCard, Pill, SectionTitle } from '@/components/detail-page'
import { FaqList } from '@/components/faq-list'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

// design ไม่มีหน้านี้ ใช้ layout ของหน้ารายละเอียดคอร์สเป็นแม่แบบ
// build ทุกเซ็ตล่วงหน้า slug ที่ไม่มีอยู่ขึ้น 404 · URL ใช้ slug ไม่ใช่รหัสเซ็ต (ADR 0002)
export const dynamicParams = false

export function generateStaticParams() {
  return catalog.setSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/sets/[slug]'>): Promise<Metadata> {
  const detail = catalog.setDetail((await params).slug)
  return detail ? { title: detail.title, description: detail.tagline } : {}
}

export default async function SetDetailPage({ params }: PageProps<'/sets/[slug]'>) {
  const detail = catalog.setDetail((await params).slug)
  if (!detail) notFound()

  return (
    <>
      <Top detail={detail} />
      <Body detail={detail} />
      <ClosingBand price={detail.price} lifetime={detail.lifetime} contactItem={detail.contactItem} />
    </>
  )
}

function Top({ detail }: { detail: SetDetail }) {
  return (
    <DetailTop
      crumbs={[
        { label: 'หน้าแรก', href: '/' },
        { label: 'เซ็ตคอร์ส', href: '/sets' },
      ]}
      current={detail.title}
      stats={[{ value: detail.courseCount, label: 'ในเซ็ตนี้' }, ...detail.stats]}
      statsCaption="รวมทุกคอร์สในเซ็ต"
      details={
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">{detail.subjectsHeading}:</span>
          {detail.subjects.map((subject) => (
            <span key={subject} className="rounded-full border border-outline bg-white px-3 py-1 font-semibold">
              {subject}
            </span>
          ))}
        </div>
      }
      aside={
        <PriceCard
          cover={detail.cover}
          coverLabel={detail.codeLabel}
          title={detail.title}
          price={detail.price}
          savings={detail.savings}
          lifetime={detail.lifetime}
          contactItem={detail.contactItem}
        />
      }
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill>{detail.group.label}</Pill>
        <Pill variant="code">{detail.codeLabel}</Pill>
      </div>
      <DetailHeading title={detail.title} tagline={detail.tagline} />
    </DetailTop>
  )
}

function Body({ detail }: { detail: SetDetail }) {
  return (
    <div className="flex flex-col gap-12 px-gutter py-12">
      <Reveal as="section">
        <SectionTitle className="mb-1.5">คอร์สในเซ็ตนี้</SectionTitle>
        <p className="mb-6 text-[15px] text-muted">
          {detail.courseCount} · กดที่การ์ดเพื่อดูรายละเอียดของแต่ละคอร์ส
        </p>
        <Stagger as="ul" className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-[22px]">
          {detail.courses.map((card) => (
            <StaggerItem key={card.slug} as="li" lift className="flex">
              <CourseCard card={card} />
            </StaggerItem>
          ))}
        </Stagger>
      </Reveal>

      <Reveal as="section" className="max-w-[760px]">
        <SectionTitle>คำถามที่พบบ่อย</SectionTitle>
        <FaqList faqs={detail.faqs} />
      </Reveal>
    </div>
  )
}
