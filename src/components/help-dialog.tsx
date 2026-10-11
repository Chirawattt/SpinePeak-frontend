'use client'

// modal "ช่วยเหลือ" จากลิงก์ใน footer: แท็บซ้าย (วิธีสมัครเรียน / คำถามที่พบบ่อย) เนื้อหาขวา ปุ่มทัก LINE ล่างสุด
// โหลดเมื่อกดลิงก์ครั้งแรกเท่านั้น (ดู footer-help.tsx) footer ทุกหน้าจึงไม่ต้องแบก JS ของ modal
// import จาก '@/catalog' ได้แค่ type ตัว runtime โหลดข้อมูล content/ ทั้งก้อนเข้า bundle

import { XIcon } from 'lucide-react'
import type { ReactNode, RefObject } from 'react'
import type { Faq, HelpStep } from '@/catalog'
import { FaqList } from '@/components/faq-list'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export type HelpSection = 'apply' | 'faq'

export type HelpDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  section: HelpSection
  onSectionChange: (section: HelpSection) => void
  /** แท็บที่มีเนื้อหา เรียงตามที่แสดง */
  sections: { id: HelpSection; label: string }[]
  steps: HelpStep[]
  faqs: Faq[]
  /** ปิดแล้ว focus กลับไปที่ลิงก์ที่กดเปิด */
  finalFocus: RefObject<HTMLElement | null>
  /** ปุ่มทักแอดมิน ให้ server สร้างมา (ปุ่มติดต่อต้องอ่านข้อมูล content/ ซึ่ง client ไม่ควรโหลด) */
  children: ReactNode
}

const TAB =
  'rounded-xl px-4 py-3 text-base font-semibold whitespace-nowrap text-ink transition-colors hover:bg-brand-wash data-active:bg-ink data-active:text-white data-active:hover:bg-ink'

export function HelpDialog({ open, onOpenChange, section, onSectionChange, sections, steps, faqs, finalFocus, children }: HelpDialogProps) {
  const title = sections.find((s) => s.id === section)?.label

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        finalFocus={finalFocus}
        className="h-[min(620px,calc(100dvh-1.5rem))] w-[min(920px,calc(100%-1.5rem))] overflow-hidden rounded-3xl"
      >
        <Tabs
          orientation="vertical"
          value={section}
          onValueChange={(v) => onSectionChange(v as HelpSection)}
          className="h-full flex-col md:flex-row"
        >
          <div className="flex flex-none flex-col gap-3 border-b border-divider bg-tint p-3 pr-16 md:w-[230px] md:border-r md:border-b-0 md:p-4">
            <div className="hidden px-2 pt-1 font-heading text-sm font-semibold text-eyebrow md:block">ช่วยเหลือ</div>
            <TabsList aria-label="ช่วยเหลือ" className="gap-1.5 overflow-x-auto md:flex-col md:overflow-visible">
              {sections.map((s) => (
                <TabsTrigger key={s.id} value={s.id} className={TAB}>
                  {s.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <DialogClose
              aria-label="ปิดหน้าต่าง"
              render={<Button variant="wash" size="icon" className="absolute top-3 right-3 outline-none focus-visible:ring-3 focus-visible:ring-ink/60 md:top-4 md:right-4" />}
            >
              <XIcon className="h-[18px] w-[18px]" aria-hidden />
            </DialogClose>

            <DialogTitle className="px-5 pt-5 pb-4 text-[26px] leading-tight font-semibold md:px-8 md:pt-8 md:text-[30px]">{title}</DialogTitle>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 md:px-8">
              {steps.length > 0 && (
                <TabsContent value="apply">
                  <ol className="flex flex-col gap-3.5">
                    {steps.map((step, i) => (
                      <li key={`${i}-${step.title}`} className="rounded-2xl border border-card-line px-5 py-[18px]">
                        <div className="font-heading text-[17px] font-semibold">
                          <span aria-hidden>{i + 1}. </span>
                          {step.title}
                        </div>
                        <p className="mt-1 text-[15px] leading-[1.6] text-muted">{step.desc}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              )}
              {faqs.length > 0 && (
                <TabsContent value="faq">
                  <FaqList faqs={faqs} />
                </TabsContent>
              )}
            </div>

            <div className="flex flex-none flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-divider px-5 py-4 md:px-8">
              <p className="text-[15px] text-muted">ยังมีคำถาม หรืออยากสมัครเรียน ทักแอดมินได้เลย</p>
              {children}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
