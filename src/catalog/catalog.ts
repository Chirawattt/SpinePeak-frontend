// Catalog: รับข้อมูลจาก content/ แล้วคืนข้อมูลที่พร้อมให้แต่ละหน้าแสดง
// ตัดสินเรื่องแสดง / ซ่อน / คำนวณไว้ครบที่นี่ หน้า React แค่ render ตามนั้น

import { trackLabelsByGroup, type Clip, type Course, type CourseSet, type Group, type Review, type Site } from '@content/types'
import { buildCourseCard, type CourseCard } from './course-card'
import { buildCourseDetail, type CourseDetail } from './course-detail'
import { listHref, type CourseFilters } from './course-filters'
import { buildCourseListIndex, buildCoursesPage, buildReviewQuote, filterCourseList, type CourseList, type ReviewQuote } from './course-list'
import { groupLink, nonEmpty, type Faq, type NavLink } from './format'
import { withoutMocks } from './mocks'
import { buildPromos, type Promo } from './promos'
import { courseOgCard, pageOgCard, setOgCard, type OgCard, type OgPage } from './og'
import { buildSetDetail, type SetDetail } from './set-detail'
import { buildSetListCard, buildSetListIndex, filterSetList, type SetFilters, type SetList, type SetListCard } from './set-list'
import { validateContent } from './validate-content'

export type Content = {
  courses: Course[]
  sets: CourseSet[]
  site: Site
  reviews: Review[]
  clips: Clip[]
}

export type HeroStat = { value: string; label: string }

export type Landing = {
  hero: {
    badge: string
    /** heroTitle ใน site.json มี \n ตัดบรรทัดตามนั้น */
    titleLines: string[]
    subtitle: string
    stats: HeroStat[]
    /** ชื่อผู้สอนหลัก ใช้เป็น alt ของรูปใน hero */
    photoAlt: string
    /** false เมื่อ clips.json ว่าง ให้ซ่อนปุ่ม "ดูตัวอย่างคลิปสอน" */
    showClipsLink: boolean
  }
  /** ทางเข้าตามกลุ่มใต้ hero · กลุ่มที่ไม่มีคอร์สเลยไม่โผล่ */
  groupEntries: GroupEntry[]
  /** แถบโปรโมชัน · ว่างเมื่อไม่มีโปร หรือเหลือแค่การ์ด "ซื้อเป็น SET" ใบเดียว ให้ซ่อนทั้งแถบ */
  promos: Promo[]
  /** บรรทัดใต้หัวข้อ "คอร์สขายดี" เช่น "ซื้อเป็น SET ประหยัดสูงสุด 51%" · มีเฉพาะตอนแถบโปรซ่อนเพราะเหลือการ์ดนั้นใบเดียว */
  featuredNote?: string
  /** ไม่มีค่าเมื่อ site.json ไม่มีผู้สอน ให้ซ่อนส่วนแนะนำครู */
  teacher?: Teacher
  /** ว่างเมื่อ clips.json ว่าง ให้ซ่อนทั้งส่วน */
  clips: ClipCard[]
  /** ว่างเมื่อ reviews.json ว่าง ให้ซ่อนทั้งส่วน */
  reviews: ReviewQuote[]
  /** ของแนะนำ (หัวข้อ "คอร์สขายดี") ตามลำดับใน site.json · ว่างเมื่อไม่ได้เลือกไว้ ให้ซ่อนทั้งส่วน */
  featured: FeaturedCard[]
  /** เมนูหัวเว็บ · ลิงก์ไปส่วนที่ซ่อนอยู่จะไม่โผล่ */
  nav: NavLink[]
}

/** การ์ดของแนะนำ · ใช้การ์ดเดิมของคอร์ส / เซ็ต + ป้ายที่เจ้าของใส่ */
export type FeaturedCard = { label?: string } & (
  | { kind: 'course'; card: CourseCard }
  | { kind: 'set'; card: SetListCard }
)

