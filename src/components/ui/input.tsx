import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "cn"

// หน้าตาแคปซูลของช่องกรอกทั้งเว็บ · Input กับ NativeSelect ใช้ร่วมกันเพื่อไม่ให้หน้าตาแยกทางกัน · สีขอบ = --input = --color-outline
const controlStyle = "min-w-0 rounded-full border border-input bg-white px-5 py-3 text-[15px] outline-none focus:border-brand"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <InputPrimitive type={type} data-slot="input" className={cn(controlStyle, className)} {...props} />
}

export { Input, controlStyle }
