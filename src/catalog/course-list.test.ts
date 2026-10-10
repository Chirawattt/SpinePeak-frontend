import { describe, expect, it } from 'vitest'
import { catalog as realCatalog } from '.'
import { createCatalog } from './catalog'
import { filtersToQuery, listHref, parseFilters } from './course-filters'
import { testContent, testCourse, testSite } from './test-content'

// คอร์สตัวอย่างตามลำดับในชีต: กลุ่มสลับกันเพื่อให้เห็นว่าไม่ได้เรียงตามกลุ่ม
const courses = [
  testCourse({ slug: 'posn-biology-68', group: 'mplai' }),
  testCourse({ slug: 'primary-science-p4', group: 'prathom' }),
  testCourse({ slug: 'foundation-science-m1-term-1', group: 'mton' }),
  testCourse({ slug: 'a-level-biology-68', group: 'mplai' }),
]
const catalog = createCatalog(testContent({ courses }))

describe('courseList()', () => {
  it('lists every course in sheet order when no group is chosen', () => {
    const list = catalog.courseList({})

    expect(list.cards.map((c) => c.slug)).toEqual([
      'posn-biology-68',
      'primary-science-p4',
      'foundation-science-m1-term-1',
      'a-level-biology-68',
    ])
    expect(list.resultText).toBe('พบ 4 คอร์ส')
  })

  it('keeps only the courses of the chosen group, still in sheet order', () => {
    const list = catalog.courseList({ group: 'mplai' })

    expect(list.cards.map((c) => c.slug)).toEqual(['posn-biology-68', 'a-level-biology-68'])
    expect(list.resultText).toBe('พบ 2 คอร์ส')
  })

  it('gives one tab per group with how many courses it has, marking the chosen one', () => {
    expect(catalog.courseList({ group: 'mplai' }).tabs).toEqual([
      { label: 'ทุกระดับชั้น', count: '4 คอร์ส', href: '/courses', active: false },
      { label: 'ประถม', count: '1 คอร์ส', href: '/courses?group=prathom', active: false },
      { label: 'ม.ต้น', count: '1 คอร์ส', href: '/courses?group=mton', active: false },
      { label: 'ม.ปลาย', count: '2 คอร์ส', href: '/courses?group=mplai', active: true },
    ])
  })

  it('marks the all-groups tab when no group is chosen', () => {
    expect(catalog.courseList({}).tabs.filter((t) => t.active).map((t) => t.label)).toEqual(['ทุกระดับชั้น'])
  })

  it('labels each card with its subject and the lifetime badge', () => {
    const list = createCatalog(testContent({ courses: [testCourse({ subject: 'chemistry' })] })).courseList({})

    expect(list.cards[0]).toMatchObject({ subject: 'เคมี', lifetime: 'ดูได้ไม่จำกัดอายุ' })
  })

  it('never puts a zero or an empty number on a card', () => {
    const empty = testCourse({ slug: 'empty-stats', stats: { questionCount: 0, videoHours: 0 } })
    const partial = testCourse({ slug: 'partial-stats', stats: { questionCount: 0, pdfPages: { min: 30, max: 70 } } })
    const cards = createCatalog(testContent({ courses: [empty, partial] })).courseList({}).cards

    expect(cards[0]).not.toHaveProperty('facts')
    expect(cards[1]?.facts).toBe('PDF 30-70 หน้า')
  })

  it('pages the grid by the sizes in site.json: first page, then more per scroll', () => {
    expect(catalog.courseList({}).paging).toEqual({ first: 9, step: 6 })
  })
})

describe('parseFilters() / filtersToQuery()', () => {
  it.each([{}, { group: 'prathom' as const }, { group: 'mplai' as const }])('turns %o into a query and back unchanged', (filters) => {
    expect(parseFilters(new URLSearchParams(filtersToQuery(filters)))).toEqual(filters)
  })

  it('writes the group into the query so the link can be shared', () => {
    expect(filtersToQuery({ group: 'mplai' })).toBe('group=mplai')
    expect(filtersToQuery({})).toBe('')
  })

  it('treats a value it does not know as no filter at all', () => {
    expect(parseFilters(new URLSearchParams('group=university'))).toEqual({})
    expect(parseFilters(new URLSearchParams('group='))).toEqual({})
  })

  it('ignores query keys it does not know', () => {
    expect(parseFilters(new URLSearchParams('group=mton&utm_source=line&page=3'))).toEqual({ group: 'mton' })
  })
})

