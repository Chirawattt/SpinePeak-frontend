import { describe, expect, it } from 'vitest'
import site from '@content/site.json'
import { catalog } from '.'
import { createCatalog } from './catalog'
import type { Site } from '@content/types'
import { testContent, testCourse, testSet, testSite } from './test-content'

describe('landing()', () => {
  it('returns hero stats in the order written in site.json', () => {
    const heroStats = [
      { value: '12', label: 'คอร์สทั้งหมด' },
      { value: 'ตลอดชีพ', label: 'ดูซ้ำได้ไม่จำกัด' },
    ]
    const { landing } = createCatalog(testContent({ site: testSite({ heroStats }) }))

    expect(landing().hero.stats).toEqual(heroStats)
  })

  it('shows the real hero stats from content/site.json', () => {
    expect(catalog.landing().hero.stats).toEqual(site.heroStats)
  })

  it('splits the hero title into lines at each newline', () => {
    const base = testSite()
    const { landing } = createCatalog(
      testContent({ site: testSite({ brand: { ...base.brand, heroTitle: 'เรียนชีวะให้เข้าใจ\nไม่ใช่แค่ท่องจำ' } }) }),
    )

    expect(landing().hero.titleLines).toEqual(['เรียนชีวะให้เข้าใจ', 'ไม่ใช่แค่ท่องจำ'])
  })

  it('names the hero photo after the main instructor, the first one in site.json', () => {
    const instructor = { slug: 'kru-nam', name: 'ครูพี่หนาม', role: '', shortBio: '', longBio: '', tags: [] }
    const other = { ...instructor, slug: 'kru-fon', name: 'ครูพี่ฝน' }
    const { landing } = createCatalog(testContent({ site: testSite({ instructors: [instructor, other] }) }))

    expect(landing().hero.photoAlt).toBe('ครูพี่หนาม')
  })
})

describe('footer()', () => {
  function footerWith(contact: Partial<ReturnType<typeof testSite>['contact']>) {
    const base = testSite()
    return createCatalog(testContent({ site: testSite({ contact: { ...base.contact, ...contact } }) })).footer()
  }

  it('hides email and opening hours when they are empty in site.json', () => {
    const footer = footerWith({ email: '', hours: '' })

    expect(footer.email).toBeUndefined()
    expect(footer.hours).toBeUndefined()
  })

  it('hides email and opening hours when site.json leaves them out', () => {
    const footer = footerWith({ email: undefined, hours: '   ' })

    expect(footer.email).toBeUndefined()
    expect(footer.hours).toBeUndefined()
  })

  it('shows email and opening hours once site.json has them', () => {
    const footer = footerWith({ email: 'hello@example.com', hours: 'จันทร์–เสาร์ 10:00–19:00 น.' })

    expect(footer.email).toBe('hello@example.com')
    expect(footer.hours).toBe('จันทร์–เสาร์ 10:00–19:00 น.')
  })

  it('links LINE first, then Instagram, Facebook and TikTok from site.json', () => {
    const footer = footerWith({
      instagram: { handle: 'krunam.spine', url: 'https://www.instagram.com/krunam.spine/' },
      facebook: { pageId: 'AlizBiotutor', url: 'https://www.facebook.com/AlizBiotutor' },
      tiktok: { handle: 'spinepeak', url: 'https://www.tiktok.com/@spinepeak' },
    })

    expect(footer.socials).toEqual([
      { kind: 'line', label: '@test', href: 'https://line.me/R/ti/p/%40test' },
      { kind: 'instagram', label: '@krunam.spine', href: 'https://www.instagram.com/krunam.spine/' },
      { kind: 'facebook', label: 'Spine Peak', href: 'https://www.facebook.com/AlizBiotutor' },
      { kind: 'tiktok', label: '@spinepeak', href: 'https://www.tiktok.com/@spinepeak' },
    ])
  })

  it('leaves Instagram and TikTok out when site.json has no account for them', () => {
    const footer = footerWith({ instagram: undefined, tiktok: undefined })

    expect(footer.socials.map((s) => s.kind)).toEqual(['line', 'facebook'])
  })

  it('links each group to the course list filtered by that group', () => {
    const { footer } = createCatalog(testContent())

    expect(footer().groups).toEqual([
      { label: 'ประถม', href: '/courses?group=prathom' },
      { label: 'ม.ต้น', href: '/courses?group=mton' },
      { label: 'ม.ปลาย', href: '/courses?group=mplai' },
    ])
  })
})

