import { describe, expect, it } from 'vitest'
import type { Course, CourseSet } from '@content/types'
import { createCatalog } from './catalog'
import { testContent, testCourse, testSet, testSite } from './test-content'

function detailOf(set: CourseSet, courses: Course[]) {
  return createCatalog(testContent({ courses, sets: [set] })).setDetail(set.slug)
}

describe('setDetail()', () => {
  it('returns nothing for a slug that does not exist', () => {
    expect(createCatalog(testContent({ sets: [testSet()] })).setDetail('no-such-bundle')).toBeUndefined()
  })

  it('shows the title, tagline, group and set code', () => {
    const detail = detailOf(
      testSet({ code: 'NAT-01', slug: 'nat-senior-bundle', title: 'รวม สวช. ม.ปลาย', tagline: 'ครบ 3 วิชา', group: 'mplai' }),
      [],
    )

    expect(detail).toMatchObject({
      slug: 'nat-senior-bundle',
      codeLabel: 'เซ็ต NAT-01',
      title: 'รวม สวช. ม.ปลาย',
      tagline: 'ครบ 3 วิชา',
      group: { label: 'ม.ปลาย', href: '/courses?group=mplai' },
    })
  })

  it('uses a palette colour box for the cover while the set has no cover image', () => {
    expect(detailOf(testSet({ group: 'mplai' }), [])?.cover).toEqual({ tone: 'ink' })
  })

  it('builds the lifetime badge from the label in site.json', () => {
    expect(detailOf(testSet(), [])?.lifetime).toBe('ดูได้ไม่จำกัดอายุ')
  })

  it('shows a coming-soon badge only for a set that is not open yet', () => {
    expect(detailOf(testSet({ status: 'open' }), [])).not.toHaveProperty('statusLabel')
    expect(detailOf(testSet({ status: 'coming_soon' }), [])?.statusLabel).toBe('เร็ว ๆ นี้')
  })

  it('shows the FAQ from site.json', () => {
    const faqs = [{ q: 'ซื้อเป็นเซ็ตต่างจากรายคอร์สอย่างไร', a: 'ถูกกว่า' }]
    const detail = createCatalog(testContent({ sets: [testSet()], site: testSite({ faqs }) })).setDetail('primary-p4-bundle')

    expect(detail?.faqs).toEqual(faqs)
  })

  it('tells the contact buttons it is a set, not a single course', () => {
    const detail = detailOf(testSet({ slug: 'nat-senior-bundle', title: 'รวม สวช. ม.ปลาย' }), [])

    expect(detail?.contactItem).toEqual({ kind: 'set', slug: 'nat-senior-bundle', title: 'รวม สวช. ม.ปลาย' })
  })

  // เกณฑ์ใน testSite ตรงกับ site.json จริง: ประหยัด ≥ 10% หรือ ≥ 100 บาท
  describe('savings badge', () => {
    /** เซ็ตของคอร์สสองตัวราคา each บาท ขายรวม setPrice บาท */
    function pairAt(each: number, setPrice: number) {
      const a = testCourse({ slug: 'course-a', price: each })
      const b = testCourse({ slug: 'course-b', price: each })
      return detailOf(testSet({ price: setPrice, courseSlugs: ['course-a', 'course-b'] }), [a, b])
    }

    it('shows the regular price and savings when the set saves at least 10%', () => {
      const detail = pairAt(200, 350)

      expect(detail?.price).toBe('350.-')
      expect(detail?.savings).toEqual({ regularPrice: '400.-', amount: '50.-', percent: '12%' })
    })

    it('shows the savings when the set saves at least 100 baht, even under 10%', () => {
      expect(pairAt(1000, 1880)?.savings).toEqual({ regularPrice: '2,000.-', amount: '120.-', percent: '6%' })
    })

    it('shows one set price with nothing crossed out when the set saves too little', () => {
      const detail = pairAt(449, 888)

      expect(detail?.price).toBe('888.-')
      expect(detail?.savings).toBeUndefined()
    })

    it('shows the savings at exactly 10%', () => {
      expect(pairAt(450, 810)?.savings).toEqual({ regularPrice: '900.-', amount: '90.-', percent: '10%' })
    })

    it('shows the savings at exactly 100 baht', () => {
      expect(pairAt(1500, 2900)?.savings).toEqual({ regularPrice: '3,000.-', amount: '100.-', percent: '3%' })
    })

    it('hides the savings just under both thresholds: 99 baht and 9.9%', () => {
      expect(pairAt(500, 901)?.savings).toBeUndefined()
    })

    it('hides the savings when the set costs more than buying the courses separately', () => {
      expect(pairAt(300, 700)?.savings).toBeUndefined()
    })
  })

  describe('subjects', () => {
    it('names every subject in a set that mixes subjects, in course order', () => {
      const courses = [
        testCourse({ slug: 'nat-senior-biology', subject: 'biology' }),
        testCourse({ slug: 'nat-senior-chemistry', subject: 'chemistry' }),
        testCourse({ slug: 'nat-senior-physics', subject: 'physics' }),
      ]
      const set = testSet({ courseSlugs: ['nat-senior-biology', 'nat-senior-chemistry', 'nat-senior-physics'] })

      expect(detailOf(set, courses)?.subjects).toEqual(['ชีววิทยา', 'เคมี', 'ฟิสิกส์'])
      expect(detailOf(set, courses)?.subjectsHeading).toBe('ครบ 3 วิชา')
    })

    it('heads a single-subject set plainly', () => {
      const courses = [testCourse({ slug: 'course-a', subject: 'biology' })]

      expect(detailOf(testSet({ courseSlugs: ['course-a'] }), courses)?.subjectsHeading).toBe('วิชา')
    })

    it('names a shared subject once', () => {
      const courses = [
        testCourse({ slug: 'course-a', subject: 'science' }),
        testCourse({ slug: 'course-b', subject: 'biology' }),
        testCourse({ slug: 'course-c', subject: 'science' }),
      ]
      const set = testSet({ courseSlugs: ['course-a', 'course-b', 'course-c'] })

      expect(detailOf(set, courses)?.subjects).toEqual(['วิทยาศาสตร์', 'ชีววิทยา'])
    })
  })

  describe('course cards', () => {
    it('lists the courses in the order the set gives, each with its own price and a link to its page', () => {
      const courses = [
        testCourse({ slug: 'posn-biology-66', title: 'สอวน. ชีวะ ปี 66', tagline: 'ข้อสอบจริง', price: 699, group: 'mplai', category: 'สอวน.' }),
        testCourse({ slug: 'posn-biology-67', title: 'สอวน. ชีวะ ปี 67', tagline: 'ข้อสอบจริง', price: 1290, group: 'mplai', category: 'สอวน.' }),
      ]
      const set = testSet({ courseSlugs: ['posn-biology-67', 'posn-biology-66'] })

      expect(detailOf(set, courses)?.courses).toMatchObject([
        { href: '/courses/posn-biology-67', title: 'สอวน. ชีวะ ปี 67', tagline: 'ข้อสอบจริง', label: 'ม.ปลาย · สอวน.', price: '1,290.-' },
        { href: '/courses/posn-biology-66', title: 'สอวน. ชีวะ ปี 66', price: '699.-' },
      ])
    })

    it('sums up what each course has in one line, leaving out what it lacks', () => {
      const courses = [
        testCourse({ slug: 'course-a', stats: { questionCount: 150, videoHours: 6 } }),
        testCourse({ slug: 'course-b', stats: {} }),
      ]
      const cards = detailOf(testSet({ courseSlugs: ['course-a', 'course-b'] }), courses)?.courses

      expect(cards?.[0]?.facts).toBe('VDO 6 ชม. · 150 ข้อ')
      expect(cards?.[1]).not.toHaveProperty('facts')
    })

    it('marks a course that is not open yet', () => {
      const courses = [testCourse({ slug: 'course-a', status: 'coming_soon' })]

      expect(detailOf(testSet({ courseSlugs: ['course-a'] }), courses)?.courses[0]?.statusLabel).toBe('เร็ว ๆ นี้')
    })
  })

  describe('totals', () => {
    function setOf(...stats: Course['stats'][]) {
      const courses = stats.map((s, i) => testCourse({ slug: `course-${i}`, stats: s }))
      return detailOf(testSet({ courseSlugs: courses.map((c) => c.slug) }), courses)
    }

    it('counts the courses in the set', () => {
      expect(setOf({}, {}, {})?.courseCount).toBe('3 คอร์ส')
    })

    it('adds up questions, PDF pages and video hours, skipping courses without a value', () => {
      const detail = setOf({ questionCount: 100, pdfPages: 80, videoHours: 5 }, { questionCount: 50, videoHours: 3 }, {})

      expect(detail?.stats).toEqual([
        { value: '8 ชม.', label: 'วิดีโอ' },
        { value: '80 หน้า', label: 'ไฟล์ PDF' },
        { value: '150 ข้อ', label: 'ข้อสอบ' },
      ])
    })

    it('adds PDF page ranges as a range', () => {
      expect(setOf({ pdfPages: 80 }, { pdfPages: { min: 30, max: 70 } })?.stats).toEqual([
        { value: '110-150 หน้า', label: 'ไฟล์ PDF' },
      ])
    })

    it('never shows a made-up zero when no course in the set has a value', () => {
      expect(setOf({}, { questionCount: 0, videoHours: 0, pdfPages: 0 })?.stats).toEqual([])
    })
  })
})
