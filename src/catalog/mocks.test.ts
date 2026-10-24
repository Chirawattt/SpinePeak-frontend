import { describe, expect, it } from 'vitest'
import { catalog } from '.'
import { createCatalog } from './catalog'
import { testContent, testSite } from './test-content'

const real = { id: 'r1', quote: 'คุ้มมากครับ', studentName: 'น้องเจได', grade: 'ม.4' }
const mockByName = { id: 'r2', quote: 'ปลอม', studentName: 'น้องมายด์ (mock)', grade: 'ม.5' }
const mockById = { id: 'mock-poon', quote: 'ปลอม', studentName: 'น้องปูน', grade: 'ม.6' }

const site = testSite({
  promos: {
    seasonal: [
      { name: 'โปรเปิดเทอม (mock)', headline: ['โปรเปิดเทอม'], detail: '', endsAt: '2999-01-01T00:00:00+07:00' },
      { name: 'โปรสงกรานต์', headline: ['โปรสงกรานต์'], detail: '', endsAt: '2999-01-01T00:00:00+07:00' },
    ],
    evergreen: [{ kind: 'contact', name: 'ชวนเพื่อนเรียน (mock)', value: '100.-', desc: 'ลดทั้งคุณและเพื่อน' }],
  },
})
const content = testContent({ site, reviews: [real, mockByName, mockById] })

describe('mock reviews and promos', () => {
  it('are left out by default, along with the reviews menu link when nothing real is left', () => {
    const landing = createCatalog(testContent({ site, reviews: [mockByName, mockById] })).landing()

    expect(landing.reviews).toEqual([])
    expect(landing.nav.map((l) => l.href)).not.toContain('/#reviews')
    expect(landing.promos.map((p) => p.name)).toEqual(['โปรสงกรานต์'])
  })

  it('keep the real ones', () => {
    expect(createCatalog(content).landing().reviews.map((r) => r.name)).toEqual(['น้องเจได'])
  })

  it('show when asked for, so the layout can be previewed in next dev', () => {
    const landing = createCatalog(content, { showMocks: true }).landing()

    expect(landing.reviews).toHaveLength(3)
    expect(landing.promos.map((p) => p.name)).toEqual(['โปรเปิดเทอม (mock)', 'โปรสงกรานต์', 'ชวนเพื่อนเรียน (mock)'])
  })

  it('never reach the site outside next dev', () => {
    const { reviews, promos } = catalog.landing()

    expect(reviews.map((r) => r.name).filter((n) => n.includes('(mock)'))).toEqual([])
    expect(promos.map((p) => p.name).filter((n) => n.includes('(mock)'))).toEqual([])
  })
})