describe('footer() help', () => {
  const helpOf = (over: Partial<Site> = {}) => createCatalog(testContent({ site: testSite(over) })).footer().help

  it('lists the how-to-apply steps in the order written in site.json', () => {
    const howToApply = [
      { title: 'เลือกคอร์ส', desc: 'ค้นหาตามระดับชั้น' },
      { title: 'กด "สมัครเรียน"', desc: 'คุยกับแอดมินทาง LINE' },
    ]

    expect(helpOf({ howToApply }).steps).toEqual(howToApply)
  })

  it('drops steps with a blank title or description so the modal never shows an empty card', () => {
    const howToApply = [
      { title: 'เลือกคอร์ส', desc: '  ค้นหาตามระดับชั้น  ' },
      { title: '   ', desc: 'ไม่มีหัวข้อ' },
      { title: 'ไม่มีคำอธิบาย', desc: '' },
    ]

    expect(helpOf({ howToApply }).steps).toEqual([{ title: 'เลือกคอร์ส', desc: 'ค้นหาตามระดับชั้น' }])
  })

  it('shows the general FAQ from site.json, not the course-list or set-list FAQ', () => {
    const faqs = [{ q: 'สมัครเรียนอย่างไร', a: 'ทักแอดมิน' }]
    const help = helpOf({ faqs, coursesFaqs: [{ q: 'ของหน้าคอร์ส', a: 'x' }], setsFaqs: [{ q: 'ของหน้า SET', a: 'y' }] })

    expect(help.faqs).toEqual(faqs)
  })

  it('drops FAQ entries with a blank question or answer, like the steps', () => {
    const faqs = [
      { q: 'สมัครเรียนอย่างไร', a: '  ทักแอดมิน  ' },
      { q: '', a: 'ไม่มีคำถาม' },
      { q: 'ไม่มีคำตอบ', a: '   ' },
    ]

    expect(helpOf({ faqs }).faqs).toEqual([{ q: 'สมัครเรียนอย่างไร', a: 'ทักแอดมิน' }])
  })

  it('counts a FAQ list of only blank entries as empty, so the footer hides the link', () => {
    expect(helpOf({ howToApply: [], faqs: [{ q: '', a: '' }] })).toEqual({ steps: [], faqs: [] })
  })

  it('has no steps and no FAQ while site.json has none, so the footer can hide the links', () => {
    expect(helpOf({ howToApply: [], faqs: [] })).toEqual({ steps: [], faqs: [] })
  })

  it('has real steps and FAQ in content/site.json', () => {
    const help = catalog.footer().help

    expect(help.steps.length).toBeGreaterThan(0)
    expect(help.faqs).toEqual(site.faqs)
  })
})

