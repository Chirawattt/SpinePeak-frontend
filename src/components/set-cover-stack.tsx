import Image from 'next/image'
import type { CoverTile } from '@/catalog/set-list'

// มุมเอียงของปกในกอง ใบหน้าสุดก่อน ตาม docs/design-sets.dc.html
const TILT = ['-rotate-3', 'rotate-[1.5deg]', 'rotate-[4deg]']

const SIZES = {
  /** การ์ดหน้ารายการ SET */
  md: { tile: 'w-[clamp(96px,28%,128px)]', more: 'h-[52px] w-[52px] text-sm', imageSizes: '128px' },
  /** หัวการ์ด SET ในคอร์สขายดี ซึ่งสูงแค่ 150px */
  sm: { tile: 'w-[clamp(92px,30%,120px)]', more: 'h-11 w-11 text-[13px]', imageSizes: '120px' },
}

/** กองปกคอร์สใน SET ซ้อนเอียงกัน · ใบที่เกินแสดงเป็น "+N" · วางบนพื้นสีเข้ม */
export function SetCoverStack({ stack, more, size = 'md', className = '' }: { stack: CoverTile[]; more: number; size?: keyof typeof SIZES; className?: string }) {
  const s = SIZES[size]
  return (
    <div aria-hidden className={`relative isolate flex items-center ${className}`}>
      {stack.map((tile, i) => (
        <div
          key={tile.title}
          style={{ zIndex: 4 - i }}
          className={`relative flex aspect-[4/3] ${s.tile} flex-none items-end overflow-hidden rounded-xl border-[3px] border-ink bg-[repeating-linear-gradient(135deg,var(--color-brand-wash),var(--color-brand-wash)_9px,#d4f2fb_9px,#d4f2fb_18px)] p-2 text-[11px] leading-[1.3] font-semibold ${i > 0 ? '-ml-[18px]' : ''} ${TILT[i]}`}
        >
          {tile.image ? <Image src={tile.image} alt="" fill sizes={s.imageSizes} className="object-cover" /> : tile.title}
        </div>
      ))}
      {more > 0 && (
        <div className={`relative z-[5] -ml-3.5 flex ${s.more} flex-none items-center justify-center rounded-full border-[3px] border-ink bg-brand font-mono font-bold`}>+{more}</div>
      )}
    </div>
  )
}
