import { describe, expect, it } from 'vitest'
import type { Course, CourseSet, Instructor } from '@content/types'
import { createCatalog } from './catalog'
import { testContent, testCourse, testSet, testSite } from './test-content'

function detailOf(set: CourseSet, courses: Course[], over: Parameters<typeof testContent>[0] = {}) {
  return createCatalog(testContent({ courses, sets: [set], ...over })).setDetail(set.slug)
}

describe('setDetail()', () => {
  it('returns nothing for a slug that does not exist', () => {
    expect(createCatalog(testContent({ sets: [testSet()] })).setDetail('no-such-bundle')).toBeUndefined()
  })

  it('shows the title, tagline and group', () => {
    const detail = detailOf(testSet({ slug: 'nat-senior-bundle', title: 'รวม สวช. ม.ปลาย', tagline: 'ครบ 3 วิชา', group: 'mplai' }), [])

    expect(detail).toMatchObject({
      slug: 'nat-senior-bundle',
      title: 'รวม สวช. ม.ปลาย',
      tagline: 'ครบ 3 วิชา',
      group: { label: 'ม.ปลาย', href: '/courses?group=mplai' },
    })
  })

  it('labels the group with every category of its courses, the group name once', () => {
    const courses = [
      testCourse({ slug: 'a', group: 'mplai', category: 'ปรับพื้นฐาน' }),
      testCourse({ slug: 'b', group: 'mplai', category: 'A-Level' }),
      testCourse({ slug: 'c', group: 'mplai', category: 'ม.ปลาย' }),
    ]

    expect(detailOf(testSet({ group: 'mplai', courseSlugs: ['a', 'b', 'c'] }), courses)?.categoriesLabel).toBe('ม.ปลาย · ปรับพื้นฐาน · A-Level')
  })

  it('uses a palette colour box for the cover while the set has no cover image', () => {
    expect(detailOf(testSet({ group: 'mplai' }), [])?.cover).toEqual({ tone: 'ink' })
  })

  it('builds the lifetime line from the label in site.json', () => {
    expect(detailOf(testSet(), [])?.lifetime).toBe('ดูได้ไม่จำกัดอายุ')
  })

  it('tells the contact buttons it is a set, not a single course', () => {
    const detail = detailOf(testSet({ slug: 'nat-senior-bundle', title: 'รวม สวช. ม.ปลาย' }), [])

    expect(detail?.contactItem).toEqual({ kind: 'set', slug: 'nat-senior-bundle', title: 'รวม สวช. ม.ปลาย' })
  })

  describe('price', () => {
    /** SET ของคอร์สสองตัวราคา each บาท ขายรวม setPrice บาท */
    function pairAt(each: number, setPrice: number) {
      const a = testCourse({ slug: 'course-a', title: 'คอร์ส A', price: each })
      const b = testCourse({ slug: 'course-b', title: 'คอร์ส B', price: each })
      return detailOf(testSet({ price: setPrice, courseSlugs: ['course-a', 'course-b'] }), [a, b])
    }

    it('shows the regular price and the saving, rounded down', () => {
      const detail = pairAt(200, 350)

      expect(detail?.price).toBe('350.-')
      expect(detail?.savings).toEqual({ regularPrice: '400.-', amount: '50.-', percent: '12%' })
    })

    it('shows even a small saving', () => {
      expect(pairAt(449, 888)?.savings).toEqual({ regularPrice: '898.-', amount: '10.-', percent: '1%' })
    })

    it('hides the saving when the set costs more than buying the courses separately', () => {
      expect(pairAt(300, 700)).not.toHaveProperty('savings')
    })

    it('breaks the regular price down course by course, in set order', () => {
      expect(pairAt(1200, 2000)?.breakdown).toEqual([
        { title: 'คอร์ส A', price: '1,200.-' },
        { title: 'คอร์ส B', price: '1,200.-' },
      ])
    })
  })

  describe('courses', () => {
    it('lists the courses in the order the set gives, each with its own price and a link to its page', () => {
      const courses = [
        testCourse({ slug: 'posn-biology-66', title: 'สอวน. ชีวะ ปี 66', price: 699 }),
        testCourse({ slug: 'posn-biology-67', title: 'สอวน. ชีวะ ปี 67', tagline: 'ข้อสอบจริง', price: 1290, subject: 'biology' }),
      ]
      const set = testSet({ courseSlugs: ['posn-biology-67', 'posn-biology-66'] })

      expect(detailOf(set, courses)?.courses).toMatchObject([
        { href: '/courses/posn-biology-67', title: 'สอวน. ชีวะ ปี 67', tagline: 'ข้อสอบจริง', subject: 'ชีววิทยา', teacher: 'ครูพี่หนาม', price: '1,290.-' },
        { href: '/courses/posn-biology-66', title: 'สอวน. ชีวะ ปี 66', price: '699.-' },
      ])
    })

    it('sums up what each course has in one line, leaving out what it lacks', () => {
      const courses = [testCourse({ slug: 'course-a', stats: { questionCount: 150, videoHours: 6 } }), testCourse({ slug: 'course-b', stats: {} })]
      const cards = detailOf(testSet({ courseSlugs: ['course-a', 'course-b'] }), courses)?.courses

      expect(cards?.[0]?.facts).toBe('VDO 6 ชม. · 150 ข้อ')
      expect(cards?.[1]).not.toHaveProperty('facts')
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

    it('shows the course count, the totals of every course and the unlimited access on top', () => {
      const detail = setOf({ questionCount: 100, pdfPages: 80, videoHours: 5 }, { questionCount: 50, videoHours: 3 }, {})

      expect(detail?.stats).toEqual([
        { value: '3', label: 'คอร์สในชุด' },
        { value: '8 ชม.', label: 'วิดีโอรวม' },
        { value: '80 หน้า', label: 'ไฟล์ PDF' },
        { value: '150 ข้อ', label: 'โจทย์พร้อมเฉลย' },
        { value: 'ไม่จำกัด', label: 'อายุคอร์ส' },
      ])
    })

    it('adds PDF page ranges as a range', () => {
      expect(setOf({ pdfPages: 80 }, { pdfPages: { min: 30, max: 70 } })?.stats[1]).toEqual({ value: '110-150 หน้า', label: 'ไฟล์ PDF' })
    })

    it('never shows a made-up zero when no course in the set has a value', () => {
      expect(setOf({}, { questionCount: 0, videoHours: 0, pdfPages: 0 })?.stats.map((s) => s.label)).toEqual(['คอร์สในชุด', 'อายุคอร์ส'])
    })

    it('turns the same totals into the "what you get" cards, always ending with unlimited access', () => {
      expect(setOf({ questionCount: 100, pdfPages: 80, videoHours: 5 })?.gets.map((g) => [g.value, g.label])).toEqual([
        ['80 หน้า', 'ไฟล์ PDF'],
        ['5 ชม.', 'คลิปวิดีโอ'],
        ['100 ข้อ', 'โจทย์พร้อมเฉลย'],
        ['ไม่จำกัด', 'ระยะเวลาเข้าเรียน'],
      ])
      expect(setOf({})?.gets.map((g) => g.label)).toEqual(['ระยะเวลาเข้าเรียน'])
    })
  })

  it('collects who the set is for from its courses, once each, at most 4', () => {
    const courses = [
      testCourse({ slug: 'a', forWho: ['ม.4', 'สายแข่ง'] }),
      testCourse({ slug: 'b', forWho: ['สายแข่ง', 'ม.5', ' '] }),
      testCourse({ slug: 'c', forWho: ['ม.6', 'ครูผู้ช่วย'] }),
    ]

    expect(detailOf(testSet({ courseSlugs: ['a', 'b', 'c'] }), courses)?.forWho).toEqual(['ม.4', 'สายแข่ง', 'ม.5', 'ม.6'])
    expect(detailOf(testSet({ courseSlugs: [] }), [])).not.toHaveProperty('forWho')
  })

  describe('teachers', () => {
    const nam: Instructor = { slug: 'kru-nam', name: 'ครูพี่หนาม', role: '', shortBio: 'ติวเตอร์ชีววิทยา', longBio: '', tags: [], photoAvatar: '/kru-nam.png' }
    const fon: Instructor = { slug: 'kru-fon', name: 'ครูพี่ฝน', role: '', shortBio: '', longBio: '', tags: [] }
    const site = testSite({ instructors: [nam, fon] })

    it('names every teacher once, in course order, with the subjects each teaches in this set', () => {
      const courses = [
        testCourse({ slug: 'bio', subject: 'biology', instructorSlug: 'kru-nam' }),
        testCourse({ slug: 'chem', subject: 'chemistry', instructorSlug: 'kru-fon' }),
        testCourse({ slug: 'sci', subject: 'science', instructorSlug: 'kru-nam' }),
      ]
      const detail = detailOf(testSet({ courseSlugs: ['bio', 'chem', 'sci'] }), courses, { site })

      expect(detail?.teachersHeading).toBe('ทีมครูผู้สอน')
      expect(detail?.teachers).toEqual([
        { name: 'ครูพี่หนาม', role: 'สอนชีววิทยา · วิทยาศาสตร์', bio: 'ติวเตอร์ชีววิทยา', photo: '/kru-nam.png' },
        { name: 'ครูพี่ฝน', role: 'สอนเคมี' },
      ])
    })

    it('says "ครูผู้สอน" for a single teacher', () => {
      const courses = [testCourse({ slug: 'bio', instructorSlug: 'kru-nam' })]

      expect(detailOf(testSet({ courseSlugs: ['bio'] }), courses, { site })?.teachersHeading).toBe('ครูผู้สอน')
    })
  })

  it('collects the reviews of its courses', () => {
    const courses = [testCourse({ slug: 'a' }), testCourse({ slug: 'b' })]
    const reviews = [
      { id: 'r1', quote: 'ดีมาก', studentName: 'น้องมายด์', grade: 'ม.5', courseSlug: 'b' },
      { id: 'r2', quote: 'คอร์สอื่น', studentName: 'น้องปูน', grade: 'ม.6', courseSlug: 'z' },
      { id: 'r3', quote: 'ไม่ผูกคอร์ส', studentName: 'น้องกัน', grade: 'ม.6' },
    ]

    expect(detailOf(testSet({ courseSlugs: ['a', 'b'] }), courses, { reviews })?.reviews).toEqual([{ quote: 'ดีมาก', by: 'น้องมายด์ · ม.5', name: 'น้องมายด์' }])
  })

  it('borrows the sample clip of its first course that has one', () => {
    const courses = [testCourse({ slug: 'a' }), testCourse({ slug: 'b', previewVideoUrl: 'https://youtu.be/QnQe0xW_JY4' })]

    expect(detailOf(testSet({ courseSlugs: ['a', 'b'] }), courses)?.preview).toEqual({ embedUrl: 'https://www.youtube-nocookie.com/embed/QnQe0xW_JY4' })
    expect(detailOf(testSet({ courseSlugs: ['a'] }), courses)).not.toHaveProperty('preview')
  })
})