describe('landing() sections', () => {
  const clip = { title: 'ไมโอซิส', sourceLabel: 'ตัดจากคอร์ส ม.ปลาย', minutes: 8, youtubeUrl: 'https://youtu.be/x' }
  const review = { id: 'r1', quote: 'คุ้มมากครับ', studentName: 'น้องเจได', grade: 'ม.4' }
  const courses = [
    testCourse({ slug: 'a', group: 'mplai' }),
    testCourse({ slug: 'b', group: 'mplai' }),
    testCourse({ slug: 'c', group: 'prathom' }),
  ]
  const landingOf = (over: Parameters<typeof testContent>[0] = {}) => createCatalog(testContent({ courses, ...over })).landing()

  it('builds one entry per group that has courses, with counts and its categories, most courses first', () => {
    const entries = landingOf({
      courses: [
        testCourse({ slug: 'a', group: 'mplai', category: 'สอวน.' }),
        testCourse({ slug: 'b', group: 'mplai', category: 'A-Level' }),
        testCourse({ slug: 'c', group: 'mplai', category: 'A-Level' }),
        testCourse({ slug: 'd', group: 'prathom', category: 'สอบเข้า ม.1' }),
      ],
      sets: [testSet({ slug: 's1', group: 'mplai' }), testSet({ slug: 's2', group: 'mton' })],
    }).groupEntries

    expect(entries).toEqual([
      {
        key: 'prathom',
        label: 'ประถม',
        href: '/courses?group=prathom',
        courseCount: 1,
        setCount: 0,
        categories: [{ label: 'สอบเข้า ม.1', href: `/courses?group=prathom&category=${encodeURIComponent('สอบเข้า ม.1').replace(/%20/g, '+')}` }],
      },
      {
        key: 'mplai',
        label: 'ม.ปลาย',
        href: '/courses?group=mplai',
        courseCount: 3,
        setCount: 1,
        categories: [
          { label: 'A-Level', href: '/courses?group=mplai&category=A-Level' },
          { label: 'สอวน.', href: `/courses?group=mplai&category=${encodeURIComponent('สอวน.')}` },
        ],
      },
    ])
  })

  it('introduces the main instructor from site.json', () => {
    const instructor = { slug: 'kru-nam', name: 'ครูพี่หนาม', role: '', shortBio: 'สั้น', longBio: 'ยาว', tags: ['สอนจากข้อสอบจริง'] }

    expect(landingOf({ site: testSite({ instructors: [instructor] }) }).teacher).toEqual({
      name: 'ครูพี่หนาม',
      bio: 'ยาว',
      tags: ['สอนจากข้อสอบจริง'],
    })
  })

  it('hides clips and reviews, and the links to them, while clips.json and reviews.json are empty', () => {
    const landing = landingOf({ clips: [], reviews: [] })

    expect(landing.clips).toEqual([])
    expect(landing.reviews).toEqual([])
    expect(landing.hero.showClipsLink).toBe(false)
    expect(landing.nav.map((l) => l.href)).not.toContain('/#reviews')
  })

  it('shows them once there are some', () => {
    const landing = landingOf({ clips: [clip], reviews: [review] })

    expect(landing.clips).toEqual([{ title: 'ไมโอซิส', meta: 'ตัดจากคอร์ส ม.ปลาย · 8 นาที', href: 'https://youtu.be/x' }])
    expect(landing.reviews).toEqual([{ quote: 'คุ้มมากครับ', by: 'น้องเจได · ม.4', name: 'น้องเจได' }])
    expect(landing.hero.showClipsLink).toBe(true)
    expect(landing.nav.map((l) => l.href)).toContain('/#reviews')
  })

  it('passes a review cover through when reviews.json has one', () => {
    const landing = landingOf({ reviews: [{ ...review, coverImage: '/reviews/jedi.jpg' }] })

    expect(landing.reviews[0]?.cover).toBe('/reviews/jedi.jpg')
  })

  it('always links the teacher section in the menu', () => {
    expect(landingOf().nav).toEqual([
      { label: 'คอร์สเรียน', href: '/courses' },
      { label: 'SET คอร์ส', href: '/sets' },
      { label: 'แนะนำครู', href: '/#teacher' },
    ])
  })
})

describe('landing() featured', () => {
  const courses = [testCourse({ slug: 'c1', title: 'คอร์ส 1', price: 500 }), testCourse({ slug: 'c2', title: 'คอร์ส 2', price: 500 })]
  const sets = [testSet({ code: 'PR-01', slug: 'pr-01-bundle', title: 'เซ็ต 1', price: 800, courseSlugs: ['c1', 'c2'] })]
  const featuredOf = (featured: Site['featured']) => createCatalog(testContent({ courses, sets, site: testSite({ featured }) })).landing().featured

  it('lists courses and sets in the order of site.json, mixed', () => {
    const items = featuredOf([
      { type: 'set', slug: 'pr-01-bundle', label: 'เซ็ตคุ้มกว่า' },
      { type: 'course', slug: 'c2' },
      { type: 'course', slug: 'c1', label: 'ขายดี' },
    ])

    expect(items.map((i) => [i.kind, i.card.slug, i.label])).toEqual([
      ['set', 'pr-01-bundle', 'เซ็ตคุ้มกว่า'],
      ['course', 'c2', undefined],
      ['course', 'c1', 'ขายดี'],
    ])
  })

  it('reuses the course card and the set card, and points the contact button at the item', () => {
    const [set, course] = featuredOf([{ type: 'set', slug: 'pr-01-bundle' }, { type: 'course', slug: 'c1' }])

    expect(set).toMatchObject({ kind: 'set', card: { href: '/sets/pr-01-bundle', codeLabel: 'SET PR-01', price: '800.-' } })
    expect(course).toMatchObject({ kind: 'course', card: { href: '/courses/c1', price: '500.-' } })
  })

  it('carries the set saving and course count for the price row', () => {
    const [set] = featuredOf([{ type: 'set', slug: 'pr-01-bundle' }])

    expect(set?.kind === 'set' && set.card.savings).toMatchObject({ amount: '200.-' })
    expect(set?.kind === 'set' && set.card.courseCount).toBe('2 คอร์ส')
  })

  it('is empty, so the page hides the section, when site.json has no featured items', () => {
    expect(featuredOf([])).toEqual([])
  })

  it('skips an item that does not exist instead of breaking the page (the build check reports it)', () => {
    expect(featuredOf([{ type: 'course', slug: 'nope' }, { type: 'course', slug: 'c1' }]).map((i) => i.card.slug)).toEqual(['c1'])
  })

  it('shows the 3 default items of content/site.json', () => {
    expect(catalog.landing().featured).toHaveLength(3)
    expect(catalog.validateContent()).toEqual([])
  })
})

