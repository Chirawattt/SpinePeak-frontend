import { describe, expect, it } from 'vitest'
import { catalog as realCatalog } from '.'
import { createCatalog } from './catalog'
import { testContent, testCourse, testSet, testSite } from './test-content'

const courses = [
  testCourse({ slug: 'c1', title: 'สอวน. ชีววิทยา', tagline: 'ตะลุยโจทย์', group: 'mplai', category: 'แข่งขันวิชาการ', price: 500 }),
  testCourse({ slug: 'c2', title: 'ปรับพื้นฐาน', group: 'mplai', category: 'ม.ปลาย', price: 500, status: 'coming_soon' }),
]
const sets = [
  testSet({ code: 'NAT-01', slug: 'nat-01-bundle', title: 'รวม สวช. ม.ปลาย', tagline: 'ครบทุกวิชา', group: 'mplai', price: 750, courseSlugs: ['c1', 'c2'] }),
  testSet({ code: 'PR-01', slug: 'pr-01-bundle', title: 'วิทย์ ป.4', group: 'prathom', price: 990, courseSlugs: ['c1', 'c2'] }),
]
const catalog = createCatalog(testContent({ courses, sets }))

describe('courseOg()', () => {
  it('describes a course: group · category, name, tagline, price and the lifetime badge', () => {
    expect(catalog.courseOg('c1')).toEqual({
      eyebrow: 'ม.ปลาย · แข่งขันวิชาการ',
      title: 'สอวน. ชีววิทยา',
      tagline: 'ตะลุยโจทย์',
      price: '500.-',
      badges: ['ดูได้ไม่จำกัดอายุ'],
    })
  })

  it('adds the coming-soon badge, and names the group once when category repeats it', () => {
    expect(catalog.courseOg('c2')).toMatchObject({ eyebrow: 'ม.ปลาย', badges: ['ดูได้ไม่จำกัดอายุ', 'เร็ว ๆ นี้'] })
  })

  it('is undefined for a slug that does not exist', () => {
    expect(catalog.courseOg('nope')).toBeUndefined()
  })
})

describe('setOg()', () => {
  it('shows the set code, group, name, price and the savings badge when the set saves enough', () => {
    // 750 จาก 1,000 ประหยัด 250 บาท 25%
    expect(catalog.setOg('nat-01-bundle')).toEqual({
      eyebrow: 'เซ็ต NAT-01 · ม.ปลาย',
      title: 'รวม สวช. ม.ปลาย',
      tagline: 'ครบทุกวิชา',
      price: '750.-',
      regularPrice: '1,000.-',
      badges: ['รวม 2 คอร์ส', 'ประหยัด 250.- (25%)'],
    })
  })

  it('has no struck-through price or savings badge when the saving is under the threshold', () => {
    const og = catalog.setOg('pr-01-bundle')

    expect(og).not.toHaveProperty('regularPrice')
    expect(og?.badges).toEqual(['รวม 2 คอร์ส'])
  })

  it('is undefined for a slug that does not exist', () => {
    expect(catalog.setOg('nope-bundle')).toBeUndefined()
  })
})

describe('pageOg()', () => {
  it('uses the site name and tagline, with the page name above it on the list pages', () => {
    const c = createCatalog(testContent({ site: testSite() }))

    expect(c.pageOg('landing')).toEqual({ title: 'Spine Peak', tagline: 'คำโปรย', badges: [] })
    expect(c.pageOg('courses')).toMatchObject({ eyebrow: 'คอร์สเรียน', title: 'Spine Peak' })
    expect(c.pageOg('sets')).toMatchObject({ eyebrow: 'เซ็ตคอร์ส', title: 'Spine Peak' })
  })
})

describe('og on the real content', () => {
  it('has a card for every course and every set', () => {
    expect(realCatalog.courseSlugs().map((s) => realCatalog.courseOg(s))).not.toContain(undefined)
    expect(realCatalog.setSlugs().map((s) => realCatalog.setOg(s))).not.toContain(undefined)
  })
})
