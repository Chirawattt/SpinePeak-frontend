import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { catalog, type CourseCard, type SetDetail, type SetTeacher } from '@/catalog'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cardVariants } from '@/components/ui/card'
import { ContactBar } from '@/components/contact-bar'
import { ContactButton } from '@/components/contact-button'
import { CoverBox } from '@/components/cover-box'
import { ClosingBand, DetailHeading, DetailTop, PreviewClip, PriceCard, ReviewsCard, SectionTitle, TeacherAvatar } from '@/components/detail-page'
import { SetCoverFan } from '@/components/set-cover-stack'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

// ตาม docs/design-set-detail.dc.html · hero พื้นเข้มเหมือนหน้ารายการ SET
// build ทุก SET ล่วงหน้า slug ที่ไม่มีอยู่ขึ้น 404 · URL ใช้ slug ไม่ใช่รหัส SET (ADR 0002)
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

  const regular = detail.savings ? ` จากปกติ ${detail.savings.regularPrice}` : ''
  return (
    <>
      <Top detail={detail} />
      <Courses detail={detail} />
      <Body detail={detail} />
      <ClosingBand
        title={`ได้ครบ ${detail.courseCount} ในราคาเดียว`}
        line={`${detail.price}${regular} · ${detail.lifetime}`}
        contactItem={detail.contactItem}
      />
      <ContactBar title={detail.title} price={detail.price}>
        <ContactButton item={detail.contactItem} className="flex-none px-5" />
      </ContactBar>
    </>
  )
}

function Top({ detail }: { detail: SetDetail }) {
  return (
    <DetailTop
      tone="dark"
      crumbs={[
        { label: 'หน้าแรก', href: '/' },
        { label: 'คอร์สเรียน', href: '/courses' },
      ]}
      current={detail.title}
      stats={detail.stats}
      after={detail.preview && <PreviewClip preview={detail.preview} title="คลิปตัวอย่างจาก SET นี้" tone="dark" />}
      aside={<SetPriceCard detail={detail} />}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Badge>SET · {detail.courseCount}</Badge>
        <Badge variant="onDark">{detail.categoriesLabel}</Badge>
      </div>
      <DetailHeading title={detail.title} tagline={detail.tagline} tone="dark" />
    </DetailTop>
  )
}

/**
 * การ์ดราคา SET ใบเดียวกับหน้าคอร์ส · ปกเป็นพัดปกคอร์สใน SET แบบการ์ด SET ในหน้ารายการ
 * ราคาเดี่ยวทีละคอร์สอยู่ในส่วน "คอร์สใน SET นี้" ใต้หัว ปุ่มรองพาไปที่นั่น
 */
function SetPriceCard({ detail }: { detail: SetDetail }) {
  return (
    <PriceCard
      cover={detail.cover}
      coverLabel={`SET · ${detail.courseCount}`}
      title={detail.title}
      price={detail.price}
      lifetime={detail.lifetime}
      contactItem={detail.contactItem}
      {...(detail.savings && { savings: detail.savings })}
      media={
        <div className="group/card relative isolate mb-[18px] aspect-video overflow-hidden rounded-[14px] bg-ink">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.3px,transparent_1.4px)] bg-size-[22px_22px] opacity-70" />
          <SetCoverFan stack={detail.stack} more={detail.moreInStack} />
        </div>
      }
      secondary={
        <a href="#courses" className={buttonVariants({ variant: 'outline' })}>
          ดูคอร์สใน SET
        </a>
      }
    />
  )
}

