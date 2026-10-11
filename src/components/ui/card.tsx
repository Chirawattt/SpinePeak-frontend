import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// กรอบการ์ดของเว็บ: เฉพาะ "ผิว" (มุมโค้ง เส้นขอบ พื้น เงา) · ไม่มี Header/Content/Footer เพราะเนื้อในแต่ละการ์ดไม่เหมือนกัน
// การ์ดที่เป็นลิงก์ทั้งใบ (<Link>) และกล่องที่ต้องคงแท็ก (<aside>, <li>) ใช้ cardVariants() เป็นคลาสบนแท็กนั้นตรง ๆ
// รูปทรงที่ต่างรายจุด (มุมโค้ง พื้น padding เงา) ใส่ผ่าน className
const card = cva("border", {
  variants: {
    variant: {
      // กล่องข้อมูลเส้นบาง (รีวิว กล่องติดต่อ ฯลฯ)
      panel: "rounded-[20px] border-line p-6",
      // การ์ดคอร์สในกริด: ตัดขอบ ยกเงาตอน hover
      tile: "overflow-hidden rounded-[18px] border-line bg-white transition-shadow hover:shadow-card",
      // การ์ด SET: เส้นหนาสีเข้ม
      featured: "rounded-[20px] border-[1.5px] border-ink",
    },
  },
  defaultVariants: { variant: "panel" },
})

type CardStyle = VariantProps<typeof card>

/** คลาสของการ์ด · className ที่ส่งเข้ามาทับค่าของ variant ได้ */
function cardVariants({ className, ...style }: CardStyle & { className?: string } = {}) {
  return cn(card({ ...style, className }))
}

function Card({ className, variant, ...props }: React.ComponentProps<"div"> & CardStyle) {
  return <div data-slot="card" className={cardVariants({ variant, className })} {...props} />
}

export { Card, cardVariants }
