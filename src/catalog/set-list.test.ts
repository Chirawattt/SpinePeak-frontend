import { describe, expect, it } from 'vitest'
import { catalog as realCatalog } from '.'
import { createCatalog } from './catalog'
import { parseSetFilters } from './set-list'
import { testContent, testCourse, testSet } from './test-content'

// SET ตัวอย่างตามลำดับในชีต: กลุ่มสลับกันเพื่อให้เห็นว่าไม่ได้เรียงตามกลุ่ม
const courses = [
  testCourse({ slug: 'c1', title: 'เนื้อหา ป.4', price: 500, category: 'เนื้อหาประถม' }),
  testCourse({ slug: 'c2', title: 'ข้อสอบ ป.4', price: 500, category: 'ข้อสอบประถม', stats: { videoHours: 3, pdfPages: 27, questionCount: 100 } }),
  testCourse({ slug: 'c3', title: 'ปรับพื้นฐาน ม.4', price: 1000, group: 'mplai', category: 'ปรับพื้นฐาน' }),
  testCourse({ slug: 'c4', title: 'A-Level ชีวะ ปี 68', price: 1000, group: 'mplai', category: 'A-Level' }),
]
const sets = [
  testSet({ code: 'PR-01', slug: 'pr-01-bundle', title: 'วิทย์ ป.4', tagline: 'ครบในเซ็ตเดียว', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
  testSet({ code: 'NAT-01', slug: 'nat-01-bundle', title: 'ม.ปลาย ครบ', tagline: 'ตะลุยโจทย์', group: 'mplai', price: 1500, courseSlugs: ['c3', 'c4'] }),
  testSet({ code: 'PR-02', slug: 'pr-02-bundle', title: 'วิทย์ ป.5', tagline: 'ครบเหมือนกัน', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
]
const catalog = createCatalog(testContent({ courses, sets }))
const slugs = (f: Parameters<typeof catalog.setList>[0]) => catalog.setList(f).cards.map((c) => c.slug)

describe('setList()', () => {
  it('lists every set in sheet order when no group is chosen', () => {
    expect(slugs({})).toEqual(['pr-01-bundle', 'nat-01-bundle', 'pr-02-bundle'])
    expect(catalog.setList({}).resultText).toBe('พบ 3 SET')
  })

  it('keeps only the sets of the chosen group, still in sheet order', () => {
    expect(slugs({ group: 'prathom' })).toEqual(['pr-01-bundle', 'pr-02-bundle'])
    expect(catalog.setList({ group: 'prathom' }).resultText).toBe('พบ 2 SET')
  })

  it('gives one tab per group with how many sets it has, keeping the search but dropping the category', () => {
    expect(catalog.setList({ group: 'mplai', category: 'A-Level', q: 'วิทย์' }).tabs).toEqual([
      { label: 'ทุกระดับชั้น', count: '3 SET', href: '/sets?q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: false },
      { label: 'ประถม', count: '2 SET', href: '/sets?group=prathom&q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: false },
      { label: 'ม.ต้น', count: '0 SET', href: '/sets?group=mton&q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: false },
      { label: 'ม.ปลาย', count: '1 SET', href: '/sets?group=mplai&q=%E0%B8%A7%E0%B8%B4%E0%B8%97%E0%B8%A2%E0%B9%8C', active: true },
    ])
  })

  it('searches title, tagline, set code and the names of the courses inside; every word must match', () => {
    expect(slugs({ q: 'ป.5' })).toEqual(['pr-02-bundle'])
    expect(slugs({ q: 'ตะลุย' })).toEqual(['nat-01-bundle'])
    expect(slugs({ q: 'nat-01' })).toEqual(['nat-01-bundle'])
    expect(slugs({ q: 'a-level' })).toEqual(['nat-01-bundle'])
    expect(slugs({ q: 'ข้อสอบ ป.4' })).toEqual(['pr-01-bundle', 'pr-02-bundle'])
    expect(slugs({ q: 'วิทย์ ตะลุย' })).toEqual([])
    expect(slugs({ q: '  ' })).toHaveLength(3)
  })

  it('filters by category: a set has every category of its courses', () => {
    expect(slugs({ category: 'A-Level' })).toEqual(['nat-01-bundle'])
    expect(slugs({ category: 'ข้อสอบประถม' })).toEqual(['pr-01-bundle', 'pr-02-bundle'])
  })

  it('offers the categories of the sets in the chosen group, in course order', () => {
    expect(catalog.setList({}).categoryOptions).toEqual(['เนื้อหาประถม', 'ข้อสอบประถม', 'ปรับพื้นฐาน', 'A-Level'])
    expect(catalog.setList({ group: 'mplai' }).categoryOptions).toEqual(['ปรับพื้นฐาน', 'A-Level'])
  })

  it('flags an empty result', () => {
    expect(catalog.setList({ group: 'mplai', q: 'วิทย์' })).toMatchObject({ cards: [], empty: true, resultText: 'พบ 0 SET' })
    expect(catalog.setList({}).empty).toBe(false)
  })

  it('pages the grid by the sizes in site.json', () => {
    expect(catalog.setList({}).paging).toEqual({ first: 9, step: 6 })
  })
})

describe('set card', () => {
  const card = (slug: string, inCatalog = catalog) => inCatalog.setList({}).cards.find((c) => c.slug === slug)

  it('describes the set: code, group with its categories, course count, totals, price and the link', () => {
    expect(card('pr-01-bundle')).toMatchObject({
      href: '/sets/pr-01-bundle',
      codeLabel: 'SET PR-01',
      title: 'วิทย์ ป.4',
      tagline: 'ครบในเซ็ตเดียว',
      eyebrow: 'ประถม · เนื้อหาประถม · ข้อสอบประถม',
      courseCount: '2 คอร์ส',
      stats: ['VDO 3 ชม.', 'PDF 27 หน้า', 'โจทย์ 100 ข้อ'],
      price: '990.-',
    })
  })

  it('shows the saving on every set that is cheaper than buying separately, rounded down', () => {
    // 990 จาก 1,000 ประหยัด 10 บาท 1% ก็ยังโชว์
    expect(card('pr-01-bundle')?.savings).toEqual({ regularPrice: '1,000.-', amount: '10.-', percent: '1%' })
    expect(card('nat-01-bundle')?.savings).toEqual({ regularPrice: '2,000.-', amount: '500.-', percent: '25%' })
  })

  it('stacks the last 3 courses, last one in front, and counts the rest as +N', () => {
    const five = ['a', 'b', 'c', 'd', 'e'].map((s) => testCourse({ slug: s, title: `คอร์ส ${s}`, price: 500 }))
    const big = createCatalog(testContent({ courses: five, sets: [testSet({ slug: 'big-bundle', price: 2000, courseSlugs: ['a', 'b', 'c', 'd', 'e'] })] }))

    expect(card('big-bundle', big)).toMatchObject({
      stack: [{ title: 'คอร์ส e' }, { title: 'คอร์ส d' }, { title: 'คอร์ส c' }],
      moreInStack: 2,
      listed: [
        { title: 'คอร์ส a', price: '500.-' },
        { title: 'คอร์ส b', price: '500.-' },
        { title: 'คอร์ส c', price: '500.-' },
        { title: 'คอร์ส d', price: '500.-' },
      ],
      moreListed: 1,
    })
  })

  it('needs no +N for a small set', () => {
    expect(card('pr-01-bundle')).toMatchObject({ moreInStack: 0, moreListed: 0 })
  })
})

describe('parseSetFilters()', () => {
  it('keeps group, category and search from the URL and drops unknown keys', () => {
    expect(parseSetFilters(new URLSearchParams('group=mton&q=ชีวะ&category=สวช.&utm=1'))).toEqual({ group: 'mton', category: 'สวช.', q: 'ชีวะ' })
    expect(parseSetFilters(new URLSearchParams('group=nope'))).toEqual({})
  })
})

// ตัวเลขของ content/ จริงวันนี้ · ถ้าชีตเพิ่มหรือลบ SET ให้แก้ตัวเลขในเทสต์นี้ตาม
describe('setList() on the real content', () => {
  it('counts 27 sets in all, 10 in ประถม, 6 in มัธยมต้น and 11 in มัธยมปลาย', () => {
    expect(realCatalog.setList({}).tabs.map((t) => [t.label, t.count])).toEqual([
      ['ทุกระดับชั้น', '27 SET'],
      ['ประถม', '10 SET'],
      ['มัธยมต้น', '6 SET'],
      ['มัธยมปลาย', '11 SET'],
    ])
  })

  it('shows a saving on every real set', () => {
    expect(realCatalog.setList({}).cards.filter((c) => !c.savings)).toEqual([])
  })
})
