import { catalog } from '@/catalog'
import { GroupEntry } from '@/components/landing/group-entry'
import { Hero } from '@/components/landing/hero'
import { ClipsSection, ClosingBand, FeaturedSection, FloatingContact, PromoSection, ReviewsSection, TeacherSection } from '@/components/landing/sections'

export default function LandingPage() {
  const { hero, groupEntries, promos, featured, teacher, clips, reviews } = catalog.landing()

  return (
    <>
      <Hero hero={hero} entry={groupEntries.length > 0 && <GroupEntry groups={groupEntries} />} />
      {promos.length > 0 && <PromoSection promos={promos} />}
      {featured.length > 0 && <FeaturedSection items={featured} />}
      {teacher && <TeacherSection teacher={teacher} photoAlt={teacher.name} />}
      {clips.length > 0 && <ClipsSection clips={clips} />}
      {reviews.length > 0 && <ReviewsSection reviews={reviews} />}
      <ClosingBand />
      <FloatingContact />
    </>
  )
}
