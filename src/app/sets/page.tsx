import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { catalog } from '@/catalog'
import { Stagger, StaggerItem } from '@/components/motion/reveal'
import { SetFilterBar, SetFilterBarFromUrl, SetGrid, SetGridFromUrl, SetTabs, SetTabsFromUrl } from '@/components/set-browser'

// design ไม่มีหน้านี้ ใช้โครงเดียวกับหน้ารายการคอร์ส
// build แบบ static ทั้งหน้า แล้วกรองฝั่ง client ตาม query string (?group=mplai&q=ชีวะ)
// fallback ของ Suspense คือรายการที่ยังไม่กรอง HTML ที่ build ไว้จึงมีการ์ดจริงตั้งแต่แรก

const TITLE = 'เซ็ตคอร์ส'
const INTRO = 'รวมคอร์สที่เรียนต่อเนื่องกันไว้ในเซ็ตเดียว ซื้อเป็นเซ็ตคุ้มกว่าซื้อแยก ทุก SET ซื้อครั้งเดียวดูได้ไม่จำกัดอายุ'

export const metadata: Metadata = { title: TITLE, description: INTRO }

export default function SetsPage() {
  const index = catalog.setListIndex()

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
          <Suspense fallback={<SetTabs index={index} filters={{}} />}>
            <SetTabsFromUrl index={index} />
          </Suspense>
          <Suspense fallback={<SetFilterBar index={index} filters={{}} />}>
            <SetFilterBarFromUrl index={index} />
          </Suspense>
          </StaggerItem>
        </Stagger>
      </section>

      <Suspense fallback={<SetGrid index={index} filters={{}} />}>
        <SetGridFromUrl index={index} />
      </Suspense>
    </>
  )
}