describe('category and search filters', () => {
  const cs = [
    testCourse({ slug: 'a', title: 'ชีวะ สอวน. ค่าย 1', tagline: 'ตะลุยโจทย์', group: 'mplai', category: 'สอวน.' }),
    testCourse({ slug: 'b', title: 'ปรับพื้นฐาน ม.4', tagline: 'ปูพื้นฐาน', group: 'mplai', category: 'ปรับพื้นฐาน' }),
    testCourse({ slug: 'c', title: 'ชีวะ ม.2', tagline: 'เตรียมสอบ', group: 'mton', category: 'แข่งขันวิชาการ' }),
  ]
  const cat = createCatalog(testContent({ courses: cs }))
  const slugs = (f: Parameters<typeof cat.courseList>[0]) => cat.courseList(f).cards.map((c) => c.slug)

  it('filters by category', () => {
    expect(slugs({ group: 'mplai', category: 'ปรับพื้นฐาน' })).toEqual(['b'])
    expect(slugs({ group: 'mplai', category: 'สอวน.' })).toEqual(['a'])
    expect(slugs({ category: 'แข่งขันวิชาการ' })).toEqual(['c'])
  })

  it('computes the category options from the data of the chosen group, in sheet order', () => {
    expect(cat.courseList({ group: 'mplai' }).categoryOptions).toEqual(['สอวน.', 'ปรับพื้นฐาน'])
    expect(cat.courseList({ group: 'mton' }).categoryOptions).toEqual(['แข่งขันวิชาการ'])
    expect(cat.courseList({}).categoryOptions).toEqual(['สอวน.', 'ปรับพื้นฐาน', 'แข่งขันวิชาการ'])
  })

  it('searches title, tagline and category, ignoring case; every word must match', () => {
    expect(slugs({ q: 'ค่าย' })).toEqual(['a'])
    expect(slugs({ q: 'ปูพื้นฐาน' })).toEqual(['b'])
    expect(slugs({ q: 'ปรับพื้นฐาน' })).toEqual(['b'])
    expect(slugs({ q: 'สอวน' })).toEqual(['a'])
    expect(slugs({ q: 'ชีวะ แข่งขัน' })).toEqual(['c'])
    expect(slugs({ q: 'ชีวะ ปรับพื้นฐาน' })).toEqual([])
    expect(slugs({ q: '   ' })).toEqual(['a', 'b', 'c'])
  })

  it('also searches the subject and the chapter titles', () => {
    const withChapter = createCatalog(
      testContent({
        courses: [
          testCourse({ slug: 'g', subject: 'biology', chapters: [{ title: 'พันธุศาสตร์' }] }),
          testCourse({ slug: 'h', subject: 'chemistry' }),
        ],
      }),
    )
    const found = (q: string) => withChapter.courseList({ q }).cards.map((c) => c.slug)

    expect(found('พันธุศาสตร์')).toEqual(['g'])
    expect(found('เคมี')).toEqual(['h'])
  })

  it('combines group, category and search', () => {
    expect(slugs({ group: 'mton', q: 'ชีวะ' })).toEqual(['c'])
    expect(slugs({ group: 'mplai', category: 'สอวน.', q: 'ชีวะ' })).toEqual(['a'])
  })

  it('flags an empty result so the page can offer to ask the admin', () => {
    expect(cat.courseList({ q: 'ไม่มีแน่นอน' })).toMatchObject({ cards: [], empty: true, resultText: 'พบ 0 คอร์ส' })
    expect(cat.courseList({}).empty).toBe(false)
  })

  it('knows whether any filter is on, and where "clear all" goes', () => {
    expect(cat.courseList({})).not.toHaveProperty('clearHref')
    expect(cat.courseList({ q: 'x' }).clearHref).toBe('/courses')
    expect(cat.courseList({ group: 'mton' }).clearHref).toBe('/courses')
  })

  it('keeps the search but drops the category on the group tabs, so changing group clears the category', () => {
    expect(cat.courseList({ group: 'mplai', category: 'สอวน.', q: 'x' }).tabs.map((t) => t.href)).toEqual([
      '/courses?q=x',
      '/courses?group=prathom&q=x',
      '/courses?group=mton&q=x',
      '/courses?group=mplai&q=x',
    ])
  })
})

describe('category and search in the URL', () => {
  it.each([
    {},
    { group: 'mplai' as const, category: 'สอวน.' },
    { category: 'แข่งขันวิชาการ', q: 'ชีวะ ม.4' },
    { group: 'mton' as const, category: 'x y', q: 'a&b=c' },
  ])('turns %o into a query and back unchanged', (filters) => {
    expect(parseFilters(new URLSearchParams(filtersToQuery(filters)))).toEqual(filters)
  })

  it('drops empty or blank values and trims the search', () => {
    expect(parseFilters(new URLSearchParams('category=&q=%20%20'))).toEqual({})
    expect(parseFilters(new URLSearchParams('q=%20ชีวะ%20'))).toEqual({ q: 'ชีวะ' })
  })
})

