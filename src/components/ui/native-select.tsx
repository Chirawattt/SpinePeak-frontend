import { cn } from "cn"
import { ChevronDownIcon } from "lucide-react"

import { controlStyle } from "@/components/ui/input"

// <select> ของเบราว์เซอร์จริง (มือถือยังเปิด picker ของระบบ) แต่หน้าตาตรงกับ Input และลูกศรเป็นของธีม
// className ลงที่กรอบด้านนอก (ใช้กำหนดขนาดใน flex) ส่วน props อื่นลงที่ <select>
function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div data-slot="native-select-wrapper" className={cn("relative min-w-0 has-[select:disabled]:opacity-50", className)}>
      <select
        data-slot="native-select"
        // py-[13px] + leading-[normal]: ให้สูงเท่า <select> เดิมของเบราว์เซอร์ (53px) · pr-11 เว้นที่ให้ลูกศร
        className={cn(controlStyle, "w-full cursor-pointer appearance-none py-[13px] pr-11 leading-[normal] disabled:cursor-not-allowed")}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        aria-hidden
        data-slot="native-select-icon"
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  )
}

export { NativeSelect }
