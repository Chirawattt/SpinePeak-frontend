import type { Faq } from '@/catalog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

/** accordion ปิดไว้ทุกข้อ เปิดได้หลายข้อพร้อมกัน · คำตอบยังอยู่ใน DOM (hidden="until-found") Ctrl+F หาเจอและกางให้เอง */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion multiple hiddenUntilFound>
      {faqs.map((faq) => (
        <AccordionItem key={faq.q} value={faq.q} className="border-line">
          <AccordionTrigger className="items-start gap-4 rounded-none border-0 py-[18px] text-[17px] font-semibold hover:text-link-hover hover:no-underline">
            {faq.q}
          </AccordionTrigger>
          <AccordionContent className="pb-[18px] text-[15px] leading-[1.7] text-muted">{faq.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
