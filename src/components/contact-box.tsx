import { ContactButton } from '@/components/contact-button'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** กล่อง "ทักมาได้เลย" ท้ายหน้ารายการคอร์ส / SET · LINE เป็นปุ่มหลัก Instagram กับอีเมลแสดงเมื่อ site.json มี */
export function ContactBox({ title, text, instagramHref, email }: { title: string; text?: string; instagramHref?: string; email?: string }) {
  return (
    <Card className="bg-footer p-7">
      <h2 className="mb-2.5 font-heading text-[clamp(22px,3.2vw,26px)] font-bold">{title}</h2>
      {text && <p className="text-[15.5px] leading-[1.75] text-ink-soft">{text}</p>}
      <div className="mt-5 flex flex-col gap-2.5">
        <ContactButton variant="brand" className="text-base">
          ทักทาง LINE
        </ContactButton>
        {instagramHref && (
          <a
            href={instagramHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({ variant: 'outline', className: 'text-base' })}
          >
            ส่งข้อความทาง Instagram
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="py-1.5 text-center text-[15px] text-eyebrow hover:text-ink">
            {email}
          </a>
        )}
      </div>
    </Card>
  )
}
