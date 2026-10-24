import Link from 'next/link'
import { ContactButton } from '@/components/contact-button'
import { FooterHelp } from '@/components/footer-help'
import { Logo } from '@/components/logo'
import { catalog } from '@/catalog'
import type { SocialLink } from '@/catalog'

const SOCIAL_BADGE: Record<SocialLink['kind'], string> = { line: 'LINE', instagram: 'IG', facebook: 'FB' }

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-3.5 font-heading text-base font-semibold">{children}</div>
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-brand font-mono text-xs font-medium">
      {children}
    </span>
  )
}

export function SiteFooter() {
  const { name } = catalog.siteInfo()
  const footer = catalog.footer()
  const linkClass = 'text-muted hover:text-ink'
  const { steps, faqs } = footer.help

  return (
    <footer className="border-t border-divider bg-footer">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-10 px-gutter pt-12 pb-9">
        <div>
          <Logo size={46} className="mb-3.5" />
          <p className="mb-4 max-w-[260px] text-[15px] leading-[1.7] text-muted">{footer.blurb}</p>
          {footer.hours && <div className="text-[14.5px] text-muted">{footer.hours}</div>}
        </div>

        <div>
          <ColumnTitle>คอร์สเรียน</ColumnTitle>
          <div className="flex flex-col gap-2.5 text-[14.5px]">
            {footer.groups.map((g) => (
              <Link key={g.href} href={g.href} className={linkClass}>
                {g.label}
              </Link>
            ))}
            <Link href="/sets" className={linkClass}>
              SET คอร์ส
            </Link>
          </div>
        </div>

        {/* ไม่มี "วิธีชำระเงิน": เฟส 1 ยังไม่มีระบบจ่ายเงิน · ไม่มีเงื่อนไขการใช้งาน / นโยบายความเป็นส่วนตัว: ยังไม่มีเนื้อหา
            ไม่มีทั้งขั้นตอนและ FAQ ใน site.json = ซ่อนทั้งคอลัมน์ */}
        {(steps.length > 0 || faqs.length > 0) && (
          <div>
            <ColumnTitle>ช่วยเหลือ</ColumnTitle>
            <div className="flex flex-col items-start gap-2.5 text-[14.5px]">
              <FooterHelp steps={steps} faqs={faqs} linkClassName={linkClass}>
                <ContactButton variant="brand" className="w-full whitespace-nowrap sm:w-fit">
                  ทักแอดมินทาง LINE
                </ContactButton>
              </FooterHelp>
            </div>
          </div>
        )}

        <div>
          <ColumnTitle>ติดต่อเรา</ColumnTitle>
          <div className="flex flex-col gap-2.5 text-[14.5px]">
            {footer.socials.map((s) => (
              <a key={s.kind} href={s.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 break-all">
                <Badge>{SOCIAL_BADGE[s.kind]}</Badge>
                {s.label}
              </a>
            ))}
            {footer.email && (
              <a href={`mailto:${footer.email}`} className="flex items-center gap-2.5 break-all">
                <Badge>@</Badge>
                {footer.email}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-divider-soft px-gutter pt-[18px] pb-[30px] max-md:pb-24 text-[13.5px] text-muted">
        © {new Date().getFullYear()} {name}. สงวนลิขสิทธิ์
      </div>
    </footer>
  )
}
