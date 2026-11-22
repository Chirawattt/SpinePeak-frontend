import { Carousel } from '@/components/carousel'
import { Reveal } from '@/components/motion/reveal'
import { ReviewCard, type ReviewImageCardData } from './review-image-card'

// รีวิวแบบรูปเต็มใบ 16:9 (รูปรีวิวจากนักเรียน) + แถบเข้มทับด้านล่างบอกว่าเป็นรีวิวคอร์สหรือ SET ไหน พร้อมปุ่มไปดูรายละเอียด
// ⚠️ MOCK: ยังไม่ต่อกับ reviews.json · รูปและรายการด้านล่างเป็นตัวอย่างดูหน้าตาเท่านั้น หน้าแรกแสดงส่วนนี้เฉพาะตอน dev (ดู mocks.ts)

/** รูปรีวิวย่อยตัวอย่างใน Dialog */
const MOCK_IMAGES = Array.from({ length: 6 }, () => undefined)

const MOCK_CARDS: Omit<ReviewImageCardData, 'images'>[] = [
  { kind: 'set', title: 'ปรับพื้นฐาน ม.ปลาย เหมาทุกเทอม + ตะลุยโจทย์ A-Level ชีวะ', href: '/sets/foundation-biology-a-level-bundle' },
  { kind: 'course', title: 'เนื้อหาประถม ป.4', href: '/courses/primary-science-p4', cover: '/courses/primary-science-p4.png' },
  { kind: 'set', title: 'สอบเข้า ม.1 ห้องพิเศษ: เนื้อหา + ตะลุยโจทย์ ป.4-6 + สอบเข้า ม.1 จภ. (ปกชมพู)', href: '/sets/m1-entrance-special-complete-bundle' },
  { kind: 'course', title: 'ตะลุยโจทย์ A-Level ชีวะ 68', href: '/courses/a-level-biology-68', cover: '/courses/a-level-biology-68.png' },
  { kind: 'set', title: 'ตะลุยโจทย์ NETSAT 65-68', href: '/sets/netsat-biology-65-68-bundle' },
]

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
            <ReviewCard card={{ ...card, images: MOCK_IMAGES }} />
          </li>
        ))}
      </Carousel>
    </Reveal>
  )
}
