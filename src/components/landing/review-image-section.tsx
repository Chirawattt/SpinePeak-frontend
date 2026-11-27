import { Carousel } from '@/components/carousel'
import { Reveal } from '@/components/motion/reveal'
import type { ReviewImageCard } from '@/catalog'
import { ReviewCard } from './review-image-card'

// รีวิวแบบรูปเต็มใบ 16:9 (รูปรีวิวจากนักเรียน) + แถบเข้มทับด้านล่างบอกว่าเป็นรีวิวคอร์สหรือ SET ไหน พร้อมปุ่มไปดูรายละเอียด
// ข้อมูลมาจากแท็บ "รีวิว" ในชีต (content/review-images.json)

export function ReviewImageSection({ cards }: { cards: ReviewImageCard[] }) {
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
        {cards.map((card) => (
          <li key={card.slug} className="w-[min(440px,86vw)] shrink-0 snap-start">
            <ReviewCard card={card} />
          </li>
        ))}
      </Carousel>
    </Reveal>
  )
}