/** หนึ่งกลุ่มในทางเข้าใต้ hero: ลิงก์ไปรายการคอร์สของกลุ่ม + หมวดหมู่ในกลุ่มนั้น เรียงจากที่มีคอร์สมากที่สุด */
export type GroupEntry = {
  key: Group
  label: string
  href: string
  courseCount: number
  setCount: number
  categories: NavLink[]
}

export type Teacher = { name: string; bio: string; tags: string[] }

export type ClipCard = { title: string; /** เช่น "ตัดจากคอร์ส ม.ปลาย · 8 นาที" */ meta: string; href: string; thumbnail?: string }

export type SocialLink = { kind: 'line' | 'instagram' | 'facebook'; label: string; href: string }

export type Footer = {
  blurb: string
  groups: NavLink[]
  /** ไม่มีค่าเมื่อ site.json เว้นว่าง ให้ซ่อนบรรทัดนั้น */
  hours?: string
  /** ไม่มีค่าเมื่อ site.json เว้นว่าง ให้ซ่อนบรรทัดนั้น */
  email?: string
  /** ไม่มี TikTok: ตัดออกในเฟส 1 แม้ site.json จะมีก็ตาม */
  socials: SocialLink[]
  /** เนื้อหา modal จากลิงก์ "ช่วยเหลือ" · ส่วนที่ว่างให้ซ่อนลิงก์และแท็บของส่วนนั้น */
  help: { steps: HelpStep[]; faqs: Faq[] }
}

export type HelpStep = { title: string; desc: string }

/** ข้ามขั้นที่ชื่อหรือคำอธิบายว่าง จะได้ไม่มีการ์ดเปล่าใน modal */
function helpSteps(steps: Site['howToApply']): HelpStep[] {
  return steps.flatMap((s) => {
    const title = nonEmpty(s.title)
    const desc = nonEmpty(s.desc)
    return title && desc ? [{ title, desc }] : []
  })
}

/** เหมือน helpSteps: ข้ามข้อที่คำถามหรือคำตอบว่าง จะได้ไม่มีแถวเปล่าและไม่โชว์ลิงก์ที่เปิดไปเจอแต่ของว่าง */
function helpFaqs(faqs: Site['faqs']): Faq[] {
  return faqs.flatMap((f) => {
    const q = nonEmpty(f.q)
    const a = nonEmpty(f.a)
    return q && a ? [{ q, a }] : []
  })
}

