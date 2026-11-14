import { describe, expect, it } from 'vitest'
import { createCatalog } from './catalog'
import { filterCatalogList, SET_PREVIEW } from './catalog-list'
import { mergeFaqs } from './course-list'
import { testContent, testCourse, testSet } from './test-content'

const courses = [
  testCourse({ slug: 'c1', title: 'เนื้อหา ป.4', price: 500, category: 'เนื้อหาประถม', setCodes: ['PR-01'] }),
  testCourse({ slug: 'c2', title: 'ข้อสอบ ป.4', price: 500, category: 'ข้อสอบประถม', setCodes: ['PR-01'] }),
  testCourse({ slug: 'c3', title: 'ปรับพื้นฐาน ม.4', price: 1000, group: 'mplai', category: 'ปรับพื้นฐาน', setCodes: ['NAT-01'] }),
  testCourse({ slug: 'c4', title: 'A-Level ชีวะ', price: 1000, group: 'mplai', category: 'A-Level', setCodes: ['NAT-01'] }),
  testCourse({ slug: 'c5', title: 'สอวน. ชีวะ', price: 1000, group: 'mplai', category: 'สอวน.' }),
]
// PR-01 ลด 1% (ไม่ถึงเกณฑ์ "คุ้ม") · NAT-01 ลด 25%
const sets = [
  testSet({ code: 'PR-01', slug: 'pr-01-bundle', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
  testSet({ code: 'NAT-01', slug: 'nat-01-bundle', title: 'ม.ปลาย ครบ', group: 'mplai', price: 1500, courseSlugs: ['c3', 'c4'] }),
]
const catalog = createCatalog(testContent({ courses, sets }))
const listOf = (filters: Parameters<typeof filterCatalogList>[1]) => filterCatalogList(catalog.catalogListIndex(), filters)

describe('filterCatalogList()', () => {
  it('filters SETs and single courses with the same filters', () => {
    const list = listOf({ group: 'mplai' })

    expect(list.sets.cards.map((c) => c.slug)).toEqual(['nat-01-bundle'])
    expect(list.courses.cards.map((c) => c.slug)).toEqual(['c3', 'c4', 'c5'])
  })

  it('finds a SET by the name of a course inside it, alongside the course itself', () => {
    const list = listOf({ q: 'A-Level' })

    expect(list.sets.cards.map((c) => c.slug)).toEqual(['nat-01-bundle'])
    expect(list.courses.cards.map((c) => c.slug)).toEqual(['c4'])
  })

  it('has no SETs when none match, so the page can hide that section', () => {
    expect(listOf({ group: 'mplai', category: 'สอวน.' }).sets.cards).toEqual([])
  })

  it('offers each category once, courses first', () => {
    expect(listOf({ group: 'mplai' }).categoryOptions).toEqual(['ปรับพื้นฐาน', 'A-Level', 'สอวน.'])
  })

  describe('SET preview', () => {
    const many = Array.from({ length: SET_PREVIEW + 3 }, (_, i) =>
      testSet({ code: `PR-${i}`, slug: `pr-${i}-bundle`, group: i % 2 ? 'mplai' : 'prathom', courseSlugs: ['c1', 'c2'] }),
    )
    const big = createCatalog(testContent({ courses, sets: many })).catalogListIndex()

    it(`shows only the first ${SET_PREVIEW}, in sheet order, when no group is chosen`, () => {
      const list = filterCatalogList(big, {})
      expect(list.setPreview).toBe(SET_PREVIEW)
      expect(list.sets.cards[0]?.slug).toBe('pr-0-bundle')
    })

    it('shows every SET of the group once a group is chosen', () => {
      const list = filterCatalogList(big, { group: 'prathom' })
      expect(list.setPreview).toBe(list.sets.cards.length)
    })

    it('never previews more than there are', () => {
      expect(listOf({}).setPreview).toBe(2)
    })
  })
})

describe('course card SET label', () => {
  const card = (slug: string) => listOf({}).courses.cards.find((c) => c.slug === slug)

  it('advertises the best saving of a SET that has the course, rounded down', () => {
    expect(card('c3')?.setCount).toBe('มีใน SET · ประหยัดสูงสุด 25%')
  })

  it('falls back to the plain count when the best saving is too small to call worth it', () => {
    expect(card('c1')?.setCount).toBe('มีใน 1 SET')
  })

  it('has no label for a course in no SET', () => {
    expect(card('c5')?.setCount).toBeUndefined()
  })

  it('does not advertise SETs for a course sold on its own only', () => {
    const solo = createCatalog(testContent({ courses: courses.map((c) => (c.slug === 'c3' ? { ...c, saleMode: 'standalone_only' as const, setCodes: [] } : c)), sets }))
    expect(filterCatalogList(solo.catalogListIndex(), {}).courses.cards.find((c) => c.slug === 'c3')?.setCount).toBeUndefined()
  })
})

describe('mergeFaqs()', () => {
  it('puts SET questions first and drops the ones the course list already answers', () => {
    const setFaqs = [
      { q: 'ซื้อ SET แล้วได้ทุกคอร์สทันทีไหม', a: 'ได้ทันที' },
      { q: 'คอร์สใน SET หมดอายุเมื่อไหร่', a: 'ไม่จำกัดอายุ' },
    ]
    const courseFaqs = [{ q: 'คอร์สหมดอายุเมื่อไหร่', a: 'ไม่จำกัดอายุ' }]

    expect(mergeFaqs(setFaqs, courseFaqs)).toEqual([setFaqs[0], courseFaqs[0]])
  })
})
