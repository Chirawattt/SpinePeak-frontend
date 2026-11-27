'use client'

// โปรโมชันแบบสไลด์เต็มใบ · ปัดนิ้วได้เองด้วย scroll-snap ปุ่ม ‹ › และจุดอยู่ในการ์ด
// เว็บ build ไว้ล่วงหน้า จึงนับถอยหลังและตัดโปรตามฤดูที่หมดเขตที่ browser
// ก่อน hydrate ยังไม่รู้เวลาจริง ช่องนับถอยหลังจึงว่างไว้ก่อน (ไม่ให้ข้อความตอน build ค้าง)

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useReducedMotion } from 'motion/react'
import { getImageProps } from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { Promo } from '@/catalog'
import { Reveal } from '@/components/motion/reveal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export type PromoSlide = Promo & { link: string }

const DAY = 86_400_000
const AUTOPLAY_MS = 6000
const ARROW = 'absolute top-1/2 -translate-y-1/2 border border-ring bg-white'

/** undefined = ยังไม่รู้เวลา, null = หมดเขตแล้ว */
function countdown(endsAt: string, now: number | undefined): string | null | undefined {
  if (now === undefined) return undefined
  const left = new Date(endsAt).getTime() - now
  if (left <= 0) return null
  const days = Math.floor(left / DAY)
  return days > 0 ? `เหลืออีก ${days} วัน` : 'วันสุดท้าย'
}

