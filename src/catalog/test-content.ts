// ข้อมูลตัวอย่างเล็ก ๆ สำหรับ test ของ Catalog
// test ใช้ข้อมูลนี้แทน content/ จริง เพื่อคุมกรณีขอบได้และไม่พังเมื่อชีตเปลี่ยน

import type { Course, CourseSet, Site } from '@content/types'
import type { Content } from './catalog'

export function testCourse(overrides: Partial<Course> = {}): Course {
  return {
    slug: 'primary-science-p4',
    title: 'เนื้อหาประถม ป.4',
    tagline: 'ปูพื้นวิทย์ ป.4',
    group: 'prathom',
    category: 'ประถม',
    subject: 'science',
    instructorSlug: 'kru-nam',
    price: 599,
    saleMode: 'standalone_and_set',
    stats: {},
    chapters: [],
    forWho: [],
    contentPoints: [],
    deliverables: '',
    setCodes: [],
    ...overrides,
  }
}

export function testSet(overrides: Partial<CourseSet> = {}): CourseSet {
  return {
    code: 'PR-01',
    slug: 'primary-p4-bundle',
    title: 'วิทยาศาสตร์ ป.4',
    tagline: 'ครบในเซ็ตเดียว',
    group: 'prathom',
    price: 888,
    courseSlugs: [],
    ...overrides,
  }
}

export function testSite(overrides: Partial<Site> = {}): Site {
  return {
    brand: {
      name: 'Spine Peak',
      logo: '',
      heroBadge: 'ป้ายบน hero',
      heroTitle: 'บรรทัดแรก\nบรรทัดสอง',
      heroSubtitle: 'คำโปรย',
      footerBlurb: 'ข้อความท้ายเว็บ',
    },
    heroStats: [
      { value: '3', label: 'คอร์สทั้งหมด' },
      { value: '1', label: 'เซ็ตราคาพิเศษ' },
    ],
    instructors: [
      { slug: 'kru-nam', name: 'ครูพี่หนาม', role: 'ผู้สอน', shortBio: '', longBio: '', tags: [] },
    ],
    contact: {
      line: { basicId: '@test', prefillTemplate: 'สนใจ {itemTitle}' },
      facebook: { pageId: 'testpage', url: 'https://www.facebook.com/testpage' },
      instagram: { handle: 'test.ig', url: 'https://www.instagram.com/test.ig/' },
      email: '',
      hours: '',
    },
    goalCards: [],
    featured: [],
    promos: { seasonal: [], evergreen: [] },
    faqs: [],
    coursesFaqs: [],
    setsFaqs: [],
    config: {
      lifetimeLabel: 'ไม่จำกัดอายุ',
      listPageSize: 9,
      listPageIncrement: 6,
    },
    groups: [
      { key: 'prathom', label: 'ประถม' },
      { key: 'mton', label: 'ม.ต้น' },
      { key: 'mplai', label: 'ม.ปลาย' },
    ],
    ...overrides,
  }
}

export function testContent(overrides: Partial<Content> = {}): Content {
  return {
    courses: [],
    sets: [],
    site: testSite(),
    reviews: [],
    clips: [],
    ...overrides,
  }
}
