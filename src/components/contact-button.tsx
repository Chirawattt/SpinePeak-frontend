import { contactHref, type ContactChannel, type ContactItem } from '@/contact'
import { PressAnchor } from '@/components/motion/press'
import { buttonVariants, type ButtonSize, type ButtonVariant } from '@/components/ui/button'

const DEFAULT_LABEL: Record<ContactChannel, string> = {
  line: 'ทักแอดมินเพื่อสมัคร',
  facebook: 'ทักทาง Messenger',
}

/** ปุ่มติดต่อทุกปุ่มบนเว็บ: href มาจาก module Contact ที่เดียว */
export function ContactButton({
  item,
  channel = 'line',
  variant = 'dark',
  size,
  className,
  children,
}: {
  item?: ContactItem
  channel?: ContactChannel
  variant?: Exclude<ButtonVariant, 'wash'>
  size?: Exclude<ButtonSize, 'icon'>
  className?: string
  children?: React.ReactNode
}) {
  return (
    <PressAnchor
      href={contactHref(item, channel)}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant, size, className })}
    >
      {children ?? DEFAULT_LABEL[channel]}
    </PressAnchor>
  )
}