export function PromoCarousel({ promos }: { promos: PromoSlide[] }) {
  const scroller = useRef<HTMLUListElement>(null)
  const reduce = useReducedMotion()
  const [now, setNow] = useState<number>()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const update = () => setNow(Date.now())
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [])

  const slides = promos.filter((p) => p.kind !== 'seasonal' || countdown(p.endsAt, now) !== null)
  const count = slides.length
  // โปรหมดเขตระหว่างเปิดหน้าอยู่ จำนวนสไลด์ลดลงได้
  const current = Math.max(0, Math.min(index, count - 1))

  const go = (to: number) => {
    const el = scroller.current
    el?.scrollTo({ left: ((to + count) % count) * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' })
  }

  // ไม่มี deps: ทุก render (สไลด์เปลี่ยนจากปุ่ม จุด หรือปัดเอง) เริ่มจับเวลาใหม่
  useEffect(() => {
    if (paused || reduce || count < 2) return
    const timer = setTimeout(() => go(current + 1), AUTOPLAY_MS)
    return () => clearTimeout(timer)
  })

  if (count === 0) return null

  return (
    <Reveal as="section" className="px-gutter pt-5 pb-2">
      {/* ไม่มีลิงก์ "ดู SET ทั้งหมด" ที่นี่: หัวข้อคอร์สขายดีถัดไปมีอยู่แล้ว */}
      <h2 id="promo" className="mb-5 scroll-mt-[90px] font-heading text-[clamp(24px,3.8vw,32px)] font-bold">
        โปรโมชัน
      </h2>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <ul
          ref={scroller}
          aria-label="โปรโมชัน"
          onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex aspect-[4/5] min-h-[260px] w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-[22px] [scrollbar-width:none] sm:aspect-[3/1]"
        >
          {slides.map((promo) => (
            <li key={promo.name} className="flex w-full shrink-0 snap-start snap-always">
              <Slide promo={promo} now={now} />
            </li>
          ))}
        </ul>
        {count > 1 && (
          <>
            <Button variant="outline" size="icon" aria-label="โปรก่อนหน้า" onClick={() => go(current - 1)} className={`${ARROW} left-2.5 sm:left-4`}>
              <ChevronLeftIcon aria-hidden className="size-[18px]" strokeWidth={2.2} />
            </Button>
            <Button variant="outline" size="icon" aria-label="โปรถัดไป" onClick={() => go(current + 1)} className={`${ARROW} right-2.5 sm:right-4`}>
              <ChevronRightIcon aria-hidden className="size-[18px]" strokeWidth={2.2} />
            </Button>
            {/* พื้นขาวรองจุด ให้เห็นได้ทั้งบนสไลด์เข้ม สว่าง และรูป */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 rounded-full bg-white/90 px-1">
              {slides.map((promo, i) => (
                <button
                  key={promo.name}
                  type="button"
                  aria-label={`ไปโปรที่ ${i + 1}: ${promo.name}`}
                  aria-current={i === current}
                  onClick={() => go(i)}
                  className="group flex size-6 cursor-pointer items-center justify-center"
                >
                  <span className="size-2 rounded-full bg-ink/25 transition-colors group-aria-[current=true]:bg-ink" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Reveal>
  )
}

function Slide({ promo, now }: { promo: PromoSlide; now: number | undefined }) {
  const internal = promo.kind === 'evergreen' && Boolean(promo.href)
  const tone = promo.image
    ? 'bg-ink'
    : promo.kind === 'seasonal'
      ? 'bg-ink text-white'
      : internal
        ? 'bg-brand-wash'
        : 'border border-line bg-set-wash'
  // เว้นข้างให้พ้นปุ่มลูกศร และเว้นล่างให้พ้นจุด
  const padding = promo.image ? '' : 'px-[58px] pt-6 pb-12 sm:px-24'
  const className = `relative flex w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-[22px] text-center focus-visible:-outline-offset-4 ${tone} ${padding}`
  const body = promo.image ? <Banner name={promo.name} image={promo.image} imageMobile={promo.imageMobile} /> : <TextArt promo={promo} now={now} />

  return internal ? (
    <Link href={promo.link} className={className}>
      {body}
    </Link>
  ) : (
    <a href={promo.link} target="_blank" rel="noopener noreferrer" aria-label={`${promo.name} · ทักแอดมินเพื่อใช้โปรนี้`} className={className}>
      {body}
    </a>
  )
}

/** รูปของเจ้าของ · แสดงทั้งรูปเสมอ (object-contain) ไม่ตัดตัวหนังสือบนโปสเตอร์ */
function Banner({ name, image, imageMobile }: { name: string; image: string; imageMobile?: string }) {
  const shared = { alt: name, sizes: '(min-width: 1180px) 1180px, 100vw' }
  const { props } = getImageProps({ ...shared, src: image, width: 2400, height: 800 })
  const mobile = imageMobile ? getImageProps({ ...shared, src: imageMobile, width: 1080, height: 1350 }).props : undefined
  return (
    <picture>
      {mobile && <source media="(max-width: 639px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />}
      {/* alt มากับ props จาก getImageProps */}
      <img {...props} alt={name} className="absolute inset-0 size-full object-contain" />
    </picture>
  )
}

function TextArt({ promo, now }: { promo: PromoSlide; now: number | undefined }) {
  if (promo.kind === 'seasonal') {
    return (
      <>
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.4px,transparent_1.5px)] bg-size-[24px_24px] opacity-70" />
        <span className="relative flex flex-wrap items-center justify-center gap-2.5">
          <Badge className="font-bold">โปรตามฤดู</Badge>
          <span className="min-h-5 font-mono text-[13px] font-medium text-brand">{countdown(promo.endsAt, now)}</span>
        </span>
        <span className="relative font-heading text-[clamp(22px,4.2vw,46px)] leading-[1.25] font-bold text-balance">
          {promo.headline.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </span>
        <span className="relative text-[15px] text-on-dark-soft">{promo.detail}</span>
      </>
    )
  }
  return (
    <span className="flex flex-col items-center gap-3 sm:flex-row sm:gap-10 sm:text-left">
      <span className="font-heading text-[clamp(64px,10vw,112px)] leading-none font-bold">{promo.value}</span>
      <span className="flex flex-col items-center gap-1.5 sm:items-start">
        <Badge className="font-bold">ตลอดปี</Badge>
        <span className="font-heading text-[clamp(20px,2.8vw,30px)] leading-[1.3] font-bold text-balance">{promo.name}</span>
        <span className="text-[15px] leading-[1.6] text-ink-soft sm:text-base">{promo.desc}</span>
      </span>
    </span>
  )
}
