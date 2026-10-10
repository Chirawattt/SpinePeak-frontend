import { describe, expect, it } from 'vitest'
import { catalog as realCatalog } from '.'
import { createCatalog } from './catalog'
import { parseSetFilters } from './set-list'
import { testContent, testCourse, testSet } from './test-content'

// เซ็ตตัวอย่างตามลำดับในชีต: กลุ่มสลับกันเพื่อให้เห็นว่าไม่ได้เรียงตามกลุ่ม
const courses = [
  testCourse({ slug: 'c1', price: 500 }),
  testCourse({ slug: 'c2', price: 500 }),
  testCourse({ slug: 'c3', price: 1000, group: 'mplai' }),
  testCourse({ slug: 'c4', price: 1000, group: 'mplai' }),
]
const sets = [
  testSet({ code: 'PR-01', slug: 'pr-01-bundle', title: 'วิทย์ ป.4', tagline: 'ครบในเซ็ตเดียว', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
  testSet({ code: 'NAT-01', slug: 'nat-01-bundle', title: 'A-Level ชีวะ', tagline: 'ตะลุยโจทย์', group: 'mplai', price: 1500, courseSlugs: ['c3', 'c4'] }),
  testSet({ code: 'PR-02', slug: 'pr-02-bundle', title: 'วิทย์ ป.5', tagline: 'ครบเหมือนกัน', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
]
const catalog = createCatalog(testContent({ courses, sets }))
const slugs = (f: Parameters<typeof catalog.setList>[0]) => catalog.setList(f).cards.map((c) => c.slug)

describe('setList()', () => {
  it('lists every set in sheet order when no group is chosen', () => {
    expect(slugs({})).toEqual(['pr-01-bundle', 'nat-01-bundle', 'pr-02-bundle'])
    expect(catalog.setList({}).resultText).toBe('พบ 3 เซ็ต')
  })

  it('keeps only the sets of the chosen group, still in sheet order', () => {
    expect(slugs({ group: 'prathom' })).toEqual(['pr-01-bundle', 'pr-02-bundle'])
    expect(catalog.setList({ group: 'prathom' }).resultText).toBe('พบ 2 เซ็ต')
  })

  it('gives one tab per group with how many sets it has, keeping the search', () => {
    expect(catalog.setList({ group: 'mplai', q: 'วิทย์' }).tabs).toEqual([
      { label: 'ทุกระดับชั้น', count: '3 เซ็ต', href: '/sets?q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: false },
      { label: 'ประถม', count: '2 เซ็ต', href: '/sets?group=prathom&q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: false },
      { label: 'ม.ต้น', count: '0 เซ็ต', href: '/sets?group=mton&q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: false },
      { label: 'ม.ปลาย', count: '1 เซ็ต', href: '/sets?group=mplai&q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: true },
    ])
  })

  it('searches title, tagline and set code, ignoring case; every word must match', () => {
    expect(slugs({ q: 'ป.5' })).toEqual(['pr-02-bundle'])
    expect(slugs({ q: 'ตะลุย' })).toEqual(['nat-01-bundle'])
    expect(slugs({ q: 'nat-01' })).toEqual(['nat-01-bundle'])
    expect(slugs({ q: 'วิทย์ ครบ' })).toEqual(['pr-01-bundle', 'pr-02-bundle'])
    expect(slugs({ q: 'วิทย์ ตะลุย' })).toEqual([])
    expect(slugs({ q: '  ' })).toHaveLength(3)
  })

  it('combines group and search, and flags an empty result with a way to clear', () => {
    expect(slugs({ group: 'mplai', q: 'วิทย์' })).toEqual([])
    expect(catalog.setList({ group: 'mplai', q: 'วิทย์' })).toMatchObject({ empty: true, resultText: 'ไม่พบเซ็ตที่ตรงกับที่ค้นหา', clearHref: '/sets' })
    expect(catalog.setList({})).toMatchObject({ empty: false })
    expect(catalog.setList({})).not.toHaveProperty('clearHref')
  })

  it('pages the grid by the sizes in site.json', () => {
    expect(catalog.setList({}).paging).toEqual({ first: 9, step: 6 })
  })

  it('describes each card: code, group, course count, cover, price and the link', () => {
    expect(catalog.setList({}).cards[0]).toMatchObject({
      href: '/sets/pr-01-bundle',
      codeLabel: 'เซ็ต PR-01',
      title: 'วิทย์ ป.4',
      group: 'ประถม',
      courseCount: '2 คอร์ส',
      price: '990.-',
      cover: { tone: 'sky' },
    })
  })

  it('shows the struck-through regular price only for sets that save enough', () => {
    const cards = catalog.setList({}).cards
    // 990 จาก 1,000 ประหยัด 10 บาท 1% ไม่ถึงเกณฑ์ · 1,500 จาก 2,000 ประหยัด 500
    expect(cards[0]).not.toHaveProperty('savings')
    expect(cards[1]?.savings).toMatchObject({ regularPrice: '2,000.-', amount: '500.-', percent: '25%' })
  })
})

describe('parseSetFilters()', () => {
  it('keeps only group and search from the URL; a topic from a course link is ignored', () => {
    expect(parseSetFilters(new URLSearchParams('group=mton&q=ชีวะ&topic=x&utm=1'))).toEqual({ group: 'mton', q: 'ชีวะ' })
    expect(parseSetFilters(new URLSearchParams('group=nope'))).toEqual({})
  })
})

// ตัวเลขของ content/ จริงวันนี้ · ถ้าชีตเพิ่มหรือลบเซ็ต ให้แก้ตัวเลขในเทสต์นี้ตาม
describe('setList() on the real content', () => {
  it('counts 27 sets in all, 10 in ประถม, 6 in ม.ต้น and 11 in ม.ปลาย', () => {
    expect(realCatalog.setList({}).tabs.map((t) => [t.label, t.count])).toEqual([
      ['ทุกระดับชั้น', '27 เซ็ต'],
      ['ประถม', '10 เซ็ต'],
      ['มัธยมต้น', '6 เซ็ต'],
      ['มัธยมปลาย', '11 เซ็ต'],
    ])
  })

  it('shows PR-01 with a single price and no strike-through', () => {
    const pr01 = realCatalog.setList({}).cards.find((c) => c.codeLabel === 'เซ็ต PR-01')

    expect(pr01).toBeDefined()
    expect(pr01).not.toHaveProperty('savings')
  })
})
