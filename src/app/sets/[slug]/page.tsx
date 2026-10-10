import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { catalog, type CourseCard, type SetDetail, type SetTeacher } from '@/catalog'
import { ContactButton } from '@/components/contact-button'
import { CoverBox } from '@/components/cover-box'
import { Bullets, ClosingBand, DetailHeading, DetailTop, OUTLINE_BUTTON, Pill, PreviewClip, ReviewsCard, SectionTitle, TeacherAvatar } from '@/components/detail-page'
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
        button="สมัคร SET นี้"
        contactItem={detail.contactItem}
      />
    </>
  )
}

function Top({ detail }: { detail: SetDetail }) {
  return (
    <DetailTop
      tone="dark"
      // การ์ดราคา flex 320px + padding 48px ฝั่งซ้าย 520px แบ่งที่เหลือเท่ากัน: ขวา = ครึ่งหนึ่ง − 94px · 1180px → 496px
      columns="lg:grid-cols-[minmax(0,1fr)_calc(50%-94px)]"
      crumbs={[
        { label: 'หน้าแรก', href: '/' },
        { label: 'SET คอร์ส', href: '/sets' },
      ]}
      current={detail.title}
      stats={detail.stats}
      after={detail.preview && <PreviewClip preview={detail.preview} title="คลิปตัวอย่างจาก SET นี้" tone="dark" />}
      aside={<SetPriceCard detail={detail} />}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <Pill>SET · {detail.courseCount}</Pill>
        <Pill variant="onDark">{detail.topicsLabel}</Pill>
      </div>
      <DetailHeading title={detail.title} tagline={detail.tagline} tone="dark" />
    </DetailTop>
  )
}

const SET_BULLETS = ['ปลดล็อกทุกคอร์สพร้อมกันทันที', 'ดูย้อนหลังได้ไม่จำกัดอายุ', 'ไฟล์ PDF ดาวน์โหลดได้ · เรียนได้ทั้งคอมและมือถือ']

/** การ์ดราคา SET: ราคา + ส่วนลด + ตารางเทียบซื้อแยก · จอใหญ่ติดอยู่ใต้ header ตอนเลื่อน (บนมือถือไม่ติด จะได้ไม่ทับเนื้อหา) */
function SetPriceCard({ detail }: { detail: SetDetail }) {
  const { savings } = detail
  return (
    <Reveal
      as="aside"
      trigger="mount"
      delay={0.12}
      className="min-w-0 self-start rounded-[22px] bg-white p-6 text-ink shadow-[0_18px_40px_rgb(0_0_0/0.25)] lg:sticky lg:top-[calc(var(--header-h)+20px)] lg:col-start-2 lg:row-span-2 lg:row-start-1"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2.5">
        <div className="font-mono text-xs font-semibold text-eyebrow">ราคา SET</div>
        {savings && <span className="rounded-full bg-ink px-3 py-[5px] font-mono text-[12.5px] font-semibold text-brand">-{savings.percent}</span>}
      </div>
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2.5">
        <span className="font-heading text-[clamp(34px,4.6vw,42px)] font-bold">{detail.price}</span>
        {savings && (
          <span className="text-base text-strike line-through">
            <span className="sr-only">ราคาปกติ </span>
            {savings.regularPrice}
          </span>
        )}
      </div>
      <div className="mb-[18px] text-[14.5px] text-eyebrow">{savings ? `ประหยัด ${savings.amount} เทียบกับซื้อแยก` : detail.lifetime}</div>
      <ContactButton item={detail.contactItem} className="mb-2.5 py-4 text-[17px]">
        สมัคร SET นี้
      </ContactButton>
      <a href="#courses" className={OUTLINE_BUTTON}>
        ดูคอร์สใน SET
      </a>

      <div className="mt-5 rounded-[14px] bg-set-wash p-4">
        <div className="mb-2.5 text-sm font-semibold">ถ้าซื้อแยกทีละคอร์ส</div>
        <ul className="flex flex-col gap-[7px]">
          {detail.breakdown.map((course) => (
            <li key={course.title} className="flex justify-between gap-3 text-sm text-ink-soft">
              <span className="min-w-0">{course.title}</span>
              <span className="flex-none">{course.price}</span>
            </li>
          ))}
        </ul>
        {savings && (
          <div className="mt-2.5 flex justify-between gap-3 border-t border-dashed border-ring pt-2.5 text-[14.5px]">
            <span>รวมซื้อแยก</span>
            <span className="text-strike line-through">{savings.regularPrice}</span>
          </div>
        )}
        <div className="mt-1.5 flex justify-between gap-3 text-[15.5px] font-bold">
          <span>ราคา SET</span>
          <span>{detail.price}</span>
        </div>
      </div>
      <Bullets items={SET_BULLETS} />
    </Reveal>
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
    <aside className="rounded-[20px] border border-line p-6">
      <h2 className="mb-4 font-heading text-lg font-semibold">{heading}</h2>
      <ul className="flex flex-col gap-[18px]">
        {teachers.map((teacher) => (
          <li key={teacher.name}>
            <div className="flex items-center gap-3.5">
              <TeacherAvatar name={teacher.name} size={60} {...(teacher.photo && { photo: teacher.photo })} />
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
