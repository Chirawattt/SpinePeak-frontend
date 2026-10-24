import Image from 'next/image'
import type { Landing } from '@/catalog'
import { ContactButton } from '@/components/contact-button'
import { ContactNote } from '@/components/contact-note'
import { PressAnchor } from '@/components/motion/press'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'
import { badgeVariants } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

// ตัดรูปครูเป็นวงกลม โดยให้หัวโผล่พ้นวงขึ้นไป (ลอกจาก docs/design-landing.dc.html)
const PHOTO_MASK = [
  'radial-gradient(ellipse 41% 41% at 50% 55.95%, #000 99%, transparent 100%)',
  'radial-gradient(ellipse 25.7% 41.7% at 50% 41.7%, #000 94%, transparent 100%)',
].join(', ')

/**
 * entry = ทางเข้าตามชั้น (GroupEntry) วางเป็นแถวเต็มความกว้างในกริดเดียวกับ hero
 * มือถือ: ข้อความ → entry → รูปครู (ให้ทางเข้าขึ้นมาก่อนรูป) · จอใหญ่: ข้อความคู่รูป แล้ว entry ใต้ทั้งสองคอลัมน์
 */
export function Hero({ hero, entry }: { hero: Landing['hero']; entry?: React.ReactNode }) {
  return (
    <section className="relative grid items-center gap-8 overflow-hidden bg-white bg-[radial-gradient(circle_at_6%_12%,var(--color-glow)_0,transparent_34%),radial-gradient(circle_at_96%_88%,var(--color-glow-soft)_0,transparent_40%),radial-gradient(circle_at_78%_6%,var(--color-glow-faint)_0,transparent_30%)] px-gutter pt-16 pb-14 md:grid-cols-2">
      <Decorations />

      {/* ขึ้นไล่กัน: badge → หัวข้อทีละบรรทัด → subtitle → ปุ่ม → ตัวเลข */}
      <Stagger trigger="mount" className="relative order-1 min-w-0">
        <StaggerItem order={0} className={badgeVariants({ variant: 'wash', className: 'mb-[22px] inline-flex items-center gap-2 tracking-[.02em]' })}>
          {hero.badge}
        </StaggerItem>
        <h1 className="mb-[18px] font-heading text-[clamp(33px,6.4vw,58px)] leading-[1.12] font-bold tracking-[-.01em] text-pretty">
          {hero.titleLines.map((line, i) => (
            <StaggerItem key={i} order={1 + i} as="span" className="block">
              {line}
            </StaggerItem>
          ))}
        </h1>
        <StaggerItem order={hero.titleLines.length + 1} as="p" className="max-w-[460px] text-lg leading-[1.7] text-ink-soft">
          {hero.subtitle}
        </StaggerItem>

        <StaggerItem order={hero.titleLines.length + 2} className="mt-8">
          <div className="flex flex-wrap gap-3.5">
            <ContactButton size="lg" className="px-[34px]" />
            {hero.showClipsLink && (
              <PressAnchor href="#clips" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                ดูตัวอย่างคลิปสอน
              </PressAnchor>
            )}
          </div>
          <ContactNote className="mt-3 text-muted" />
        </StaggerItem>

        <StaggerItem order={hero.titleLines.length + 3} as="dl" className="mt-[38px] flex flex-wrap gap-x-[34px] gap-y-[22px]">
          {hero.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="font-heading text-[clamp(25px,3.4vw,30px)] font-bold">{stat.value}</dd>
            </div>
          ))}
        </StaggerItem>
      </Stagger>

      <div className="relative order-3 flex min-w-0 items-center justify-center md:order-2">
        <div className="relative aspect-[420/445] w-[min(420px,100%,72vw)]">
          {/* วงเหลือง scale เข้ามาก่อน แล้วรูปเลื่อนขึ้นตาม · รูปไม่ fade จากโปร่งใส เพราะเป็น LCP ของหน้า */}
          <Reveal trigger="mount" delay={0.1} from={{ opacity: 0, scale: 0.85 }} className="absolute top-[14.2%] left-[9%] aspect-square w-[82%] rounded-full bg-brand" />
          <Reveal trigger="mount" delay={0.3} from={{ opacity: 0, scale: 0.92 }} className="absolute top-[10.1%] left-[4.8%] aspect-square w-[90.5%] rounded-full border-[1.5px] border-brand-soft" />
          <Reveal trigger="mount" delay={0.2} from={{ y: 28 }} className="absolute inset-0">
            <Image
              src="/kru-nam-hero.png"
              alt={hero.photoAlt}
              width={1080}
              height={1080}
              preload
              sizes="(max-width: 584px) 72vw, 420px"
              className="absolute top-0 left-0 block h-auto w-full"
              style={{ maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK }}
            />
          </Reveal>
        </div>
      </div>

      {/* อยู่ท้าย DOM ให้ลำดับ Tab ตามหลังปุ่มใน hero · ตำแหน่งที่เห็นจัดด้วย order */}
      {entry && <div className="relative order-2 min-w-0 md:order-3 md:col-span-2">{entry}</div>}
    </section>
  )
}

function Decorations() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] bg-size-[26px_26px] opacity-35" />
      <div className="absolute top-[180px] -left-[60px] h-60 w-60 rounded-full border-[1.5px] border-ring" />
      <div className="absolute top-[250px] -left-2.5 h-24 w-24 rounded-full bg-brand-soft opacity-45" />
      <div className="absolute top-9 right-[34%] h-[54px] w-[54px] rounded-full border-[1.5px] border-dashed border-ring-dashed" />
      <div className="absolute right-6 bottom-[26px] h-[150px] w-[150px] rounded-full border-[1.5px] border-ring-faint" />
      <div className="absolute inset-x-0 bottom-0 h-[220px] bg-[linear-gradient(rgba(255,255,255,0)_0%,rgba(255,255,255,.55)_45%,rgba(255,255,255,.92)_80%,#FFFFFF_100%)]" />
    </div>
  )
}