/** คอร์สใน SET เป็นแถวแนวนอน มีเลขลำดับ · id="courses" เป็นปลายทางของปุ่ม "ดูคอร์สใน SET" */
function Courses({ detail }: { detail: SetDetail }) {
  return (
    <section id="courses" className="scroll-mt-[calc(var(--header-h)+16px)] px-gutter pt-14 pb-5">
      <Reveal className="mb-[22px] flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-heading text-[clamp(24px,3.6vw,30px)] font-bold">คอร์สใน SET นี้</h2>
        <div className="font-mono text-[13px] font-semibold text-eyebrow">{detail.courseCount} · เรียงตามลำดับที่แนะนำ</div>
      </Reveal>
      <Stagger as="ol" className="flex flex-col gap-3.5">
        {detail.courses.map((course, i) => (
          <StaggerItem key={course.slug} as="li">
            <CourseRow course={course} index={i} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  )
}

function CourseRow({ course, index }: { course: CourseCard; index: number }) {
  return (
    <Link
      href={course.href}
      className="group flex flex-wrap items-center gap-x-5 gap-y-4 rounded-[18px] border border-line bg-white p-4 transition-colors hover:border-ink"
    >
      <span aria-hidden className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-ink font-mono text-sm font-semibold text-brand">
        {String(index + 1).padStart(2, '0')}
      </span>
      <CoverBox cover={course.cover} label={course.label} title={course.title} className="w-[clamp(120px,22%,180px)] flex-none rounded-xl! [&_div]:p-2.5 [&_div]:text-xs" />
      <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-[5px]">
        <div className="font-mono text-xs font-semibold text-eyebrow">{[course.subject, course.teacher].filter(Boolean).join(' · ')}</div>
        <h3 className="font-heading text-[19px] leading-[1.3] font-semibold">{course.title}</h3>
        <p className="text-[14.5px] leading-[1.6] text-muted">{course.tagline}</p>
        {course.facts && <p className="text-[13.5px] text-muted">{course.facts}</p>}
      </div>
      <div className="ml-auto flex flex-none flex-col items-end gap-1.5">
        <div className="text-[13px] text-strike">
          ราคาเดี่ยว <span className="line-through">{course.price}</span>
        </div>
        <div className="text-[14.5px] font-semibold group-hover:text-link-hover">ดูรายละเอียดคอร์ส →</div>
      </div>
    </Link>
  )
}

function Body({ detail }: { detail: SetDetail }) {
  return (
    // ซ้าย flex 520px ขวา 300px แบ่งที่เหลือเท่ากัน: ขวา = ครึ่งหนึ่ง − 128px · 1180px → 462px
    <div className="grid gap-x-9 gap-y-10 px-gutter pt-10 pb-14 lg:grid-cols-[minmax(0,1fr)_calc(50%-128px)]">
      <div className="flex min-w-0 flex-col gap-10">
        <Reveal as="section">
          <SectionTitle>สิ่งที่ได้รับ</SectionTitle>
          <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-3.5">
            {detail.gets.map((get) => (
              <StaggerItem key={get.label} as="li" className="rounded-2xl border border-line bg-tint p-5">
                <div className="mb-1 font-heading text-2xl font-bold">{get.value}</div>
                <div className="mb-1 text-[15px] font-semibold">{get.label}</div>
                <div className="text-sm leading-[1.6] text-muted">{get.note}</div>
              </StaggerItem>
            ))}
          </Stagger>
        </Reveal>

        {detail.forWho && (
          <Reveal as="section">
            <SectionTitle>SET นี้เหมาะกับใคร</SectionTitle>
            <Stagger as="ul" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-3.5">
              {detail.forWho.map((who) => (
                <StaggerItem key={who} as="li" className="rounded-[14px] bg-tint p-5 text-[15.5px] leading-[1.65]">
                  {who}
                </StaggerItem>
              ))}
            </Stagger>
          </Reveal>
        )}
      </div>

      {(detail.teachers.length > 0 || detail.reviews.length > 0) && (
        <Reveal className="flex min-w-0 flex-col gap-5 self-start">
          {detail.teachers.length > 0 && <Teachers heading={detail.teachersHeading} teachers={detail.teachers} />}
          {detail.reviews.length > 0 && <ReviewsCard title="รีวิวจากผู้เรียน SET" reviews={detail.reviews} />}
        </Reveal>
      )}
    </div>
  )
}

function Teachers({ heading, teachers }: { heading: string; teachers: SetTeacher[] }) {
  return (
    <aside className={cardVariants()}>
      <h2 className="mb-4 font-heading text-lg font-semibold">{heading}</h2>
      <ul className="flex flex-col gap-[18px]">
        {teachers.map((teacher) => (
          <li key={teacher.name}>
            <div className="flex items-center gap-3.5">
              <TeacherAvatar size={60} {...(teacher.photo && { photo: teacher.photo })} />
              <div>
                <div className="font-heading text-[19px] font-semibold">{teacher.name}</div>
                <div className="text-sm text-muted">{teacher.role}</div>
              </div>
            </div>
            {teacher.bio && <p className="mt-3 text-[15px] leading-[1.75] text-ink-soft">{teacher.bio}</p>}
          </li>
        ))}
      </ul>
    </aside>
  )
}
