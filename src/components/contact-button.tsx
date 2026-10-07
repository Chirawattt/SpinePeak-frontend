import { contactHref, type ContactChannel, type ContactItem } from '@/contact'
import { PressAnchor } from '@/components/motion/press'

const VARIANT = {
  dark: 'bg-ink text-white hover:bg-ink/90',
  brand: 'bg-brand text-ink hover:bg-brand/85',
  outline: 'border-[1.5px] border-outline text-ink hover:border-brand hover:bg-brand-wash',
}

const DEFAULT_LABEL: Record<ContactChannel, string> = {
  line: 'ทักแอดมินเพื่อสมัคร',
  facebook: 'ทักทาง Messenger',
}

/** ปุ่มติดต่อทุกปุ่มบนเว็บ: href มาจาก module Contact ที่เดียว */
export function ContactButton({
  item,
  channel = 'line',
  variant = 'dark',
  className = '',
  children,
}: {
  item?: ContactItem
  channel?: ContactChannel
  variant?: keyof typeof VARIANT
  className?: string
  children?: React.ReactNode
}) {
  return (
    <PressAnchor
      href={contactHref(item, channel)}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-full px-6 py-3.5 text-center font-semibold transition-colors ${VARIANT[variant]} ${className}`}
    >
      {children ?? DEFAULT_LABEL[channel]}
    </PressAnchor>
  )
}
