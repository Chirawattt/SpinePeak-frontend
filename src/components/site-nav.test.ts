import { describe, expect, it } from 'vitest'
import { isNavActive } from './site-nav'

describe('isNavActive', () => {
  it('ตรงกับหน้านั้นพอดี', () => {
    expect(isNavActive('/courses', '/courses')).toBe(true)
  })

  it('หน้าย่อยนับเป็น active ด้วย', () => {
    expect(isNavActive('/courses', '/courses/c1')).toBe(true)
    expect(isNavActive('/sets', '/sets/pr-01-bundle')).toBe(true)
  })

  it('path ที่ขึ้นต้นเหมือนกันแต่เป็นคนละหน้า ไม่นับ', () => {
    expect(isNavActive('/sets', '/setsx')).toBe(false)
  })

  it('ลิงก์ไปส่วนในหน้าแรกไม่เคย active', () => {
    expect(isNavActive('/#teacher', '/')).toBe(false)
    expect(isNavActive('/#reviews', '/')).toBe(false)
  })

  it('หน้าแรกไม่ทำให้เมนูไหน active', () => {
    expect(isNavActive('/courses', '/')).toBe(false)
  })
})
