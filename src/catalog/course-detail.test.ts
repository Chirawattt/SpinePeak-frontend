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

  it('shows the title, tagline and group', () => {
    const detail = detailOf(testCourse({ title: 'สอวน. ชีวะ', tagline: 'เฉลยละเอียด', group: 'mplai', category: 'สอวน.' }))

    expect(detail).toMatchObject({
      title: 'สอวน. ชีวะ',
      tagline: 'เฉลยละเอียด',
      group: { label: 'ม.ปลาย', href: '/courses?group=mplai' },
    })
  })

  it('labels the badge with the group, subject and first topic, like the course card', () => {
    expect(detailOf(testCourse({ group: 'mplai', subject: 'biology', category: 'แข่งขันวิชาการ', topics: ['สอวน.'] }))?.badge).toBe(
      'ม.ปลาย · ชีววิทยา · สอวน.',
    )
    expect(detailOf(testCourse({ group: 'prathom', category: 'ประถม', topics: ['ประถม'] }))?.badge).toBe('ประถม · วิทยาศาสตร์')
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
    it('shows video hours, PDF pages and questions, then the unlimited access', () => {
      const detail = detailOf(testCourse({ stats: { questionCount: 100, pdfPages: 86, videoHours: 10 } }))

      expect(detail?.stats).toEqual([
        { value: '10 ชม.', label: 'วิดีโอทั้งหมด' },
        { value: '86 หน้า', label: 'ไฟล์ PDF' },
        { value: '100 ข้อ', label: 'เฉลยละเอียด' },
        { value: 'ไม่จำกัด', label: 'อายุคอร์ส' },
      ])
    })

    it('leaves out questions when the course has no question count', () => {
      const detail = detailOf(testCourse({ stats: { pdfPages: 85, videoHours: 5 } }))

      expect(detail?.stats.map((s) => s.label)).toEqual(['วิดีโอทั้งหมด', 'ไฟล์ PDF', 'อายุคอร์ส'])
    })

    it('shows a PDF page range as a range', () => {
      expect(detailOf(testCourse({ stats: { pdfPages: { min: 30, max: 70 } } }))?.stats[0]).toEqual({ value: '30-70 หน้า', label: 'ไฟล์ PDF' })
    })

    it('never shows a zero, such as "0 ชม."', () => {
      const detail = detailOf(testCourse({ stats: { questionCount: 0, pdfPages: 0, videoHours: 0 } }))

      expect(detail?.stats).toEqual([{ value: 'ไม่จำกัด', label: 'อายุคอร์ส' }])
    })

    it('keeps decimal video hours', () => {
      expect(detailOf(testCourse({ stats: { videoHours: 2.5 } }))?.stats[0]).toEqual({ value: '2.5 ชม.', label: 'วิดีโอทั้งหมด' })
    })
  })

  describe('sections without data are hidden', () => {
    it('hides the whole content section when the course has no content points and no chapters', () => {
      expect(detailOf(testCourse({ contentPoints: [], chapters: [] }))).not.toHaveProperty('content')
    })

    it('lists the content points when the course has no chapters, under the course totals', () => {
      const detail = detailOf(testCourse({ contentPoints: ['ตะลุยโจทย์', 'เฉลยละเอียด'], chapters: [], stats: { videoHours: 3, questionCount: 100 } }))

      expect(detail?.content).toEqual({ meta: 'VDO 3 ชม. · 100 ข้อ', items: ['ตะลุยโจทย์', 'เฉลยละเอียด'] })
    })

    it('lists the chapter titles instead when the course has chapters', () => {
      const detail = detailOf(testCourse({ contentPoints: ['สรุปเนื้อหา'], chapters: [{ title: 'เซลล์' }, { title: 'พันธุศาสตร์' }] }))

      expect(detail?.content).toEqual({ items: ['เซลล์', 'พันธุศาสตร์'] })
    })

    it('hides who the course is for when it is empty', () => {
      expect(detailOf(testCourse({ forWho: [] }))).not.toHaveProperty('forWho')
    })

    it('ignores blank entries in lists and a blank deliverables line', () => {
      const detail = detailOf(testCourse({ forWho: ['ม.ปลาย', '  '], contentPoints: [''], chapters: [{ title: ' ' }], deliverables: ' ' }))

      expect(detail?.forWho).toEqual(['ม.ปลาย'])
      expect(detail).not.toHaveProperty('content')
      expect(detail).not.toHaveProperty('deliverables')
    })

    it('shows what the buyer gets under the price', () => {
      expect(detailOf(testCourse({ deliverables: 'ไฟล์ PDF + คลิปวิดีโอ' }))?.deliverables).toBe('ไฟล์ PDF + คลิปวิดีโอ')
    })
  })

  describe('instructor', () => {
    it('shows the instructor who teaches the course as the teacher of its subject, with a photo when there is one', () => {
      expect(detailOf(testCourse({ instructorSlug: 'kru-nam' }))?.instructor).toEqual({
        name: 'ครูพี่หนาม',
        role: 'ผู้สอนวิชาวิทยาศาสตร์',
        bio: 'ติวเตอร์ชีววิทยา',
        photo: '/kru-nam-hero.png',
      })
    })

    it('has no photo when the instructor has none, so the page shows a placeholder', () => {
      expect(detailOf(testCourse({ instructorSlug: 'kru-fon', subject: 'chemistry' }))?.instructor).toEqual({
        name: 'ครูพี่ฝน',
        role: 'ผู้สอนวิชาเคมี',
        bio: 'ผู้สอนคอร์ส สวช. ม.ปลาย เคมี',
      })
    })
  })

  it('builds the lifetime line from the label in site.json', () => {
    expect(detailOf(testCourse())?.lifetime).toBe('ดูได้ไม่จำกัดอายุ')
  })

  describe('cover', () => {
    it('uses a palette colour box, one tone per group, while the course has no cover image', () => {
      expect(detailOf(testCourse({ group: 'prathom' }))?.cover).toEqual({ tone: 'sky' })
      expect(detailOf(testCourse({ group: 'mton' }))?.cover).toEqual({ tone: 'wash' })
      expect(detailOf(testCourse({ group: 'mplai' }))?.cover).toEqual({ tone: 'ink' })
    })

    it('uses the cover image once the course has one', () => {
      expect(detailOf(testCourse({ group: 'mplai', coverImage: '/courses/x.jpg' }))?.cover).toEqual({ tone: 'ink', image: '/courses/x.jpg' })
    })
  })

  it('names the course for the contact buttons', () => {
    expect(detailOf(testCourse({ slug: 'primary-science-p4', title: 'เนื้อหาประถม ป.4' }))?.contactItem).toEqual({
      kind: 'course',
      slug: 'primary-science-p4',
      title: 'เนื้อหาประถม ป.4',
    })
  })

  it('shows only the reviews written for this course', () => {
    const course = testCourse({ slug: 'a-course' })
    const reviews = [
      { id: 'r1', quote: 'เฉลยละเอียด', studentName: 'น้องมายด์', grade: 'ม.5', courseSlug: 'a-course' },
      { id: 'r2', quote: 'คอร์สอื่น', studentName: 'น้องปูน', grade: 'ม.6', courseSlug: 'b-course' },
      { id: 'r3', quote: 'ไม่ระบุคอร์ส', studentName: 'น้องกัน', grade: 'ม.6' },
    ]
    const detail = createCatalog(testContent({ courses: [course], reviews })).courseDetail('a-course')

    expect(detail?.reviews).toEqual([{ quote: 'เฉลยละเอียด', by: 'น้องมายด์ · ม.5', name: 'น้องมายด์' }])
  })

  describe('sample clip', () => {
    const clip = 'https://youtu.be/QnQe0xW_JY4'
    const embedUrl = 'https://www.youtube-nocookie.com/embed/QnQe0xW_JY4'

    it('has no clip box while the course has no clip', () => {
      expect(detailOf(testCourse())).not.toHaveProperty('preview')
    })

    it('embeds the YouTube clip', () => {
      expect(detailOf(testCourse({ previewVideoUrl: clip }))?.preview).toEqual({ embedUrl })
    })

    it('links to the YouTube channel once site.json has it', () => {
      const course = testCourse({ previewVideoUrl: clip })
      const site = testSite({ contact: { ...testSite().contact, youtubeChannelUrl: 'https://www.youtube.com/@krunam' } })

      expect(createCatalog(testContent({ courses: [course], site })).courseDetail(course.slug)?.preview).toEqual({
        embedUrl,
        channelUrl: 'https://www.youtube.com/@krunam',
      })
    })

    it('hides the clip box when the link is not a YouTube video', () => {
      expect(detailOf(testCourse({ previewVideoUrl: 'https://example.com/clip' }))).not.toHaveProperty('preview')
    })
  })

  it('lists every course slug for building the pages ahead of time', () => {
    const courses = [testCourse({ slug: 'a-course' }), testCourse({ slug: 'b-course' })]

    expect(createCatalog(testContent({ courses })).courseSlugs()).toEqual(['a-course', 'b-course'])
  })

  describe('sets that include the course', () => {
    const course = testCourse({ slug: 'primary-exercise-p4', price: 299 })
    const other = testCourse({ slug: 'other-course', price: 500 })

    /** SET ที่มีคอร์สนี้ ขายรวม setPrice บาท · คอร์สอื่นใน SET ราคา 500 */
    function setWith(slug: string, setPrice: number, overrides: Partial<CourseSet> = {}): CourseSet {
      return testSet({ code: slug.toUpperCase(), slug, price: setPrice, courseSlugs: ['primary-exercise-p4', 'other-course'], ...overrides })
    }

    function setsOf(sets: CourseSet[], subject: Course = course, extra: Course[] = []) {
      return createCatalog(testContent({ courses: [subject, other, ...extra], sets })).courseDetail(subject.slug)?.sets
    }

    it('shows no set box for a course that is in no set', () => {
      expect(setsOf([])).toBeUndefined()
    })

    it('shows no set box for a course sold on its own only, even if a set lists it by mistake', () => {
      // validateContent() กันกรณีนี้ตอน build อยู่แล้ว แต่หน้าคอร์สไม่ควรโฆษณา SET ให้คอร์สที่ขายเดี่ยวเท่านั้น
      const standalone = testCourse({ slug: 'primary-exercise-p4', saleMode: 'standalone_only' })

      expect(setsOf([setWith('some-bundle', 499)], standalone)).toBeUndefined()
    })

    it('offers at most 2 sets, the smallest set first, labelled as in the design, each linking to its set page', () => {
      const third = testCourse({ slug: 'third-course', price: 500 })
      const big = setWith('big-bundle', 999, { courseSlugs: ['primary-exercise-p4', 'other-course', 'third-course'] })
      const sets = setsOf([big, setWith('pair-bundle', 699)], course, [third])

      expect(sets?.offers.map((s) => [s.label, s.href])).toEqual([
        ['ซื้อเป็น SET คุ้มกว่า', '/sets/pair-bundle'],
        ['หรือเลือก SET ที่ครบกว่า', '/sets/big-bundle'],
      ])
      expect(sets?.offers[0]).toMatchObject({ price: '699.-', savings: { regularPrice: '799.-', amount: '100.-' } })
    })

    it('breaks a tie in size by the bigger saving', () => {
      const sets = setsOf([setWith('small-bundle', 699), setWith('best-bundle', 499)])

      expect(sets?.offers.map((s) => s.href)).toEqual(['/sets/best-bundle', '/sets/small-bundle'])
    })

    it('uses the same savings rule as the set page: even a small saving shows', () => {
      expect(setsOf([setWith('tiny-bundle', 789)])?.offers[0]?.savings).toMatchObject({ amount: '10.-' })
    })

    it('sums up each set in one line: how many courses and the totals it has', () => {
      const subject = testCourse({ slug: 'primary-exercise-p4', stats: { questionCount: 100, videoHours: 4 } })
      const withPages = testCourse({ slug: 'other-course', stats: { questionCount: 50, pdfPages: 80 } })
      const sets = createCatalog(testContent({ courses: [subject, withPages], sets: [setWith('pair-bundle', 499)] })).courseDetail(subject.slug)?.sets

      expect(sets?.offers[0]?.summary).toBe('รวม 2 คอร์ส · VDO 4 ชม. · PDF 80 หน้า · 150 ข้อ')
    })

    it('links the rest to the set list searched by the course name', () => {
      const sets = setsOf([599, 499, 699, 549].map((price, i) => setWith(`set-${i}-bundle`, price)))

      expect(sets?.offers).toHaveLength(2)
      expect(sets?.more).toEqual({ label: 'ดูอีก 2 SET ที่มีคอร์สนี้', href: `/sets?q=${encodeURIComponent('เนื้อหาประถม ป.4')}` })
    })

    it.each([1, 2])('has no "see more" link for a course in %i set(s)', (count) => {
      const sets = setsOf(Array.from({ length: count }, (_, i) => setWith(`set-${i}-bundle`, 599)))

      expect(sets?.offers).toHaveLength(count)
      expect(sets).not.toHaveProperty('more')
    })
  })
})
