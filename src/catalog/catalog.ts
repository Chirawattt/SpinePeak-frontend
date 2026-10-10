// Catalog: รับข้อมูลจาก content/ แล้วคืนข้อมูลที่พร้อมให้แต่ละหน้าแสดง
// ตัดสินเรื่องแสดง / ซ่อน / คำนวณไว้ครบที่นี่ หน้า React แค่ render ตามนั้น

import type { Clip, Course, CourseSet, Review, Site } from '@content/types'
import type { ContactItem } from '@/contact'
import { buildCourseCard, type CourseCard } from './course-card'
import { buildCourseDetail, type CourseDetail } from './course-detail'
import type { CourseFilters } from './course-filters'
import { buildCourseListIndex, buildCoursesPage, buildReviewQuote, filterCourseList, type CourseList, type ReviewQuote } from './course-list'
import { groupLink, nonEmpty, type NavLink } from './format'
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
  /** แถบโปรโมชัน · ว่างเมื่อไม่มีโปร ให้ซ่อนทั้งแถบ */
  promos: Promo[]
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

/** การ์ดของแนะนำ · ใช้การ์ดเดิมของคอร์ส / เซ็ต + ป้ายที่เจ้าของใส่ + ของที่ปุ่มติดต่อต้องบอกแอดมิน */
export type FeaturedCard = { label?: string; contactItem: ContactItem } & (
  | { kind: 'course'; card: CourseCard }
  | { kind: 'set'; card: SetListCard; /** เช่น "แพ็กคู่ · ประหยัด 199.-" */ eyebrow: string }
)

export type Teacher = { name: string; bio: string; tags: string[] }

export type ClipCard = { title: string; /** เช่น "ตัดจากคอร์ส ม.ปลาย · 8 นาที" */ meta: string; href: string; thumbnail?: string }

export type SocialLink = { kind: 'instagram' | 'facebook'; label: string; href: string }

export type Footer = {
  blurb: string
  groups: NavLink[]
  /** ไม่มีค่าเมื่อ site.json เว้นว่าง ให้ซ่อนบรรทัดนั้น */
  hours?: string
  /** ไม่มีค่าเมื่อ site.json เว้นว่าง ให้ซ่อนบรรทัดนั้น */
  email?: string
  /** ไม่มี TikTok: ตัดออกในเฟส 1 แม้ site.json จะมีก็ตาม */
  socials: SocialLink[]
}

/** now: เวลาที่ใช้ตัดโปรที่หมดเขต (ค่าเริ่มต้น = ตอน build) */
export function createCatalog(content: Content, { now = () => new Date() }: { now?: () => Date } = {}) {
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
        const eyebrow = [set.courseSlugs.length === 2 ? 'แพ็กคู่' : `SET ${card.courseCount}`, card.savings && `ประหยัด ${card.savings.amount}`].filter(Boolean).join(' · ')
        return [{ kind: 'set', card, eyebrow, contactItem: { kind: 'set', slug: set.slug, title: set.title }, ...(label && { label }) }]
      }
      const course = courses.find((c) => c.slug === item.slug)
      if (!course) return []
      return [{ kind: 'course', card: buildCourseCard(course, site), contactItem: { kind: 'course', slug: course.slug, title: course.title }, ...(label && { label }) }]
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
      promos: buildPromos(site, sets, courses, now()),
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

  function siteInfo() {
    return { name: site.brand.name, description: site.brand.heroSubtitle }
  }

  function footer(): Footer {
    const { instagram, facebook } = site.contact
    const socials: SocialLink[] = []
    if (instagram) socials.push({ kind: 'instagram', label: `@${instagram.handle}`, href: instagram.url })
    socials.push({ kind: 'facebook', label: site.brand.name, href: facebook.url })

    return {
      blurb: site.brand.footerBlurb,
      groups: site.groups.map((g) => groupLink(g.key, g.label)),
      hours: nonEmpty(site.contact.hours),
      email: nonEmpty(site.contact.email),
      socials,
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
