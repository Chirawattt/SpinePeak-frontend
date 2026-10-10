import Image from 'next/image'
import type { Landing } from '@/catalog'
import { ContactButton } from '@/components/contact-button'
import { PressAnchor } from '@/components/motion/press'
import { Reveal, Stagger, StaggerItem } from '@/components/motion/reveal'

// ตัดรูปครูเป็นวงกลม โดยให้หัวโผล่พ้นวงขึ้นไป (ลอกจาก docs/design-landing.dc.html)
const PHOTO_MASK = [
  'radial-gradient(ellipse 41% 41% at 50% 55.95%, #000 99%, transparent 100%)',
  'radial-gradient(ellipse 25.7% 41.7% at 50% 41.7%, #000 94%, transparent 100%)',
].join(', ')

export function Hero({ hero }: { hero: Landing['hero'] }) {
  return (
    <section className="relative grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] items-center gap-8 overflow-hidden bg-white bg-[radial-gradient(circle_at_6%_12%,var(--color-glow)_0,transparent_34%),radial-gradient(circle_at_96%_88%,var(--color-glow-soft)_0,transparent_40%),radial-gradient(circle_at_78%_6%,var(--color-glow-faint)_0,transparent_30%)] px-gutter pt-16 pb-[104px]">
      <Decorations />

      {/* ขึ้นไล่กัน: badge → หัวข้อทีละบรรทัด → subtitle → ปุ่ม → ตัวเลข */}
      <Stagger trigger="mount" className="relative min-w-0">
        <StaggerItem className="mb-[22px] inline-flex items-center gap-2 rounded-full bg-brand-wash px-3.5 py-[7px] text-[13px] font-semibold tracking-[.02em]">
          {hero.badge}
        </StaggerItem>
        <h1 className="mb-[18px] font-heading text-[clamp(33px,6.4vw,58px)] leading-[1.12] font-bold tracking-[-.01em] text-pretty">
          {hero.titleLines.map((line, i) => (
            <StaggerItem key={i} as="span" className="block">
              {line}
            </StaggerItem>
          ))}
        </h1>
        <StaggerItem as="p" className="max-w-[460px] text-lg leading-[1.7] text-ink-soft">
          {hero.subtitle}
        </StaggerItem>

        <StaggerItem className="mt-8 flex flex-wrap gap-3.5">
          <ContactButton className="px-[34px] py-4 text-[17px]">สมัครเรียนเลย</ContactButton>
          {hero.showClipsLink && (
            <PressAnchor href="#clips" className="rounded-full border-[1.5px] border-outline px-[26px] py-4 text-[17px] font-semibold transition-colors hover:border-brand hover:bg-brand-wash">
              ดูตัวอย่างคลิปสอน
            </PressAnchor>
          )}
        </StaggerItem>

        <StaggerItem as="dl" className="mt-[38px] flex flex-wrap gap-x-[34px] gap-y-[22px]">
          {hero.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse">
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="font-heading text-[clamp(25px,3.4vw,30px)] font-bold">{stat.value}</dd>
            </div>
          ))}
        </StaggerItem>
      </Stagger>

      <div className="relative flex min-w-0 items-center justify-center">
        <div className="relative aspect-[420/445] w-[min(420px,100%)]">
          {/* วงเหลือง scale เข้ามาก่อน แล้วรูปเลื่อนขึ้นตาม · รูปไม่ fade จากโปร่งใส เพราะเป็น LCP ของหน้า */}
          <Reveal trigger="mount" delay={0.1} from={{ opacity: 0, scale: 0.85 }} className="absolute top-[14.2%] left-[9%] aspect-square w-[82%] rounded-full bg-brand" />
          <Reveal trigger="mount" delay={0.3} from={{ opacity: 0, scale: 0.92 }} className="absolute top-[10.1%] left-[4.8%] aspect-square w-[90.5%] rounded-full border-[1.5px] border-brand-soft" />
          <Reveal trigger="mount" delay={0.2} from={{ y: 28 }} className="absolute inset-0">
            <Image
              src="/kru-nam-hero.png"
              alt={hero.photoAlt}
              width={1080}
              height={1080}
              priority
              sizes="(max-width: 460px) 100vw, 420px"
              className="absolute top-0 left-0 block h-auto w-full"
              style={{ maskImage: PHOTO_MASK, WebkitMaskImage: PHOTO_MASK }}
            />
          </Reveal>
        </div>
      </div>
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
