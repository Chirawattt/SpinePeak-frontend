// ตรวจว่าข้อมูลใน content/ สอดคล้องกัน ถ้าพัง build ต้องพัง ข้อมูลผิดจะได้ไม่ขึ้นเว็บ
// ยึด sheet_sync.py --check เป็นแนว แต่รันด้วย Node ได้ จึงใช้บน Vercel ที่ไม่มี Python ได้

import type { Course, CourseSet, Group, SaleMode, Status, Subject } from '@content/types'
import type { Content } from './catalog'

export type ContentProblem = {
  /** ชิ้นที่ผิด เช่น "คอร์ส primary-science-p4" หรือ "เซ็ต PR-01 (primary-p4-bundle)" */
  where: string
  message: string
}

// ค่าที่ยอมรับของแต่ละ enum · satisfies บังคับให้ครบทุกค่าใน type และไม่มีค่าเกิน
const GROUPS = { prathom: true, mton: true, mplai: true } satisfies Record<Group, true>
const SUBJECTS = {
  science: true,
  biology: true,
  chemistry: true,
  physics: true,
  math: true,
  applied_science: true,
} satisfies Record<Subject, true>
const STATUSES = { open: true, coming_soon: true } satisfies Record<Status, true>
const SALE_MODES = { standalone_and_set: true, standalone_only: true } satisfies Record<SaleMode, true>

const isOneOf = (allowed: Record<string, true>, value: string) => Object.hasOwn(allowed, value)

/** เหมือน SLUG_RE ใน sheet_sync.py */
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const SLUG_MESSAGE = 'slug ต้องเป็น a-z 0-9 คั่นด้วยขีดกลางเท่านั้น'

/** ADR 0002: slug เซ็ตลงท้าย -bundle และ slug คอร์สห้ามลงท้ายแบบนี้ สองตารางจึงไม่มีวันชนกัน */
const SET_SUFFIX = '-bundle'

const courseLabel = (c: Course) => `คอร์ส ${c.slug}`
const setLabel = (s: CourseSet) => `เซ็ต ${s.code} (${s.slug})`

