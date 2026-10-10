import { catalog } from '@/catalog'
import { Hero } from '@/components/landing/hero'
import { ClipsSection, ClosingBand, FeaturedSection, FloatingContact, PromoSection, ReviewsSection, TeacherSection } from '@/components/landing/sections'

export default function LandingPage() {
  const { hero, promos, featured, teacher, clips, reviews } = catalog.landing()

  return (
    <>
      <Hero hero={hero} />
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
