import { describe, expect, it } from 'vitest'
import { createCatalog } from './catalog'
import { testContent, testCourse, testSet } from './test-content'

describe('review image cards', () => {
  const courses = [testCourse({ slug: 'c1', title: 'คอร์สหนึ่ง', coverImage: '/courses/c1.png' })]
  const sets = [testSet({ slug: 's-bundle', title: 'เซ็ตหนึ่ง', courseSlugs: ['c1'] })]
  const row = (slug: string) => ({ slug, cover: `/reviews/${slug}.png`, images: ['/reviews/a.png'] })

  it('takes the title, link and course cover from the course or set, in sheet order', () => {
    const { reviewCards } = createCatalog(testContent({ courses, sets, reviewImages: [row('s-bundle'), row('c1')] })).landing()

    expect(reviewCards).toEqual([
      { slug: 's-bundle', kind: 'set', title: 'เซ็ตหนึ่ง', href: '/sets/s-bundle', image: '/reviews/s-bundle.png', images: ['/reviews/a.png'], cover: '/courses/c1.png' },
      { slug: 'c1', kind: 'course', title: 'คอร์สหนึ่ง', href: '/courses/c1', image: '/reviews/c1.png', images: ['/reviews/a.png'], cover: '/courses/c1.png' },
    ])
  })

  it('reports a slug that no longer exists and skips its card', () => {
    const catalog = createCatalog(testContent({ courses, reviewImages: [row('gone')] }))

    expect(catalog.landing().reviewCards).toEqual([])
    expect(catalog.validateContent()).toContainEqual(expect.objectContaining({ where: 'รูปรีวิว gone' }))
  })
})
