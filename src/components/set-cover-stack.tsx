import Image from 'next/image'
import type { CSSProperties } from 'react'
import type { CoverTile } from '@/catalog/set-list'

// ปกคอร์สใน SET แบบพัด วางบนพื้นสีเข้ม ใช้ทั้งการ์ดคอร์สขายดีบนหน้าแรกและการ์ดหน้ารายการ SET · ปกที่ไม่มีรูปใช้ลายทางกับชื่อคอร์สแทน

const PLACEHOLDER = 'bg-[repeating-linear-gradient(135deg,var(--color-brand-wash),var(--color-brand-wash)_9px,#d4f2fb_9px,#d4f2fb_18px)]'

function Tile({ tile, imageSizes }: { tile: CoverTile; imageSizes: string }) {
  return tile.image ? <Image src={tile.image} alt="" fill sizes={imageSizes} className="object-cover" /> : tile.title
}

/**
 * ตำแหน่งของปกในพัด ตามจำนวนปก · ใบแรกคือปกหน้า
 * x / y = เลื่อนจากกึ่งกลาง (% ของความกว้างปกใบนั้น) · r = มุมเอียง · hx / hr = ตอน hover การ์ด พัดกางออกนิดหนึ่ง
 */
type FanSpot = { w: string; x: string; y: string; r: string; hx: string; hr: string }
const FRONT = '62%'
const BACK = '52%'
const FAN: Record<number, FanSpot[]> = {
  1: [{ w: FRONT, x: '0%', y: '0%', r: '-2deg', hx: '0%', hr: '-1deg' }],
  2: [
    { w: FRONT, x: '18%', y: '3%', r: '2deg', hx: '22%', hr: '3deg' },
    { w: BACK, x: '-24%', y: '-7%', r: '-6deg', hx: '-31%', hr: '-8deg' },
  ],
  3: [
    { w: FRONT, x: '0%', y: '5%', r: '-2deg', hx: '0%', hr: '-1deg' },
    { w: BACK, x: '-40%', y: '-8%', r: '-8deg', hx: '-47%', hr: '-10deg' },
    { w: BACK, x: '40%', y: '-8%', r: '7deg', hx: '47%', hr: '9deg' },
  ],
}

/**
 * พัดปกคอร์ส · ปกหน้าใหญ่ อ่านปกได้ชัดกว่ากองเรียงเมื่อการ์ดแคบ · สัดส่วน 16:9 ตามรูปปกจริง (1280×720) จึงไม่ถูกตัดขอบ
 * วางเต็มพื้นที่ของผู้เรียก (absolute inset-0) · ใช้ในกล่องที่กำหนดความสูงเอง · hover ใช้ group/card ของการ์ด
 */
export function SetCoverFan({ stack, more }: { stack: CoverTile[]; more: number }) {
  const spots = FAN[Math.min(stack.length, 3)] ?? []
  return (
    <div aria-hidden className="absolute inset-0 isolate">
      {stack.slice(0, 3).map((tile, i) => {
        const spot = spots[i]
        if (!spot) return null
        const vars = { '--x': spot.x, '--y': spot.y, '--r': spot.r, '--hx': spot.hx, '--hr': spot.hr, width: spot.w, zIndex: 4 - i } as CSSProperties
        return (
          <div
            key={tile.title}
            style={vars}
            className={`absolute top-1/2 left-1/2 flex aspect-video items-end overflow-hidden rounded-xl border-[3px] border-ink ${PLACEHOLDER} p-2.5 text-xs leading-[1.3] font-semibold shadow-[0_10px_24px_rgb(4_20_25/0.55)] transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] [transform:translate(-50%,-50%)_translate(var(--x),var(--y))_rotate(var(--r))] motion-safe:group-hover/card:[transform:translate(-50%,-50%)_translate(var(--hx),var(--y))_rotate(var(--hr))]`}
          >
            <Tile tile={tile} imageSizes="(max-width: 640px) 62vw, 290px" />
          </div>
        )
      })}
      {more > 0 && (
        <div className="absolute right-3.5 bottom-3 z-[5] flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink bg-brand font-mono text-[13px] font-bold">
          +{more}
        </div>
      )}
    </div>
  )
}
