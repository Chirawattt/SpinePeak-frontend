import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

// ปุ่มแคปซูลของทั้งเว็บ · ค่าสี hover ตรงกับ docs/design-*.html
// ปุ่มที่เป็นลิงก์ใช้ buttonVariants() เป็นคลาสบน <a> / PressAnchor ตรง ๆ (ไม่ใช้ <Button> เพราะ Base UI ใส่ role="button" ให้ลิงก์)
// ปุ่มในการ์ดที่เป็น <span> ข้างในลิงก์ทั้งใบก็ใช้ buttonVariants() เช่นกัน ใส่ group-hover: ผ่าน className ให้ hover ตามการ์ด
const button = cva("block rounded-full text-center font-semibold transition-colors", {
  variants: {
    variant: {
      dark: "bg-ink text-white hover:bg-ink/90",
      brand: "bg-brand text-ink hover:bg-brand/85",
      outline: "border-[1.5px] border-outline text-ink hover:border-brand hover:bg-brand-wash",
      wash: "bg-brand-wash text-ink hover:bg-brand-soft",
    },
    size: {
      default: "px-6 py-3.5",
      lg: "px-7 py-4 text-[17px]",
      xl: "px-10 py-[17px] text-lg",
      icon: "flex h-[42px] w-[42px] items-center justify-center p-0 font-normal",
    },
  },
  defaultVariants: { variant: "dark", size: "default" },
})

type ButtonStyle = VariantProps<typeof button>

export type ButtonVariant = NonNullable<ButtonStyle["variant"]>
export type ButtonSize = NonNullable<ButtonStyle["size"]>

/** คลาสของปุ่ม · className ที่ส่งเข้ามาทับค่าของ variant/size ได้ (cn รวมคลาสที่ชนกันให้) */
function buttonVariants({ className, ...style }: ButtonStyle & { className?: string } = {}) {
  return cn(button({ ...style, className }))
}

/** <button> จริง (ลูกศร carousel, ปุ่มปิด modal) · ลิงก์ให้ใช้ buttonVariants() */
function Button({ className, variant, size, ...props }: Omit<ButtonPrimitive.Props, "className"> & ButtonStyle & { className?: string }) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={buttonVariants({ variant, size, className: cn("cursor-pointer", className) })}
      {...props}
    />
  )
}

export { Button, buttonVariants }
