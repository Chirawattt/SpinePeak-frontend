import { catalog } from '@/catalog'
import { GroupEntry } from '@/components/landing/group-entry'
import { Hero } from '@/components/landing/hero'
import { ReviewImageSection } from '@/components/landing/review-image-section'
import { ClipsSection, ClosingBand, FeaturedSection, FloatingContact, PromoSection, TeacherSection } from '@/components/landing/sections'

export default function LandingPage() {
  const { hero, groupEntries, promos, featured, featuredNote, teacher, clips, reviews } = catalog.landing()

  return (
    <>
      <Hero hero={hero} entry={groupEntries.length > 0 && <GroupEntry groups={groupEntries} />} />
      {promos.length > 0 && <PromoSection promos={promos} />}
      {featured.length > 0 && <FeaturedSection items={featured} note={featuredNote} />}
      {teacher && <TeacherSection teacher={teacher} photoAlt={teacher.name} />}
      {clips.length > 0 && <ClipsSection clips={clips} />}
      {/* MOCK การ์ดรีวิวแบบรูปเต็มใบ · ยังไม่ต่อข้อมูล · reviews มีเฉพาะตอน dev (รีวิวตอนนี้เป็น mock ทั้งหมด) จึงไม่หลุดขึ้นเว็บจริง */}
      {reviews.length > 0 && <ReviewImageSection />}
      <ClosingBand />
      <FloatingContact />
    </>
  )
}
