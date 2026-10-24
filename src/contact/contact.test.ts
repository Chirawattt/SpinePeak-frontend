import { describe, expect, it } from 'vitest'
import { testSite } from '@/catalog/test-content'
import { createContact } from './contact'

const site = testSite({
  contact: {
    ...testSite().contact,
    line: { basicId: '@592omrxb', prefillTemplate: 'สนใจ {itemTitle} ครับ/ค่ะ' },
    facebook: { pageId: 'AlizBiotutor', url: 'https://www.facebook.com/AlizBiotutor' },
  },
})
const { contactHref } = createContact(site)

const course = { kind: 'course', slug: 'primary-science-p4', title: 'เนื้อหาประถม ป.4' } as const
const set = { kind: 'set', slug: 'primary-p4-bundle', title: 'วิทยาศาสตร์ ป.4 เนื้อหา + ตะลุยโจทย์' } as const

/** ข้อความตั้งต้นที่ LINE จะเติมให้ในช่องแชท */
function linePrefill(href: string) {
  const url = new URL(href)
  return decodeURIComponent(url.search.slice(1))
}

describe('contactHref()', () => {
  it('opens a chat with the LINE OA', () => {
    const url = new URL(contactHref(course, 'line'))

    expect(url.origin).toBe('https://line.me')
    expect(url.pathname).toBe('/R/oaMessage/%40592omrxb/')
  })

  it('prefills the LINE message with the course title', () => {
    expect(linePrefill(contactHref(course, 'line'))).toBe('สนใจ เนื้อหาประถม ป.4 ครับ/ค่ะ')
  })

  it('prefills the LINE message with the set title', () => {
    expect(linePrefill(contactHref(set, 'line'))).toBe('สนใจ วิทยาศาสตร์ ป.4 เนื้อหา + ตะลุยโจทย์ ครับ/ค่ะ')
  })

  it('opens LINE without a prefilled message when no course or set is chosen and site.json has no general message', () => {
    expect(contactHref(undefined, 'line')).toBe('https://line.me/R/oaMessage/%40592omrxb/')
  })

  it('prefills the general message from site.json when no course or set is chosen', () => {
    const { contactHref } = createContact(
      testSite({ contact: { ...site.contact, line: { ...site.contact.line, generalPrefill: 'สนใจสอบถามคอร์สเรียนครับ/ค่ะ' } } }),
    )

    expect(linePrefill(contactHref(undefined, 'line'))).toBe('สนใจสอบถามคอร์สเรียนครับ/ค่ะ')
    expect(linePrefill(contactHref(course, 'line'))).toBe('สนใจ เนื้อหาประถม ป.4 ครับ/ค่ะ')
  })

  it('tells the Facebook page which course the chat came from', () => {
    const url = new URL(contactHref(course, 'facebook'))

    expect(url.origin + url.pathname).toBe('https://m.me/AlizBiotutor')
    expect(url.searchParams.get('ref')).toBe('course_primary-science-p4')
  })

  it('tells the Facebook page which set the chat came from', () => {
    expect(new URL(contactHref(set, 'facebook')).searchParams.get('ref')).toBe('set_primary-p4-bundle')
  })

  it('opens Messenger without a ref when no course or set is chosen', () => {
    expect(contactHref(undefined, 'facebook')).toBe('https://m.me/AlizBiotutor')
  })
})
