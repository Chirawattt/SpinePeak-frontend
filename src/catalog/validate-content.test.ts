import { describe, expect, it } from 'vitest'
import type { Course, CourseSet } from '@content/types'
import { createCatalog } from './catalog'
import { testContent, testCourse, testSet, testSite } from './test-content'

function problemsIn(courses: Course[], sets: CourseSet[] = []) {
  return createCatalog(testContent({ courses, sets })).validateContent()
}

/** คอร์สสองตัวกับเซ็ตหนึ่งตัวที่อ้างถึงกันถูกต้อง */
function consistent() {
  const a = testCourse({ slug: 'primary-science-p4', setCodes: ['PR-01'] })
  const b = testCourse({ slug: 'primary-exercise-p4', title: 'ตะลุยโจทย์ ป.4', setCodes: ['PR-01'] })
  const set = testSet({ code: 'PR-01', slug: 'primary-p4-bundle', courseSlugs: [a.slug, b.slug] })
  return { a, b, set }
}

describe('validateContent()', () => {
  it('finds no problems in consistent content', () => {
    const { a, b, set } = consistent()

    expect(problemsIn([a, b], [set])).toEqual([])
  })

  describe('duplicate slugs', () => {
    it('reports two courses with the same slug', () => {
      const a = testCourse({ slug: 'primary-science-p4' })
      const b = testCourse({ slug: 'primary-science-p4', title: 'อีกคอร์ส' })

      expect(problemsIn([a, b])).toContainEqual({
        where: 'คอร์ส primary-science-p4',
        message: 'slug ซ้ำกับคอร์สอื่น',
      })
    })

    it('reports two sets with the same slug', () => {
      const s1 = testSet({ code: 'PR-01', slug: 'primary-p4-bundle' })
      const s2 = testSet({ code: 'PR-02', slug: 'primary-p4-bundle' })

      expect(problemsIn([], [s1, s2])).toContainEqual({
        where: 'เซ็ต PR-02 (primary-p4-bundle)',
        message: 'slug ซ้ำกับเซ็ตอื่น',
      })
    })

    it('reports a course and a set sharing a slug', () => {
      const course = testCourse({ slug: 'shared-bundle' })
      const set = testSet({ slug: 'shared-bundle' })

      expect(problemsIn([course], [set])).toContainEqual({
        where: 'เซ็ต PR-01 (shared-bundle)',
        message: 'slug ซ้ำกับคอร์ส shared-bundle',
      })
    })
  })

  describe('slug format', () => {
    it.each(['Primary-P4', 'primary_p4', 'primary--p4', '-primary', 'ป4', ''])(
      'reports course slug %j that is not lowercase a-z 0-9 joined by single dashes',
      (slug) => {
        expect(problemsIn([testCourse({ slug })])).toContainEqual({
          where: `คอร์ส ${slug}`,
          message: 'slug ต้องเป็น a-z 0-9 คั่นด้วยขีดกลางเท่านั้น',
        })
      },
    )

    it('reports a malformed set slug', () => {
      expect(problemsIn([], [testSet({ slug: 'Primary_P4-bundle' })])).toContainEqual({
        where: 'เซ็ต PR-01 (Primary_P4-bundle)',
        message: 'slug ต้องเป็น a-z 0-9 คั่นด้วยขีดกลางเท่านั้น',
      })
    })

    it('reports a course slug that ends in -bundle, which is reserved for sets', () => {
      expect(problemsIn([testCourse({ slug: 'primary-bundle' })])).toContainEqual({
        where: 'คอร์ส primary-bundle',
        message: 'slug ของคอร์สห้ามลงท้ายด้วย -bundle เพราะสงวนไว้ให้เซ็ต (ADR 0002)',
      })
    })

    it('reports a set slug that does not end in -bundle', () => {
      expect(problemsIn([], [testSet({ slug: 'primary-p4' })])).toContainEqual({
        where: 'เซ็ต PR-01 (primary-p4)',
        message: 'slug ของเซ็ตต้องลงท้ายด้วย -bundle (ADR 0002)',
      })
    })
  })

  describe('membership', () => {
    it('reports a set that includes a course that does not exist', () => {
      const { a, b, set } = consistent()
      set.courseSlugs.push('no-such-course')

      expect(problemsIn([a, b], [set])).toContainEqual({
        where: 'เซ็ต PR-01 (primary-p4-bundle)',
        message: 'อ้างถึงคอร์ส no-such-course ที่ไม่มีอยู่',
      })
    })

    it('reports a course that lists a set code no set has', () => {
      const { a, b, set } = consistent()
      a.setCodes.push('XX-99')

      expect(problemsIn([a, b], [set])).toContainEqual({
        where: 'คอร์ส primary-science-p4',
        message: 'อ้างถึงรหัสเซ็ต XX-99 ที่ไม่มีอยู่',
      })
    })

    it('reports a course that claims a set which does not include it', () => {
      const { a, b, set } = consistent()
      set.courseSlugs = [b.slug]

      expect(problemsIn([a, b], [set])).toEqual([
        { where: 'คอร์ส primary-science-p4', message: 'บอกว่าอยู่ในเซ็ต PR-01 แต่เซ็ตนั้นไม่ได้ใส่คอร์สนี้' },
      ])
    })

    it('reports a set that includes a course which does not list that set', () => {
      const { a, b, set } = consistent()
      a.setCodes = []

      expect(problemsIn([a, b], [set])).toEqual([
        { where: 'คอร์ส primary-science-p4', message: 'อยู่ในเซ็ต PR-01 แต่คอร์สไม่ได้ระบุว่าอยู่ในเซ็ตนี้' },
      ])
    })

    it('reports two sets with the same code', () => {
      const { a, b, set } = consistent()
      const twin = testSet({ code: 'PR-01', slug: 'other-bundle', courseSlugs: [a.slug, b.slug] })

      expect(problemsIn([a, b], [set, twin])).toContainEqual({
        where: 'เซ็ต PR-01 (other-bundle)',
        message: 'รหัสเซ็ตซ้ำกับเซ็ตอื่น',
      })
    })

    it('reports a standalone-only course that sits in a set', () => {
      const { a, b, set } = consistent()
      a.saleMode = 'standalone_only'

      expect(problemsIn([a, b], [set])).toContainEqual({
        where: 'คอร์ส primary-science-p4',
        message: 'ขายเดี่ยวเท่านั้น แต่อยู่ในเซ็ต PR-01',
      })
    })

    it('does not claim a standalone-only course is in a set code that does not exist', () => {
      const course = testCourse({ saleMode: 'standalone_only', setCodes: ['XX-99'] })

      expect(problemsIn([course])).toEqual([
        { where: 'คอร์ส primary-science-p4', message: 'อ้างถึงรหัสเซ็ต XX-99 ที่ไม่มีอยู่' },
      ])
    })

    it('reports a course that sits in no set although it is sold in sets', () => {
      const course = testCourse({ saleMode: 'standalone_and_set', setCodes: [] })

      expect(problemsIn([course])).toEqual([
        { where: 'คอร์ส primary-science-p4', message: 'ขายเดี่ยวและในเซ็ต แต่ไม่อยู่ในเซ็ตไหนเลย' },
      ])
    })

    it('reports a set with no courses', () => {
      expect(problemsIn([], [testSet({ courseSlugs: [] })])).toEqual([
        { where: 'เซ็ต PR-01 (primary-p4-bundle)', message: 'ไม่มีคอร์สในเซ็ต' },
      ])
    })

    it('reports a set that lists the same course twice', () => {
      const { a, b, set } = consistent()
      set.courseSlugs.push(a.slug)

      expect(problemsIn([a, b], [set])).toEqual([
        { where: 'เซ็ต PR-01 (primary-p4-bundle)', message: 'ใส่คอร์ส primary-science-p4 ซ้ำ' },
      ])
    })

    it('reports a course that lists the same set code twice', () => {
      const { a, b, set } = consistent()
      a.setCodes.push('PR-01')

      expect(problemsIn([a, b], [set])).toEqual([
        { where: 'คอร์ส primary-science-p4', message: 'ระบุรหัสเซ็ต PR-01 ซ้ำ' },
      ])
    })

    it('accepts a standalone-only course that is in no set', () => {
      const course = testCourse({ saleMode: 'standalone_only', setCodes: [] })

      expect(problemsIn([course])).toEqual([])
    })
  })

  describe('enum values', () => {
    // ข้อมูลจริงมาจาก JSON จึงอาจมีค่าที่ type ไม่ยอมรับ ต้อง cast เพื่อจำลองกรณีนั้น
    const bad = <T,>(value: string) => value as unknown as T

    it.each([
      ['group', { group: bad<Course['group']>('primary') }, 'กลุ่ม "primary" ไม่รู้จัก'],
      ['subject', { subject: bad<Course['subject']>('bio') }, 'วิชา "bio" ไม่รู้จัก'],
      ['status', { status: bad<Course['status']>('closed') }, 'สถานะ "closed" ไม่รู้จัก'],
      ['saleMode', { saleMode: bad<Course['saleMode']>('set_only') }, 'การขาย "set_only" ไม่รู้จัก'],
    ] as const)('reports a course with an unknown %s', (_field, overrides, message) => {
      expect(problemsIn([testCourse(overrides)])).toContainEqual({ where: 'คอร์ส primary-science-p4', message })
    })

    it.each([
      ['group', { group: bad<CourseSet['group']>('primary') }, 'กลุ่ม "primary" ไม่รู้จัก'],
      ['status', { status: bad<CourseSet['status']>('closed') }, 'สถานะ "closed" ไม่รู้จัก'],
    ] as const)('reports a set with an unknown %s', (_field, overrides, message) => {
      expect(problemsIn([], [testSet(overrides)])).toContainEqual({ where: 'เซ็ต PR-01 (primary-p4-bundle)', message })
    })
  })

  describe('instructors', () => {
    it('reports a course taught by an instructor site.json does not list', () => {
      const course = testCourse({ instructorSlug: 'kru-unknown' })

      expect(problemsIn([course])).toContainEqual({
        where: 'คอร์ส primary-science-p4',
        message: 'ผู้สอน kru-unknown ไม่มีใน site.json',
      })
    })
  })
})