describe('goal cards', () => {
  it('link to the list filtered by the group and category of the card', () => {
    const site = testSite({
      goalCards: [{ title: 't', desc: 'd', filter: { group: 'mton', category: 'สอบเข้า ม.4' } }],
    })

    expect(createCatalog(testContent({ site })).coursesPage().goals[0]?.href).toBe('/courses?group=mton&category=%E0%B8%AA%E0%B8%AD%E0%B8%9A%E0%B9%80%E0%B8%82%E0%B9%89%E0%B8%B2+%E0%B8%A1.4')
  })
})

// ตัวเลขของ content/ จริงวันนี้ · ถ้าชีตเพิ่มหรือลบคอร์ส ให้แก้ตัวเลขในเทสต์นี้ตาม (เทสต์นี้ไม่ได้รันก่อน build)
describe('courseList() on the real content', () => {
  it('counts 44 courses in all, 8 in ประถม, 12 in ม.ต้น and 24 in ม.ปลาย', () => {
    expect(realCatalog.courseList({}).tabs.map((t) => [t.label, t.count])).toEqual([
      ['ทุกระดับชั้น', '44 คอร์ส'],
      ['ประถม', '8 คอร์ส'],
      ['มัธยมต้น', '12 คอร์ส'],
      ['มัธยมปลาย', '24 คอร์ส'],
    ])
  })
})

describe('coursesPage()', () => {
  it('turns each goal card in site.json into a link to the list filtered by its group, category or search', () => {
    const site = testSite({
      goalCards: [
        { title: 'อยู่ ม.ต้น อยากสอบเข้า ม.4', desc: 'ปรับพื้นฐานวิทย์', filter: { group: 'mton', category: 'สอบเข้า ม.4' } },
        { title: 'จะลงสนามแข่ง', desc: 'สอวน. สวช.', filter: { q: 'แข่งขันวิชาการ' } },
      ],
    })

    expect(createCatalog(testContent({ site })).coursesPage().goals).toEqual([
      { title: 'อยู่ ม.ต้น อยากสอบเข้า ม.4', desc: 'ปรับพื้นฐานวิทย์', href: listHref({ group: 'mton', category: 'สอบเข้า ม.4' }) },
      { title: 'จะลงสนามแข่ง', desc: 'สอวน. สวช.', href: listHref({ q: 'แข่งขันวิชาการ' }) },
    ])
  })

  it('has no reviews while reviews.json is empty, so the page hides that part', () => {
    expect(createCatalog(testContent({ reviews: [] })).coursesPage().reviews).toEqual([])
  })

  it('shows each review with who wrote it once reviews.json has some', () => {
    const reviews = [{ id: 'r1', quote: 'คุ้มมากครับ', studentName: 'น้องเจได', grade: 'ม.4' }]

    expect(createCatalog(testContent({ reviews })).coursesPage().reviews).toEqual([{ quote: 'คุ้มมากครับ', by: 'น้องเจได · ม.4', name: 'น้องเจได' }])
  })

  it('shows the course-list FAQ from site.json, and the office hours only when site.json has them', () => {
    const faqs = [{ q: 'เรียนข้ามชั้นได้ไหม', a: 'ได้' }]
    const page = (hours: string) => createCatalog(testContent({ site: testSite({ coursesFaqs: faqs, contact: { ...testSite().contact, hours } }) })).coursesPage()

    expect(page('').faqs).toEqual(faqs)
    expect(page('')).not.toHaveProperty('hours')
    expect(page('จันทร์–เสาร์ 10:00–19:00 น.').hours).toBe('จันทร์–เสาร์ 10:00–19:00 น.')
  })
})

describe('course card eyebrow', () => {
  const cardOf = (over: Parameters<typeof testCourse>[0]) => createCatalog(testContent({ courses: [testCourse(over)] })).courseList({}).cards[0]

  it('reads group · subject · category', () => {
    expect(cardOf({ group: 'mplai', subject: 'biology', category: 'สอวน.' })?.eyebrow).toBe('ม.ปลาย · ชีววิทยา · สอวน.')
  })

  it('does not repeat a category that has the same name as the group', () => {
    expect(cardOf({ group: 'prathom', subject: 'science', category: 'ประถม' })?.eyebrow).toBe('ประถม · วิทยาศาสตร์')
  })
})
