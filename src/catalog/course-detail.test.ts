import { describe, expect, it } from 'vitest'
import type { Course, CourseSet, Instructor } from '@content/types'
import { createCatalog } from './catalog'
import { testContent, testCourse, testSet, testSite } from './test-content'

const kruNam: Instructor = {
  slug: 'kru-nam',
  name: 'ครูพี่หนาม',
  role: 'ผู้สอนคอร์สนี้',
  shortBio: 'ติวเตอร์ชีววิทยา',
  longBio: 'ประวัติยาว',
  tags: [],
  photoAvatar: '/kru-nam-hero.png',
}
const kruFon: Instructor = {
  slug: 'kru-fon',
  name: 'ครูพี่ฝน',
  role: 'ผู้สอนคอร์สนี้',
  shortBio: 'ผู้สอนคอร์ส สวช. ม.ปลาย เคมี',
  longBio: '',
  tags: [],
}

function detailOf(course: Course) {
  const site = testSite({ instructors: [kruNam, kruFon] })
  return createCatalog(testContent({ courses: [course], site })).courseDetail(course.slug)
}

describe('courseDetail()', () => {
  it('returns nothing for a slug that does not exist', () => {
    expect(createCatalog(testContent({ courses: [testCourse()] })).courseDetail('no-such-course')).toBeUndefined()
  })

  it('shows the title, tagline, group and category', () => {
    const detail = detailOf(testCourse({ title: 'สอวน. ชีวะ', tagline: 'เฉลยละเอียด', group: 'mplai', category: 'สอวน.' }))

    expect(detail).toMatchObject({
      title: 'สอวน. ชีวะ',
      tagline: 'เฉลยละเอียด',
      group: { label: 'ม.ปลาย', href: '/courses?group=mplai' },
      category: 'สอวน.',
    })
  })

  it('labels the badge with the group and category', () => {
    expect(detailOf(testCourse({ group: 'mplai', category: 'สอวน.' }))?.badge).toBe('ม.ปลาย · สอวน.')
  })

  it('labels the badge with the group once when the category has the same name', () => {
    expect(detailOf(testCourse({ group: 'prathom', category: 'ประถม' }))?.badge).toBe('ประถม')
  })

  it('prefers the full title when the sheet has one', () => {
    expect(detailOf(testCourse({ title: 'สั้น', fullTitle: 'ชื่อเต็มของคอร์ส' }))?.title).toBe('ชื่อเต็มของคอร์ส')
  })

  it('shows one price with thousands separators and no crossed-out price', () => {
    const detail = detailOf(testCourse({ price: 1290, compareAtPrice: 1990 }))

    expect(detail?.price).toBe('1,290.-')
    expect(detail).not.toHaveProperty('compareAtPrice')
  })

  describe('stats row', () => {
    it('shows video hours, PDF pages and questions in that order when all exist', () => {
      const detail = detailOf(testCourse({ stats: { questionCount: 100, pdfPages: 86, videoHours: 10 } }))

      expect(detail?.stats).toEqual([
        { value: '10 ชม.', label: 'วิดีโอ' },
        { value: '86 หน้า', label: 'ไฟล์ PDF' },
        { value: '100 ข้อ', label: 'ข้อสอบ' },
      ])
    })

    it('leaves out questions when the course has no question count', () => {
      const detail = detailOf(testCourse({ stats: { pdfPages: 85, videoHours: 5 } }))

      expect(detail?.stats.map((s) => s.label)).toEqual(['วิดีโอ', 'ไฟล์ PDF'])
    })

    it('shows a PDF page range as a range', () => {
      const detail = detailOf(testCourse({ stats: { pdfPages: { min: 30, max: 70 } } }))

      expect(detail?.stats).toEqual([{ value: '30-70 หน้า', label: 'ไฟล์ PDF' }])
    })

    it('never shows a zero, such as "0 ชม."', () => {
      const detail = detailOf(testCourse({ stats: { questionCount: 0, pdfPages: 0, videoHours: 0 } }))

      expect(detail?.stats).toEqual([])
    })

    it('keeps decimal video hours', () => {
      expect(detailOf(testCourse({ stats: { videoHours: 2.5 } }))?.stats).toEqual([{ value: '2.5 ชม.', label: 'วิดีโอ' }])
    })
  })

  describe('sections without data are hidden', () => {
    it('hides the whole content section when the course has no content points and no chapters', () => {
      expect(detailOf(testCourse({ contentPoints: [], chapters: [] }))?.content).toBeUndefined()
    })

    it('shows content points without a chapter list when the course has no chapters', () => {
      expect(detailOf(testCourse({ contentPoints: ['ตะลุยโจทย์'], chapters: [] }))?.content).toEqual({
        points: ['ตะลุยโจทย์'],
      })
    })

    it('numbers the chapters in order and counts them', () => {
      const detail = detailOf(testCourse({ contentPoints: [], chapters: [{ title: 'เซลล์' }, { title: 'พันธุศาสตร์' }] }))

      expect(detail?.content).toEqual({
        chapterCount: '2 บท',
        chapters: ['บทที่ 1 · เซลล์', 'บทที่ 2 · พันธุศาสตร์'],
      })
    })

    it('hides who the course is for when it is empty', () => {
      expect(detailOf(testCourse({ forWho: [] }))?.forWho).toBeUndefined()
    })

    it('ignores blank entries in lists and a blank deliverables line', () => {
      const detail = detailOf(
        testCourse({ forWho: ['ม.ปลาย', '  '], contentPoints: [''], chapters: [{ title: ' ' }], deliverables: ' ' }),
      )

      expect(detail?.forWho).toEqual(['ม.ปลาย'])
      expect(detail?.content).toBeUndefined()
      expect(detail?.deliverables).toBeUndefined()
    })

    it('shows what the buyer gets', () => {
      expect(detailOf(testCourse({ deliverables: 'ไฟล์ PDF + คลิปวิดีโอ' }))?.deliverables).toBe('ไฟล์ PDF + คลิปวิดีโอ')
    })
  })

  describe('instructor', () => {
    it('shows the instructor who teaches the course, with a photo when there is one', () => {
      expect(detailOf(testCourse({ instructorSlug: 'kru-nam' }))?.instructor).toEqual({
        name: 'ครูพี่หนาม',
        role: 'ผู้สอนคอร์สนี้',
        bio: 'ติวเตอร์ชีววิทยา',
        photo: '/kru-nam-hero.png',
      })
    })

    it('shows only the name and short bio when the instructor has no photo', () => {
      expect(detailOf(testCourse({ instructorSlug: 'kru-fon' }))?.instructor).toEqual({
        name: 'ครูพี่ฝน',
        role: 'ผู้สอนคอร์สนี้',
        bio: 'ผู้สอนคอร์ส สวช. ม.ปลาย เคมี',
      })
    })
  })

  it('shows no status badge for a course that is open as usual', () => {
    expect(detailOf(testCourse({ status: 'open' }))?.statusLabel).toBeUndefined()
  })

  it('shows a coming-soon badge, with the opening date when there is one', () => {
    expect(detailOf(testCourse({ status: 'coming_soon' }))?.statusLabel).toBe('เร็ว ๆ นี้')
    expect(detailOf(testCourse({ status: 'coming_soon', openDate: '1 พ.ย. 2569' }))?.statusLabel).toBe(
      'เร็ว ๆ นี้ · เปิด 1 พ.ย. 2569',
    )
  })

  it('builds the lifetime badge from the label in site.json', () => {
    expect(detailOf(testCourse())?.lifetime).toBe('ดูได้ไม่จำกัดอายุ')
  })

  describe('cover', () => {
    it('uses a palette colour box, one tone per group, while the course has no cover image', () => {
      expect(detailOf(testCourse({ group: 'prathom' }))?.cover).toEqual({ tone: 'sky' })
      expect(detailOf(testCourse({ group: 'mton' }))?.cover).toEqual({ tone: 'wash' })
      expect(detailOf(testCourse({ group: 'mplai' }))?.cover).toEqual({ tone: 'ink' })
    })

    it('uses the cover image once the course has one', () => {
      expect(detailOf(testCourse({ group: 'mplai', coverImage: '/courses/x.jpg' }))?.cover).toEqual({
        tone: 'ink',
        image: '/courses/x.jpg',
      })
    })
  })

  it('names the course for the contact buttons', () => {
    expect(detailOf(testCourse({ slug: 'primary-science-p4', title: 'เนื้อหาประถม ป.4' }))?.contactItem).toEqual({
      kind: 'course',
      slug: 'primary-science-p4',
      title: 'เนื้อหาประถม ป.4',
    })
  })

  it('shows the FAQ from site.json after any questions specific to the course', () => {
    const site = testSite({ faqs: [{ q: 'ดูได้นานแค่ไหน', a: 'ตลอดชีพ' }] })
    const course = testCourse({ faqs: [{ q: 'ต้องปูพื้นก่อนไหม', a: 'แนะนำให้ปูพื้น' }] })
    const detail = createCatalog(testContent({ courses: [course], site })).courseDetail(course.slug)

    expect(detail?.faqs.map((f) => f.q)).toEqual(['ต้องปูพื้นก่อนไหม', 'ดูได้นานแค่ไหน'])
  })

  it('lists every course slug for building the pages ahead of time', () => {
    const courses = [testCourse({ slug: 'a-course' }), testCourse({ slug: 'b-course' })]

    expect(createCatalog(testContent({ courses })).courseSlugs()).toEqual(['a-course', 'b-course'])
  })

  describe('sets that include the course', () => {
    const course = testCourse({ slug: 'primary-exercise-p4', price: 299 })

    /** เซ็ตที่มีคอร์สนี้ ขายรวม setPrice บาท · คอร์สอื่นในเซ็ตราคา 500 */
    function setWith(slug: string, setPrice: number, overrides: Partial<CourseSet> = {}): CourseSet {
      return testSet({ code: slug.toUpperCase(), slug, price: setPrice, courseSlugs: ['primary-exercise-p4', 'other-course'], ...overrides })
    }

    function setsOf(sets: CourseSet[], subject: Course = course) {
      const other = testCourse({ slug: 'other-course', price: 500 })
      return createCatalog(testContent({ courses: [subject, other], sets })).courseDetail(subject.slug)?.sets
    }

    it('shows no set box for a course that is in no set', () => {
      expect(setsOf([])).toBeUndefined()
    })

    it('shows no set box for a course sold on its own only, even if a set lists it by mistake', () => {
      // validateContent() กันกรณีนี้ตอน build อยู่แล้ว แต่หน้าคอร์สไม่ควรโฆษณาเซ็ตให้คอร์สที่ขายเดี่ยวเท่านั้น
      const standalone = testCourse({ slug: 'primary-exercise-p4', saleMode: 'standalone_only' })

      expect(setsOf([setWith('some-bundle', 499)], standalone)).toBeUndefined()
    })

    it('lists the sets from the biggest saving to the smallest, each linking to its set page', () => {
      // ราคาปกติทุกเซ็ต = 299 + 500 = 799
      const sets = setsOf([setWith('small-bundle', 699), setWith('big-bundle', 499), setWith('mid-bundle', 599)])

      expect(sets?.top.map((s) => s.href)).toEqual(['/sets/big-bundle', '/sets/mid-bundle', '/sets/small-bundle'])
      expect(sets?.top[0]).toMatchObject({
        title: 'วิทยาศาสตร์ ป.4',
        price: '499.-',
        savings: { regularPrice: '799.-', amount: '300.-', percent: '37%' },
      })
    })

    it('uses the same savings badge rule as the set page: too small a saving shows one price', () => {
      // ประหยัด 10 บาท (1.3%) ไม่ถึงเกณฑ์ 10% หรือ 100 บาท
      const [card] = setsOf([setWith('tiny-bundle', 789)])?.top ?? []

      expect(card?.price).toBe('789.-')
      expect(card).not.toHaveProperty('savings')
    })

    it('sums up each set in one line: how many courses and the totals it has', () => {
      const subject = testCourse({ slug: 'primary-exercise-p4', stats: { questionCount: 100, videoHours: 4 } })
      const other = testCourse({ slug: 'other-course', stats: { questionCount: 50, pdfPages: 80 } })
      const set = setWith('pair-bundle', 499)
      const sets = createCatalog(testContent({ courses: [subject, other], sets: [set] })).courseDetail(subject.slug)?.sets

      expect(sets?.top[0]?.summary).toBe('รวม 2 คอร์ส · VDO 4 ชม. · PDF 80 หน้า · 150 ข้อ')
    })

    it('shows the three best sets first and folds the rest behind a "see N more" button', () => {
      const sets = setsOf([599, 499, 699, 549, 649].map((price, i) => setWith(`set-${i}-bundle`, price)))

      expect(sets?.top.map((s) => s.price)).toEqual(['499.-', '549.-', '599.-'])
      expect(sets?.more?.label).toBe('ดูอีก 2 เซ็ต')
      expect(sets?.more?.sets.map((s) => s.price)).toEqual(['649.-', '699.-'])
    })

    it.each([1, 2, 3])('has no "see more" button for a course in %i set(s)', (count) => {
      const sets = setsOf(Array.from({ length: count }, (_, i) => setWith(`set-${i}-bundle`, 599)))

      expect(sets?.top).toHaveLength(count)
      expect(sets).not.toHaveProperty('more')
    })
  })
})