describe('validateContent() featured', () => {
  const { a, b, set } = consistent()
  const problemsWith = (featured: { type: 'course' | 'set'; slug: string; label?: string }[]) =>
    createCatalog(testContent({ courses: [a, b], sets: [set], site: testSite({ featured }) })).validateContent()

  it('accepts courses and sets that exist, mixed in any order', () => {
    expect(
      problemsWith([
        { type: 'set', slug: 'primary-p4-bundle', label: 'คุ้มกว่า' },
        { type: 'course', slug: 'primary-science-p4' },
      ]),
    ).toEqual([])
  })

  it('reports a slug that does not exist', () => {
    expect(problemsWith([{ type: 'course', slug: 'primary-sience-p4' }])).toEqual([
      { where: 'ของแนะนำ #1 (course primary-sience-p4)', message: 'ไม่มีคอร์ส primary-sience-p4' },
    ])
    expect(problemsWith([{ type: 'set', slug: 'nope-bundle' }])).toEqual([
      { where: 'ของแนะนำ #1 (set nope-bundle)', message: 'ไม่มีเซ็ต nope-bundle' },
    ])
  })

  it('reports a type that does not match the slug, saying which it is', () => {
    expect(problemsWith([{ type: 'course', slug: 'primary-p4-bundle' }])[0]?.message).toBe('primary-p4-bundle เป็นเซ็ต ไม่ใช่คอร์ส ให้เปลี่ยน type เป็น "set"')
    expect(problemsWith([{ type: 'set', slug: 'primary-science-p4' }])[0]?.message).toBe('primary-science-p4 เป็นคอร์ส ไม่ใช่เซ็ต ให้เปลี่ยน type เป็น "course"')
  })

  it('reports an unknown type and a repeated item, counting from 1', () => {
    const bad = { type: 'bundle', slug: 'primary-science-p4' } as unknown as { type: 'course'; slug: string }

    expect(problemsWith([bad])[0]).toEqual({ where: 'ของแนะนำ #1 (bundle primary-science-p4)', message: 'type "bundle" ไม่รู้จัก ใช้ได้แค่ "course" หรือ "set"' })
    expect(problemsWith([{ type: 'course', slug: 'primary-science-p4' }, { type: 'course', slug: 'primary-science-p4' }])).toEqual([
      { where: 'ของแนะนำ #2 (course primary-science-p4)', message: 'ใส่ซ้ำกับรายการก่อนหน้า' },
    ])
  })
})

describe('validateContent() promos', () => {
  const seasonal = { name: 'โปรเปิดเทอม', headline: ['โปรเปิดเทอม'], detail: '', endsAt: '2026-10-31T23:59:59+07:00' }
  const problemsWith = (promo: typeof seasonal) =>
    createCatalog(testContent({ site: testSite({ promos: { seasonal: [promo], evergreen: [] } }) })).validateContent()

  it('accepts an end date with a timezone', () => {
    expect(problemsWith(seasonal)).toEqual([])
  })

  it('reports an end date without a timezone, which would end at a different hour per visitor', () => {
    expect(problemsWith({ ...seasonal, endsAt: '2026-10-31' })).toMatchObject([{ where: 'โปรตามฤดู #1 (โปรเปิดเทอม)' }])
  })

  it('reports an end date it cannot read', () => {
    expect(problemsWith({ ...seasonal, endsAt: '31 ต.ค. 69+07:00' })).toHaveLength(1)
  })
})
