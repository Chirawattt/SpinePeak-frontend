import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// ป้ายแคปซูลเล็ก ๆ ของทั้งเว็บ (ป้ายบน hero, หมวดบนการ์ด, ป้าย "-40%", ป้ายบนรูป ฯลฯ)
// น้ำหนักตัวอักษร ฟอนต์ สี และตำแหน่งที่ต่างกันรายจุดให้ใส่ผ่าน className (เช่น font-bold, font-mono)
// ส่วน display (inline-block / inline-flex) ก็ใส่เองรายจุด ป้ายที่เป็น <p> ของ StaggerItem ใช้ badgeVariants() เป็นคลาส
const badge = cva("rounded-full font-semibold", {
  variants: {
    variant: {
      brand: "bg-brand text-ink",
      wash: "bg-brand-wash text-ink",
      ink: "bg-ink text-brand",
      outline: "border border-outline bg-white text-ink",
      // ขอบอ่อนบนพื้นเข้ม (หัวหน้า SET)
      onDark: "border-[1.5px] border-[#3e6b76] text-on-dark-soft",
    },
    size: {
      sm: "px-3 py-[5px] text-[12.5px]",
      default: "px-4 py-[7px] text-[13px]",
    },
  },
  defaultVariants: { variant: "brand", size: "default" },
})

type BadgeStyle = VariantProps<typeof badge>

/** คลาสของป้าย · className ที่ส่งเข้ามาทับค่าของ variant/size ได้ */
function badgeVariants({ className, ...style }: BadgeStyle & { className?: string } = {}) {
  return cn(badge({ ...style, className }))
}

function Badge({ className, variant, size, ...props }: React.ComponentProps<"span"> & BadgeStyle) {
  return <span data-slot="badge" className={badgeVariants({ variant, size, className })} {...props} />
}

export { Badge, badgeVariants }
