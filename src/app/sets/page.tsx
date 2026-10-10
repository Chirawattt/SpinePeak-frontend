import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { catalog } from '@/catalog'
import { ContactBox } from '@/components/contact-box'
import { FaqList } from '@/components/faq-list'
import { StickyFilterBand } from '@/components/list-browser'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { SetFilterBar, SetFilterBarFromUrl, SetGrid, SetGridFromUrl, SetTabs, SetTabsFromUrl } from '@/components/set-browser'

// ตาม docs/design-sets.dc.html · hero พื้นเข้มให้ต่างจากหน้ารายการคอร์ส
// build แบบ static ทั้งหน้า แล้วกรองฝั่ง client ตาม query string (?group=mplai&category=สอวน.&q=ชีวะ)
// fallback ของ Suspense คือรายการที่ยังไม่กรอง HTML ที่ build ไว้จึงมีการ์ดจริงตั้งแต่แรก

const TITLE = 'SET คอร์ส'
const INTRO = 'รวมคอร์สที่เรียนต่อกันเป็นเส้นทางเดียว จ่ายครั้งเดียวได้ครบทุกคอร์สในชุด ดูได้ไม่จำกัดอายุ'

export const metadata: Metadata = { title: TITLE, description: INTRO }

export default function SetsPage() {
  const index = catalog.setListIndex()
  const page = catalog.setsPage()

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.4px,transparent_1.5px)] bg-size-[26px_26px] opacity-70" />
          <div className="absolute -top-[60px] -right-[60px] h-[260px] w-[260px] rounded-full border-[1.5px] border-[#1d4a55]" />
          <div className="absolute right-[28%] bottom-[34px] h-[54px] w-[54px] rounded-full border-[1.5px] border-dashed border-eyebrow" />
        </div>
        <nav aria-label="breadcrumb" className="relative px-gutter pt-5 text-sm text-[#9fc3cc]">
          <Link href="/" className="hover:text-white">
            หน้าแรก
          </Link>
          {' / '}
          <span className="text-white">{TITLE}</span>
        </nav>
        <Stagger trigger="mount" className="relative px-gutter pt-[22px] pb-11">
          <StaggerItem as="p" className="mb-4 inline-block rounded-full bg-brand px-4 py-[7px] text-[13px] font-semibold text-ink">
            ซื้อเป็น SET ถูกกว่าซื้อแยก
          </StaggerItem>
          <StaggerItem>
            <h1 className="mb-3 font-heading text-[clamp(29px,5.6vw,46px)] leading-[1.15] font-bold tracking-[-0.01em]">{TITLE}</h1>
          </StaggerItem>
          <StaggerItem as="p" className="mb-[26px] max-w-[580px] text-[17px] leading-[1.7] text-on-dark-soft">
            {INTRO}
          </StaggerItem>
          <StaggerItem>
            <Suspense fallback={<SetTabs index={index} filters={{}} />}>
              <SetTabsFromUrl index={index} />
            </Suspense>
          </StaggerItem>
        </Stagger>
      </section>

      <StickyFilterBand>
        <Suspense fallback={<SetFilterBar index={index} filters={{}} />}>
          <SetFilterBarFromUrl index={index} />
        </Suspense>
      </StickyFilterBand>

      <Suspense fallback={<SetGrid index={index} filters={{}} />}>
        <SetGridFromUrl index={index} />
      </Suspense>

      <Stagger as="section" className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-start gap-9 border-t border-line px-gutter py-[52px]">
        <StaggerItem>
          <h2 className="mb-3 font-heading text-[clamp(25px,3.8vw,30px)] font-bold">คำถามเกี่ยวกับ SET</h2>
          <FaqList faqs={page.faqs} />
        </StaggerItem>
        <StaggerItem>
          <ContactBox
            title="ไม่แน่ใจว่า SET ไหนเหมาะ"
            text="บอกชั้นปีและสนามสอบที่เล็งไว้ ครูพี่หนามจะแนะนำ SET ที่คุ้มที่สุดให้"
            instagramHref={page.instagramHref}
          />
        </StaggerItem>
      </Stagger>
    </>
  )
}
