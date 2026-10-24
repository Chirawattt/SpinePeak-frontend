import { ArrowRightIcon } from 'lucide-react'
import Link from 'next/link'
import type { GroupEntry as GroupEntryData } from '@/catalog'
import { ContactButton } from '@/components/contact-button'
import { Reveal } from '@/components/motion/reveal'
import { CategoryChips } from '@/components/landing/category-chips'

// ทางเข้าหลักของเว็บ (กลุ่ม → หมวดหมู่) · Hero วางให้เป็นแถวในกริดของตัวเอง (ส่งผ่าน prop entry)
// ลิงก์ทุกอันไปหน้ารายการคอร์สที่กรองไว้แล้ว · คนที่ยังไม่รู้จะเริ่มตรงไหนมีปุ่มให้แอดมินช่วยเลือกที่แถวล่าง
export function GroupEntry({ groups }: { groups: GroupEntryData[] }) {
  return (
    <section aria-labelledby="group-entry-title">
      {/* ขึ้นตามหลัง hero ที่ไล่กันขึ้นมาก่อน */}
      <Reveal trigger="mount" delay={0.35} className="overflow-hidden rounded-[22px] border border-line bg-white shadow-card">
        <h2 id="group-entry-title" className="px-[22px] pt-6 font-heading text-[clamp(22px,3.2vw,26px)] font-bold">
          เรียนอยู่ชั้นไหน
        </h2>

        <ul className="grid md:grid-cols-3">
          {groups.map((group, i) => (
            <li
              key={group.key}
              className={`flex flex-col gap-3.5 px-[22px] pt-5 pb-6 ${i > 0 ? 'border-t border-divider md:border-t-0 md:border-l' : ''}`}
            >
              <Link href={group.href} className="group flex min-h-11 items-center justify-between gap-3 transition-colors hover:text-link-hover">
                <span>
                  <span className="block font-heading text-[22px] leading-[1.3] font-bold">{group.label}</span>
                  <span className="block text-[14.5px] text-muted">
                    {group.courseCount} คอร์ส{group.setCount > 0 && ` · ${group.setCount} SET`}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-brand-wash transition-[background-color,transform] group-hover:translate-x-0.5 group-hover:bg-brand"
                >
                  <ArrowRightIcon className="size-[18px]" strokeWidth={2.2} />
                </span>
              </Link>

              {group.categories.length > 0 && <CategoryChips groupLabel={group.label} groupHref={group.href} categories={group.categories} />}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-divider bg-tint px-[22px] py-4">
          <p className="text-[15px] text-ink-soft">ยังไม่แน่ใจว่าเริ่มตรงไหน บอกชั้นกับเป้าหมาย แอดมินช่วยเลือกให้</p>
          <ContactButton variant="outline" className="bg-white">
            ให้แอดมินช่วยเลือก
          </ContactButton>
        </div>
      </Reveal>
    </section>
  )
}