export function validateContent(content: Content): ContentProblem[] {
  const { courses, sets, site } = content
  const problems: ContentProblem[] = []
  const report = (where: string, message: string) => problems.push({ where, message })

  // ค่า enum ต้องเป็นค่าที่ type รู้จัก และผู้สอนต้องมีใน site.json
  const instructors = new Set(site.instructors.map((i) => i.slug))
  for (const c of courses) {
    if (!isOneOf(GROUPS, c.group)) report(courseLabel(c), `กลุ่ม "${c.group}" ไม่รู้จัก`)
    if (!isOneOf(SUBJECTS, c.subject)) report(courseLabel(c), `วิชา "${c.subject}" ไม่รู้จัก`)
    if (!isOneOf(STATUSES, c.status)) report(courseLabel(c), `สถานะ "${c.status}" ไม่รู้จัก`)
    if (!isOneOf(SALE_MODES, c.saleMode)) report(courseLabel(c), `การขาย "${c.saleMode}" ไม่รู้จัก`)
    if (!instructors.has(c.instructorSlug)) report(courseLabel(c), `ผู้สอน ${c.instructorSlug} ไม่มีใน site.json`)
  }
  for (const s of sets) {
    if (!isOneOf(GROUPS, s.group)) report(setLabel(s), `กลุ่ม "${s.group}" ไม่รู้จัก`)
    if (!isOneOf(STATUSES, s.status)) report(setLabel(s), `สถานะ "${s.status}" ไม่รู้จัก`)
  }

  // slug ต้องถูกรูปแบบ และไม่ซ้ำ ทั้งในตารางเดียวกันและข้ามคอร์สกับเซ็ต
  const courseSlugs = new Set<string>()
  for (const c of courses) {
    if (!SLUG.test(c.slug)) report(courseLabel(c), SLUG_MESSAGE)
    if (c.slug.endsWith(SET_SUFFIX)) {
      report(courseLabel(c), 'slug ของคอร์สห้ามลงท้ายด้วย -bundle เพราะสงวนไว้ให้เซ็ต (ADR 0002)')
    }
    if (courseSlugs.has(c.slug)) report(courseLabel(c), 'slug ซ้ำกับคอร์สอื่น')
    courseSlugs.add(c.slug)
  }
  const setSlugs = new Set<string>()
  for (const s of sets) {
    if (!SLUG.test(s.slug)) report(setLabel(s), SLUG_MESSAGE)
    if (!s.slug.endsWith(SET_SUFFIX)) report(setLabel(s), 'slug ของเซ็ตต้องลงท้ายด้วย -bundle (ADR 0002)')
    if (setSlugs.has(s.slug)) report(setLabel(s), 'slug ซ้ำกับเซ็ตอื่น')
    if (courseSlugs.has(s.slug)) report(setLabel(s), `slug ซ้ำกับคอร์ส ${s.slug}`)
    setSlugs.add(s.slug)
  }

  // เซ็ตกับคอร์สต้องอ้างถึงกันตรงทั้งสองทาง: courseSlugs ของเซ็ต ↔ setCodes ของคอร์ส
  const setCodes = new Set<string>()
  const setsOfCourse = new Map<string, Set<string>>()
  for (const s of sets) {
    if (setCodes.has(s.code)) report(setLabel(s), 'รหัสเซ็ตซ้ำกับเซ็ตอื่น')
    setCodes.add(s.code)
    if (s.courseSlugs.length === 0) report(setLabel(s), 'ไม่มีคอร์สในเซ็ต')
    const seen = new Set<string>()
    for (const slug of s.courseSlugs) {
      if (seen.has(slug)) report(setLabel(s), `ใส่คอร์ส ${slug} ซ้ำ`)
      seen.add(slug)
      if (!courseSlugs.has(slug)) report(setLabel(s), `อ้างถึงคอร์ส ${slug} ที่ไม่มีอยู่`)
      const codes = setsOfCourse.get(slug) ?? new Set<string>()
      codes.add(s.code)
      setsOfCourse.set(slug, codes)
    }
  }
  for (const c of courses) {
    const codesFromSets = setsOfCourse.get(c.slug) ?? new Set<string>()
    const declared = new Set<string>()
    for (const code of c.setCodes) {
      if (declared.has(code)) report(courseLabel(c), `ระบุรหัสเซ็ต ${code} ซ้ำ`)
      declared.add(code)
      if (!setCodes.has(code)) report(courseLabel(c), `อ้างถึงรหัสเซ็ต ${code} ที่ไม่มีอยู่`)
      else if (!codesFromSets.has(code)) report(courseLabel(c), `บอกว่าอยู่ในเซ็ต ${code} แต่เซ็ตนั้นไม่ได้ใส่คอร์สนี้`)
    }
    for (const code of codesFromSets) {
      if (!declared.has(code)) report(courseLabel(c), `อยู่ในเซ็ต ${code} แต่คอร์สไม่ได้ระบุว่าอยู่ในเซ็ตนี้`)
    }
    const inAnySet = declared.size > 0 || codesFromSets.size > 0
    if (c.saleMode === 'standalone_and_set' && !inAnySet) {
      report(courseLabel(c), 'ขายเดี่ยวและในเซ็ต แต่ไม่อยู่ในเซ็ตไหนเลย')
    }
    if (c.saleMode === 'standalone_only') {
      // นับเฉพาะเซ็ตที่มีอยู่จริง รหัสที่ไม่มีอยู่ถูกรายงานไปแล้วข้างบน
      const existing = [...declared].filter((code) => setCodes.has(code))
      for (const code of new Set([...existing, ...codesFromSets])) {
        report(courseLabel(c), `ขายเดี่ยวเท่านั้น แต่อยู่ในเซ็ต ${code}`)
      }
    }
  }

  // ของแนะนำบนหน้าแรก: type ต้องถูก slug ต้องมีอยู่จริงในตารางนั้น และไม่ซ้ำ
  const seenFeatured = new Set<string>()
  site.featured.forEach((item, i) => {
    const where = `ของแนะนำ #${i + 1} (${item.type} ${item.slug})`
    if (item.type !== 'course' && item.type !== 'set') {
      report(where, `type "${item.type}" ไม่รู้จัก ใช้ได้แค่ "course" หรือ "set"`)
      return
    }
    const key = `${item.type}:${item.slug}`
    if (seenFeatured.has(key)) report(where, 'ใส่ซ้ำกับรายการก่อนหน้า')
    seenFeatured.add(key)
    const [own, other] = item.type === 'course' ? [courseSlugs, setSlugs] : [setSlugs, courseSlugs]
    if (own.has(item.slug)) return
    if (other.has(item.slug)) {
      const [is, isNot, want] = item.type === 'course' ? ['เซ็ต', 'คอร์ส', 'set'] : ['คอร์ส', 'เซ็ต', 'course']
      report(where, `${item.slug} เป็น${is} ไม่ใช่${isNot} ให้เปลี่ยน type เป็น "${want}"`)
    } else {
      report(where, `ไม่มี${item.type === 'course' ? 'คอร์ส' : 'เซ็ต'} ${item.slug}`)
    }
  })

  // โปรตามฤดู: วันหมดเขตต้องอ่านได้และระบุ timezone ไม่งั้นการ์ดจะหายหรือค้างผิดวัน
  site.promos.seasonal.forEach((promo, i) => {
    const where = `โปรตามฤดู #${i + 1} (${promo.name})`
    if (!/(Z|[+-]\d\d:\d\d)$/.test(promo.endsAt) || Number.isNaN(new Date(promo.endsAt).getTime())) {
      report(where, `endsAt "${promo.endsAt}" ต้องเป็นวันเวลาพร้อม timezone เช่น "2026-10-31T23:59:59+07:00"`)
    }
    if (promo.headline.length === 0) report(where, 'headline ว่าง')
  })

  return problems
}
