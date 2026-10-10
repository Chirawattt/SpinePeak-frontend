'use client'

// การ์ดโปรตามฤดู · เว็บ build ไว้ล่วงหน้า จึงนับถอยหลังและเช็กวันหมดเขตที่ browser
// ก่อน hydrate ยังไม่รู้เวลาจริง ช่องนับถอยหลังจึงว่างไว้ก่อน (ไม่ให้ข้อความตอน build ค้าง)

import { useEffect, useState } from 'react'

const DAY = 86_400_000

function countdown(endsAt: string, now: number): string | null {
  const left = new Date(endsAt).getTime() - now
  if (left <= 0) return null
  const days = Math.floor(left / DAY)
  return days > 0 ? `เหลืออีก ${days} วัน` : 'วันสุดท้าย'
}

export function SeasonalPromo({ name, headline, detail, endsAt, href }: { name: string; headline: string[]; detail: string; endsAt: string; href: string }) {
  // undefined = ยังไม่ได้เช็กเวลา, null = หมดเขตแล้ว
  const [left, setLeft] = useState<string | null | undefined>(undefined)

  useEffect(() => {
    const update = () => setLeft(countdown(endsAt, Date.now()))
    update()
    const timer = setInterval(update, 60_000)
    return () => clearInterval(timer)
  }, [endsAt])

  if (left === null) return null

  return (
    <li className="flex w-[min(84vw,560px)] shrink-0 snap-start">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${name} · ทักแอดมินเพื่อใช้โปรนี้`}
        className="relative flex w-full flex-col gap-3 overflow-hidden rounded-[22px] bg-ink p-[26px] text-white"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot-dark)_1.4px,transparent_1.5px)] bg-size-[24px_24px] opacity-70" />
        <div className="relative flex flex-wrap justify-between gap-2.5">
          <span className="rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-bold text-ink">โปรตามฤดู</span>
          <span className="min-h-5 font-mono text-[13px] font-medium text-brand">{left}</span>
        </div>
        <div className="relative font-heading text-[clamp(23px,3.4vw,30px)] leading-[1.25] font-bold">
          {headline.map((line, i) => (
            <span key={i} className="block">
              {line}
            </span>
          ))}
        </div>
        <div className="relative text-[15px] text-on-dark-soft">{detail}</div>
      </a>
    </li>
  )
}
