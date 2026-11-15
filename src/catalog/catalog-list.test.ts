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
  testCourse({ slug: 'c6', title: 'ข้อสอบ ม.ปลาย', price: 1000, group: 'mplai', category: 'สอวน.', setCodes: ['AL-01'] }),
]
// PR-01 ลด 1% (ไม่ถึงเกณฑ์ "คุ้ม") · NAT-01 ลด 25%
const sets = [
  testSet({ code: 'PR-01', slug: 'pr-01-bundle', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
  testSet({ code: 'NAT-01', slug: 'nat-01-bundle', title: 'ม.ปลาย ครบ', group: 'mplai', price: 1500, courseSlugs: ['c3', 'c4'] }),
  testSet({ code: 'AL-01', slug: 'al-01-bundle', title: 'ตะลุยโจทย์ A-Level', group: 'mplai', kind: 'practice', price: 900, courseSlugs: ['c6'] }),
]
const catalog = createCatalog(testContent({ courses, sets }))
const listOf = (filters: Parameters<typeof filterCatalogList>[1]) => filterCatalogList(catalog.catalogListIndex(), filters)

const slugsOf = (list: { cards: { slug: string }[] }) => list.cards.map((c) => c.slug)

describe('filterCatalogList()', () => {
  it('splits SETs into SET ปูพื้นฐาน and SET ตะลุยโจทย์ by the kind the sheet gives, keeping sheet order', () => {
    const list = listOf({})

    expect(slugsOf(list.sets.foundation)).toEqual(['pr-01-bundle', 'nat-01-bundle'])
    expect(slugsOf(list.sets.practice)).toEqual(['al-01-bundle'])
  })

  it('filters both SET sections and single courses with the same filters', () => {
    const list = listOf({ group: 'mplai' })

    expect(slugsOf(list.sets.foundation)).toEqual(['nat-01-bundle'])
    expect(slugsOf(list.sets.practice)).toEqual(['al-01-bundle'])
    expect(slugsOf(list.courses)).toEqual(['c3', 'c4', 'c5', 'c6'])
  })

  it('finds a SET by the name of a course inside it, alongside the course itself', () => {
    const list = listOf({ q: 'A-Level' })

    expect(slugsOf(list.sets.foundation)).toEqual(['nat-01-bundle'])
    expect(slugsOf(list.sets.practice)).toEqual(['al-01-bundle'])
    expect(slugsOf(list.courses)).toEqual(['c4'])
  })

  it('leaves a SET section empty when none of its kind match, so the page can hide that section', () => {
    const list = listOf({ group: 'prathom' })

    expect(slugsOf(list.sets.foundation)).toEqual(['pr-01-bundle'])
    expect(list.sets.practice.cards).toEqual([])
  })

  it('offers each category once, courses first, from SETs of every kind', () => {
    expect(listOf({ group: 'mplai' }).categoryOptions).toEqual(['ปรับพื้นฐาน', 'A-Level', 'สอวน.'])
  })

  describe('SET preview', () => {
    const many = Array.from({ length: SET_PREVIEW + 3 }, (_, i) =>
      testSet({ code: `PR-${i}`, slug: `pr-${i}-bundle`, group: i % 2 ? 'mplai' : 'prathom', courseSlugs: ['c1', 'c2'] }),
    )
    const big = createCatalog(testContent({ courses, sets: many })).catalogListIndex()

    it(`shows only the first ${SET_PREVIEW} of each section, in sheet order, when no group is chosen`, () => {
      const list = filterCatalogList(big, {})
      expect(list.sets.foundation.preview).toBe(SET_PREVIEW)
      expect(list.sets.foundation.cards[0]?.slug).toBe('pr-0-bundle')
    })

    it('shows every SET of the group once a group is chosen', () => {
      const list = filterCatalogList(big, { group: 'prathom' })
      expect(list.sets.foundation.preview).toBe(list.sets.foundation.cards.length)
    })

    it('never previews more than there are', () => {
      expect(listOf({}).sets.foundation.preview).toBe(2)
      expect(listOf({}).sets.practice.preview).toBe(1)
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