describe('landing() promos', () => {
  const courses = [testCourse({ slug: 'c1', price: 500 }), testCourse({ slug: 'c2', price: 500 }), testCourse({ slug: 'c3', price: 1000 })]
  const sets = [
    // ประหยัด 200 จาก 1000 = 20%
    testSet({ code: 'PR-01', slug: 'pr-01-bundle', price: 800, courseSlugs: ['c1', 'c2'] }),
    // ประหยัด 299 จาก 1500 = 19.93% → ปัดลงเป็น 19
    testSet({ code: 'PR-02', slug: 'pr-02-bundle', price: 1201, courseSlugs: ['c1', 'c3'] }),
  ]
  const seasonal = { name: 'โปรเปิดเทอม 2', headline: ['โปรเปิดเทอม 2', 'ลด 15%'], detail: 'ถึง 31 ต.ค.', endsAt: '2026-10-31T23:59:59+07:00' }
  const promosOf = (promos: Site['promos'], now = '2026-10-10T12:00:00+07:00', withSets = sets) =>
    createCatalog(testContent({ courses, sets: withSets, site: testSite({ promos }) }), { now: () => new Date(now) }).landing().promos

  it('is empty when site.json has no promos, so the strip hides', () => {
    expect(promosOf({ seasonal: [], evergreen: [] })).toEqual([])
  })

  it('shows a seasonal promo before its end, contacting the admin with the promo name', () => {
    expect(promosOf({ seasonal: [seasonal], evergreen: [] })).toEqual([
      { kind: 'seasonal', ...seasonal, contactItem: { kind: 'promo', slug: 'seasonal-1', title: 'โปรเปิดเทอม 2' } },
    ])
  })

  it('drops a seasonal promo that already ended when the site was built', () => {
    expect(promosOf({ seasonal: [seasonal], evergreen: [] }, '2026-11-01T00:00:00+07:00')).toEqual([])
  })

  it('advertises the best real set saving, rounded down, linking to the sets page', () => {
    const [, card] = promosOf({ seasonal: [seasonal], evergreen: [{ kind: 'set-savings', name: 'ซื้อเป็น SET', desc: 'ประหยัดสูงสุด' }] })

    expect(card).toEqual({ kind: 'evergreen', name: 'ซื้อเป็น SET', value: '-20%', desc: 'ประหยัดสูงสุด', href: '/sets' })
  })

  it('hides the strip when the set saving card would be alone, and moves the number under the best-sellers heading', () => {
    const landing = createCatalog(
      testContent({ courses, sets, site: testSite({ promos: { seasonal: [], evergreen: [{ kind: 'set-savings', name: 'ซื้อเป็น SET', desc: '' }] } }) }),
      { now: () => new Date('2026-10-10T12:00:00+07:00') },
    ).landing()

    expect(landing.promos).toEqual([])
    expect(landing.featuredNote).toBe('ซื้อเป็น SET ประหยัดสูงสุด 20%')
  })

  it('keeps the strip, without the best-sellers note, when another promo runs too', () => {
    const landing = createCatalog(
      testContent({ courses, sets, site: testSite({ promos: { seasonal: [seasonal], evergreen: [{ kind: 'set-savings', name: 'ซื้อเป็น SET', desc: '' }] } }) }),
      { now: () => new Date('2026-10-10T12:00:00+07:00') },
    ).landing()

    expect(landing.promos).toHaveLength(2)
    expect(landing.featuredNote).toBeUndefined()
  })

  it('skips the set saving card when no set is cheaper than buying separately', () => {
    const noSaving = [testSet({ code: 'PR-01', slug: 'pr-01-bundle', price: 1000, courseSlugs: ['c1', 'c2'] })]

    expect(promosOf({ seasonal: [], evergreen: [{ kind: 'set-savings', name: 'ซื้อเป็น SET', desc: '' }] }, undefined, noSaving)).toEqual([])
  })

  it('lets an evergreen promo contact the admin with its own value', () => {
    const [card] = promosOf({ seasonal: [], evergreen: [{ kind: 'contact', name: 'ชวนเพื่อนเรียน', value: '100.-', desc: 'ลดทั้งคุณและเพื่อน' }] })

    expect(card).toMatchObject({ value: '100.-', contactItem: { kind: 'promo', title: 'ชวนเพื่อนเรียน' } })
  })
})