/** now: เวลาที่ใช้ตัดโปรที่หมดเขต (ค่าเริ่มต้น = ตอน build) */
/** showMocks: แสดงรีวิว / โปรที่เป็น mock ด้วย (ดู mocks.ts) · ค่าเริ่มต้น false ของ mock จะได้ไม่หลุดขึ้นเว็บจริง */
export function createCatalog(source: Content, { now = () => new Date(), showMocks = false }: { now?: () => Date; showMocks?: boolean } = {}) {
  const content = showMocks ? source : withoutMocks(source)
  const { site, courses, sets } = content

  function landing(): Landing {
    // ผู้สอนหลักคือคนแรกใน site.json
    const main = site.instructors[0]
    const teacher = main && { name: main.name, bio: nonEmpty(main.longBio) ?? main.shortBio, tags: main.tags }
    const clips = content.clips.map((c) => ({ title: c.title, meta: `${c.sourceLabel} · ${c.minutes} นาที`, href: c.youtubeUrl, ...(nonEmpty(c.thumbnail) && { thumbnail: c.thumbnail }) }))
    const reviews = content.reviews.map(buildReviewQuote)
    // ของที่ไม่มีอยู่ข้ามไป: validateContent() รายงานให้ build พังก่อนอยู่แล้ว
    const featured = site.featured.flatMap((item): FeaturedCard[] => {
      const label = nonEmpty(item.label)
      if (item.type === 'set') {
        const set = sets.find((s) => s.slug === item.slug)
        if (!set) return []
        const card = buildSetListCard(set, courses, site)
        return [{ kind: 'set', card, ...(label && { label }) }]
      }
      const course = courses.find((c) => c.slug === item.slug)
      if (!course) return []
      return [{ kind: 'course', card: buildCourseCard(course, site), ...(label && { label }) }]
    })
    return {
      hero: {
        badge: site.brand.heroBadge,
        titleLines: site.brand.heroTitle.split('\n'),
        subtitle: site.brand.heroSubtitle,
        stats: site.heroStats,
        photoAlt: main?.name ?? site.brand.name,
        showClipsLink: clips.length > 0,
      },
      groupEntries: buildGroupEntries(),
      ...promoStrip(buildPromos(site, sets, courses, now())),
      ...(teacher && { teacher }),
      clips,
      reviews,
      featured,
      nav: [
        { label: 'คอร์สเรียน', href: '/courses' },
        { label: 'SET คอร์ส', href: '/sets' },
        ...(teacher ? [{ label: 'แนะนำครู', href: '/#teacher' }] : []),
        ...(reviews.length > 0 ? [{ label: 'รีวิว', href: '/#reviews' }] : []),
      ],
    }
  }

  function buildGroupEntries(): GroupEntry[] {
    const categoriesOf = trackLabelsByGroup(courses)
    return site.groups.flatMap((g): GroupEntry[] => {
      const courseCount = courses.filter((c) => c.group === g.key).length
      if (courseCount === 0) return []
      return [
        {
          key: g.key,
          label: g.label,
          href: listHref({ group: g.key }),
          courseCount,
          setCount: sets.filter((s) => s.group === g.key).length,
          // หมวดหมู่ที่มีคอร์สมากขึ้นก่อน · เท่ากันคงลำดับใน courses.json (sort ของ JS เป็น stable)
          categories: categoriesOf[g.key]
            .map((category) => ({ category, count: courses.filter((c) => c.group === g.key && c.category === category).length }))
            .sort((a, b) => b.count - a.count)
            .map(({ category }) => ({ label: category, href: listHref({ group: g.key, category }) })),
        },
      ]
    })
  }

  /**
   * การ์ด "ซื้อเป็น SET" ใบเดียวโดด ๆ ทำให้แถบโปรดูโหรงและซ้ำกับคอร์สขายดีที่อยู่ถัดไป
   * กรณีนั้นซ่อนแถบ แล้วย้ายตัวเลขไปเป็นบรรทัดใต้หัวข้อคอร์สขายดีแทน · มีโปรอื่นด้วยก็แสดงแถบตามปกติ
   */
  function promoStrip(promos: Promo[]): Pick<Landing, 'promos' | 'featuredNote'> {
    const [only] = promos
    if (promos.length !== 1 || only?.kind !== 'evergreen' || only.href !== '/sets') return { promos }
    return { promos: [], featuredNote: `ซื้อเป็น SET ประหยัดสูงสุด ${only.value.replace(/^-/, '')}` }
  }

  /** contactNote: บรรทัดเล็กใต้ปุ่มติดต่อหลัก · ไม่มีค่าเมื่อ site.json เว้นว่าง ให้ซ่อน */
  function siteInfo() {
    const contactNote = nonEmpty(site.brand.contactNote)
    return { name: site.brand.name, description: site.brand.heroSubtitle, ...(contactNote && { contactNote }) }
  }

  function footer(): Footer {
    const { line, instagram, facebook } = site.contact
    // LINE ก่อน: เป็นช่องทางหลักที่แอดมินปิดการขาย · ลิงก์เพิ่มเพื่อน ไม่ใช่เปิดแชทพร้อมข้อความ
    const socials: SocialLink[] = [{ kind: 'line', label: line.basicId, href: `https://line.me/R/ti/p/${encodeURIComponent(line.basicId)}` }]
    if (instagram) socials.push({ kind: 'instagram', label: `@${instagram.handle}`, href: instagram.url })
    socials.push({ kind: 'facebook', label: site.brand.name, href: facebook.url })

    return {
      blurb: site.brand.footerBlurb,
      groups: site.groups.map((g) => groupLink(g.key, g.label)),
      hours: nonEmpty(site.contact.hours),
      email: nonEmpty(site.contact.email),
      socials,
      help: { steps: helpSteps(site.howToApply), faqs: helpFaqs(site.faqs) },
    }
  }

  /** undefined เมื่อไม่มีคอร์ส slug นี้ ให้หน้าขึ้น 404 */
  function courseDetail(slug: string): CourseDetail | undefined {
    const course = courses.find((c) => c.slug === slug)
    return course && buildCourseDetail(course, content)
  }

  const courseListIndex = buildCourseListIndex(courses, site)

  /** การ์ดคอร์สที่ผ่านตัวกรอง พร้อมจำนวน · หน้ากรองฝั่ง client ด้วย filterCourseList() กับ courseListIndex */
  function courseList(filters: CourseFilters): CourseList {
    return filterCourseList(courseListIndex, filters)
  }

  const setListIndex = buildSetListIndex(sets, courses, site)

  /** การ์ดเซ็ตที่ผ่านตัวกรอง พร้อมจำนวน · หน้ากรองฝั่ง client ด้วย filterSetList() กับ setListIndex */
  function setList(filters: SetFilters): SetList {
    return filterSetList(setListIndex, filters)
  }

  /** undefined เมื่อไม่มีเซ็ต slug นี้ ให้หน้าขึ้น 404 */
  function setDetail(slug: string): SetDetail | undefined {
    const set = sets.find((s) => s.slug === slug)
    return set && buildSetDetail(set, courses, site, content.reviews)
  }

  /** ข้อมูลบนรูป OG ของคอร์ส · undefined เมื่อไม่มีคอร์ส slug นี้ */
  function courseOg(slug: string): OgCard | undefined {
    const course = courses.find((c) => c.slug === slug)
    return course && courseOgCard(course, site)
  }

  /** ข้อมูลบนรูป OG ของเซ็ต · undefined เมื่อไม่มีเซ็ต slug นี้ */
  function setOg(slug: string): OgCard | undefined {
    const set = sets.find((s) => s.slug === slug)
    return set && setOgCard(set, courses, site)
  }

  return {
    siteInfo,
    courseOg,
    setOg,
    /** รูป OG ทั่วไปของหน้าแรกกับหน้ารายการ */
    pageOg: (page: OgPage) => pageOgCard(page, site),
    landing,
    footer,
    courseDetail,
    setDetail,
    setList,
    /** ข้อมูลที่หน้ารายการเซ็ตส่งให้ client ไปกรองเอง */
    setListIndex: () => setListIndex,
    courseList,
    /** ส่วนท้ายหน้ารายการ SET: FAQ และช่องทางรองของกล่องติดต่อ */
    setsPage: () => {
      const instagramHref = nonEmpty(site.contact.instagram?.url)
      return { faqs: site.setsFaqs, ...(instagramHref && { instagramHref }) }
    },
    /** ส่วนท้ายหน้ารายการคอร์ส: goal cards, รีวิว, FAQ, เวลาทำการ */
    coursesPage: () => buildCoursesPage(site, content.reviews),
    /** ข้อมูลที่หน้ารายการคอร์สส่งให้ client ไปกรองเอง */
    courseListIndex: () => courseListIndex,
    /** slug ของทุกคอร์ส ใช้ build หน้ารายละเอียดล่วงหน้า */
    courseSlugs: () => courses.map((c) => c.slug),
    /** slug ของทุกเซ็ต ใช้ build หน้ารายละเอียดล่วงหน้า */
    setSlugs: () => sets.map((s) => s.slug),
    /** รายการปัญหาของข้อมูล ว่างแปลว่าผ่าน */
    validateContent: () => validateContent(content),
  }
}

export type Catalog = ReturnType<typeof createCatalog>
