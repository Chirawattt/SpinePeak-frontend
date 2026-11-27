// การ์ดรูปรีวิวบนหน้าแรก · ชื่อ ลิงก์ และปกคอร์สมาจากคอร์ส / SET ของ slug นั้น

import type { Course, CourseSet, ReviewImage } from '@content/types'

export type ReviewImageCard = {
  slug: string
  kind: 'course' | 'set'
  title: string
  href: string
  /** รูปบนการ์ด */
  image: string
  /** ปกคอร์สสำหรับแบนเนอร์ท้าย Dialog (SET ใช้ปกคอร์สแรกที่มี) · ไม่มี = แบนเนอร์สีเข้ม */
  cover?: string
  images: string[]
}

/** slug ที่ไม่มีอยู่ข้ามไป: validateContent() รายงานให้ build พังก่อนอยู่แล้ว */
export function buildReviewCards(reviews: ReviewImage[], courses: Course[], sets: CourseSet[]): ReviewImageCard[] {
  return reviews.flatMap(({ slug, cover: image, images }): ReviewImageCard[] => {
    const course = courses.find((c) => c.slug === slug)
    const set = sets.find((s) => s.slug === slug)
    const item = course ?? set
    if (!item) return []
    const cover = course ? course.coverImage : set?.courseSlugs.map((m) => courses.find((c) => c.slug === m)?.coverImage).find(Boolean)
    const href = course ? `/courses/${slug}` : `/sets/${slug}`
    return [{ slug, kind: course ? 'course' : 'set', title: item.title, href, image, images, ...(cover && { cover }) }]
  })
}
