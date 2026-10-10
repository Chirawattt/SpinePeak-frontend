import Link from 'next/link'
import { Logo } from '@/components/logo'
import { catalog } from '@/catalog'
import type { SocialLink } from '@/catalog'

const SOCIAL_BADGE: Record<SocialLink['kind'], string> = { instagram: 'IG', facebook: 'FB' }

// ไม่มี "วิธีชำระเงิน": เฟส 1 ยังไม่มีระบบจ่ายเงิน
// ไม่มีเงื่อนไขการใช้งาน / นโยบายความเป็นส่วนตัว: ยังไม่มีหน้า
// ชี้ไป FAQ ของหน้ารายการคอร์สชั่วคราว จนกว่าจะเปลี่ยนเป็น modal (issue #16)
const HELP_LINKS = [
  { label: 'วิธีสมัครเรียน', href: '/courses#faq' },
  { label: 'คำถามที่พบบ่อย', href: '/courses#faq' },
]

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

        <div>
          <ColumnTitle>ช่วยเหลือ</ColumnTitle>
          <div className="flex flex-col gap-2.5 text-[14.5px]">
            {HELP_LINKS.map((l) => (
              <Link key={l.label} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

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
