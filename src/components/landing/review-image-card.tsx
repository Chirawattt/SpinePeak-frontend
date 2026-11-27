'use client'

// การ์ดรีวิวแบบรูปเต็มใบ 16:9 + แถบเข้มล่างบอกว่าเป็นรีวิวคอร์สหรือ SET ไหน · กดการ์ดแล้วเปิด Dialog รูปรีวิวย่อย 2 คอลัมน์
// ล่างสุดของ Dialog เป็นแบนเนอร์แนวนอนเต็มความกว้างของคอร์ส/SET นั้น · กดรูปย่อยแล้วขยายเต็มจอ

import { ArrowRightIcon, XIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import type { ReviewImageCard } from '@/catalog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'

const KIND_LABEL = { course: 'รีวิวคอร์ส', set: 'รีวิว SET' } as const

const CLOSE = 'absolute top-3 right-3 outline-none focus-visible:ring-3 focus-visible:ring-ink/60'

export function ReviewCard({ card }: { card: ReviewImageCard }) {
  const [open, setOpen] = useState(false)
  const [zoom, setZoom] = useState<number | null>(null)
  const label = KIND_LABEL[card.kind]

  return (
    <article className="group relative isolate aspect-video overflow-hidden rounded-[20px] bg-brand-wash">
      <Image
        src={card.image}
        alt={`${label} ${card.title}`}
        fill
        sizes="(max-width: 520px) 86vw, 440px"
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-[1.03]"
      />

      {/* ปุ่มเปิด Dialog คลุมทั้งการ์ด · ลิงก์ในแถบล่างอยู่เหนือปุ่ม (z-10) จึงกดไปหน้ารายละเอียดได้แยกกัน ไม่ซ้อนปุ่มในปุ่ม */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`ดูรูปรีวิว ${card.title}`}
        className="absolute inset-0 cursor-pointer outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ink/60"
      />

      {/* ไล่สีเข้มจากขอบล่างขึ้นไปแทนแถบทึบ ให้รูปรีวิวยังเด่นกว่า · ชื่อซ้าย ปุ่มขวา แถวเดียว · ชื่อยาวตัดเป็น … ที่ 2 บรรทัด (มือถือ 1 บรรทัด)
          วงกลมลูกศรขอบขาวโปร่ง ไม่ใช้สีแบรนด์เต็ม · จอกว้างชื่อจองที่ 2 บรรทัดเสมอ แถบจึงสูงเท่ากันทุกใบไม่ว่าชื่อยาวแค่ไหน */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-center gap-3 bg-linear-to-t from-ink/85 via-ink/50 to-transparent pt-5 pr-3 pb-3 pl-4 text-white">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10.5px] leading-4 font-semibold text-white/75">{label}</div>
          <h3 title={card.title} className="line-clamp-1 font-heading text-[14.5px] leading-[1.35] font-semibold text-pretty sm:line-clamp-2 sm:min-h-[2.7em]">
            {card.title}
          </h3>
        </div>
        {/* ลูกศรเป็นแค่ลวดลาย ไม่ใช่ลิงก์ · แถบนี้ pointer-events-none จึงกดทะลุไปโดนปุ่มคลุมทั้งการ์ดแล้วเปิด Dialog เหมือนกดที่อื่น */}
        <span
          aria-hidden
          className="inline-flex size-9 flex-none items-center justify-center rounded-full border border-white/45 bg-white/10 text-white transition-colors group-hover:bg-white/25"
        >
          <ArrowRightIcon className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
        </span>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[min(820px,calc(100dvh-1.5rem))] w-[min(760px,calc(100%-1.5rem))] flex-col overflow-hidden rounded-3xl">
          <DialogClose aria-label="ปิดหน้าต่าง" render={<Button variant="wash" size="icon" className={CLOSE} />}>
            <XIcon className="h-[18px] w-[18px]" aria-hidden />
          </DialogClose>

          <header className="flex-none px-5 pt-5 pr-16 pb-4 md:px-8 md:pt-7">
            <div className="font-mono text-xs font-semibold text-eyebrow">{label}</div>
            <DialogTitle className="mt-1 text-[22px] leading-snug font-semibold text-balance md:text-[26px]">{card.title}</DialogTitle>
          </header>

          {/* รูปรีวิวย่อย 2 คอลัมน์ (มือถือก็ 2 คอลัมน์ ตามที่ขอ) · กดแล้วขยาย */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-8">
            <ul className="grid grid-cols-2 gap-3">
              {card.images.map((src, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => setZoom(i)}
                    aria-label={`ขยายรูปรีวิวที่ ${i + 1}`}
                    className="relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-xl border border-card-line bg-brand-wash outline-none focus-visible:ring-3 focus-visible:ring-ink/60"
                  >
                    <Image src={src} alt={`รูปรีวิวที่ ${i + 1} ของ ${card.title}`} fill sizes="(max-width: 768px) 45vw, 340px" className="object-contain" />
                  </button>
                </li>
              ))}
            </ul>

            {/* ปกคอร์ส/SET อย่างเดียว ไม่มีข้อความทับ · ปกเป็นไฟล์ 1280×720 จึงใช้ 16:9 ให้พอดีรูป ไม่ crop · กดแล้วไปหน้านั้น */}
            <Link
              href={card.href}
              aria-label={`ดูรายละเอียด ${card.title}`}
              className="group/cover relative mt-3 block aspect-video overflow-hidden rounded-xl border border-card-line bg-brand-wash outline-none focus-visible:ring-3 focus-visible:ring-ink/60"
            >
              {card.cover ? (
                <Image src={card.cover} alt={card.title} fill sizes="(max-width: 768px) 90vw, 696px" className="object-cover transition-transform duration-700 motion-safe:group-hover/cover:scale-[1.02]" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center bg-ink font-heading text-lg font-semibold text-white">ดูรายละเอียด</span>
              )}
            </Link>
          </div>

          {/* ขยายรูป: Dialog ซ้อนใน Dialog · Esc ปิดแค่ชั้นนี้ */}
          <Dialog open={zoom !== null} onOpenChange={(o) => !o && setZoom(null)}>
            {/* คลุมทั้งจอ พื้นใส · รูปมีขนาดตามจริง (ไม่มีกรอบเกินรูป) จึงกดตรงไหนนอกรูปแล้วปิดได้ (target เป็นตัวกรอบเอง) */}
            <DialogContent
              onClick={(e) => e.target === e.currentTarget && setZoom(null)}
              className="top-0 left-0 flex h-dvh w-screen translate-x-0 translate-y-0 cursor-zoom-out items-center justify-center rounded-none bg-ink/40 p-4 shadow-none backdrop-blur-md"
            >
              <DialogTitle className="sr-only">{zoom !== null ? `รูปรีวิวที่ ${zoom + 1}` : 'รูปรีวิว'}</DialogTitle>
              {/* ห่อรูปด้วยกล่องที่ขนาดเท่ารูป เพื่อให้ปุ่ม X อยู่มุมขวาบนของรูปเอง */}
              {zoom !== null && (
                <div className="relative cursor-default">
                  <DialogClose aria-label="ปิดรูป" render={<Button variant="wash" size="icon" className={`${CLOSE} z-10`} />}>
                    <XIcon className="h-[18px] w-[18px]" aria-hidden />
                  </DialogClose>
                  <Image
                    src={card.images[zoom]}
                    alt={`รูปรีวิวที่ ${zoom + 1} ของ ${card.title}`}
                    width={0}
                    height={0}
                    sizes="92vw"
                    className="block h-auto max-h-[88dvh] w-auto max-w-[92vw] rounded-xl"
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>
    </article>
  )
}
