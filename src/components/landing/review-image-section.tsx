import { ArrowRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Carousel } from '@/components/carousel'
import { Reveal } from '@/components/motion/reveal'

// รีวิวแบบรูปเต็มใบ 16:9 (รูปรีวิวจากนักเรียน) + แถบเข้มทับด้านล่างบอกว่าเป็นรีวิวคอร์สหรือ SET ไหน พร้อมปุ่มไปดูรายละเอียด
// ⚠️ MOCK: ยังไม่ต่อกับ reviews.json · รูปและรายการด้านล่างเป็นตัวอย่างดูหน้าตาเท่านั้น หน้าแรกแสดงส่วนนี้เฉพาะตอน dev (ดู mocks.ts)

type ReviewImageCard = {
  /** รูปรีวิว · ไม่มี = กล่องตัวอย่าง */
  image?: string
  kind: 'course' | 'set'
  title: string
  href: string
}

const MOCK_CARDS: ReviewImageCard[] = [
  { kind: 'set', title: 'ปรับพื้นฐาน ม.ปลาย เหมาทุกเทอม + ตะลุยโจทย์ A-Level ชีวะ', href: '/sets/foundation-biology-a-level-bundle' },
  { kind: 'course', title: 'เนื้อหาประถม ป.4', href: '/courses/primary-science-p4',  },
  { kind: 'set', title: 'สอบเข้า ม.1 ห้องพิเศษ: เนื้อหา + ตะลุยโจทย์ ป.4-6 + สอบเข้า ม.1 จภ. (ปกชมพู)', href: '/sets/m1-entrance-special-complete-bundle' },
  { kind: 'course', title: 'ตะลุยโจทย์ A-Level ชีวะ 68', href: '/courses/a-level-biology-68' },
  { kind: 'set', title: 'ตะลุยโจทย์ NETSAT 65-68', href: '/sets/netsat-biology-65-68-bundle' },
]

const KIND_LABEL = { course: 'รีวิวคอร์ส', set: 'รีวิว SET' } as const

export function ReviewImageSection() {
  // ต่อจากคลิปไม่ต้องเว้นบนซ้ำ คลิปเว้นล่างไว้แล้ว
  return (
    <Reveal as="section" className="px-gutter pt-14 pb-14 [#clips+&]:pt-0">
      <Carousel
        label="รีวิวจากนักเรียน"
        gap={20}
        className="snap-x snap-proximity gap-5 pb-1"
        header={
          <h2 id="reviews" className="scroll-mt-[90px] font-heading text-[clamp(24px,3.8vw,32px)] font-bold">
            รีวิวจากนักเรียน
          </h2>
        }
      >
        {MOCK_CARDS.map((card, i) => (
          <li key={i} className="w-[min(440px,86vw)] shrink-0 snap-start">
            <ReviewCard card={card} />
          </li>
        ))}
      </Carousel>
    </Reveal>
  )
}

function ReviewCard({ card }: { card: ReviewImageCard }) {
  return (
    <article className="group relative isolate aspect-video overflow-hidden rounded-[20px] bg-brand-wash">
      {card.image ? (
        <Image
          src={card.image}
          alt={`${KIND_LABEL[card.kind]} ${card.title}`}
          fill
          sizes="(max-width: 520px) 86vw, 440px"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)] motion-safe:group-hover:scale-[1.03]"
        />
      ) : (
        <MockImage />
      )}

      {/* แถบเข้มชิดขอบล่าง: ชื่อซ้าย ปุ่มขวา แถวเดียว รูป 16:9 เตี้ย แถบจึงต้องบางที่สุด · ชื่อยาวตัดเป็น … ที่ 2 บรรทัด (มือถือ 1 บรรทัด)
          บนมือถือปุ่มเหลือวงกลมลูกศร (ชื่อเต็มอยู่ใน aria-label) ชื่อจะได้มีที่ */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-ink/92 py-2.5 pr-3 pl-4 text-white">
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10.5px] leading-4 font-semibold text-brand">{KIND_LABEL[card.kind]}</div>
          <h3 title={card.title} className="line-clamp-1 font-heading text-[14.5px] sm:line-clamp-2 leading-[1.35] font-semibold text-pretty">{card.title}</h3>
        </div>
        <Link
          href={card.href}
          aria-label={`ดูรายละเอียด ${card.title}`}
          className="inline-flex size-10 flex-none items-center justify-center gap-1.5 rounded-full bg-brand text-[13.5px] font-semibold whitespace-nowrap text-ink transition-colors hover:bg-brand-soft sm:w-auto sm:pr-3 sm:pl-3.5"
        >
          <span className="hidden sm:inline">ดูรายละเอียด</span>
          <ArrowRightIcon aria-hidden className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  )
}

/** กล่องแทนรูปรีวิวตอน mock · ลายจุดแบบเดียวกับพื้นหลังของเว็บ + ป้ายบอกว่าเป็นตัวอย่าง */
function MockImage() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col items-center gap-1 bg-brand-wash pt-[11%]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(var(--color-dot)_1.4px,transparent_1.5px)] bg-size-[18px_18px] opacity-50" />
      <span className="relative font-heading text-lg font-semibold text-eyebrow">รูปรีวิว</span>
      <span className="relative font-mono text-xs text-eyebrow">16:9 · mock</span>
    </div>
  )
}
