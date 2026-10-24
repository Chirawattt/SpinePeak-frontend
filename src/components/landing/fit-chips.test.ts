import { describe, expect, it } from 'vitest'
import { countChipsThatFit } from './fit-chips'

// แถวกว้าง 300 · ช่องห่าง 8 · ชิป "+N" กว้าง 40
const fit = (widths: number[]) => countChipsThatFit(widths, 40, 300)

describe('countChipsThatFit()', () => {
  it('shows every chip, with no +N, when they all fit in two rows', () => {
    // แถว 1: 140 + 8 + 140 = 288 · แถว 2: 140
    expect(fit([140, 140, 140])).toBe(3)
  })

  it('makes room for a +N chip at the end of the second row when they do not all fit', () => {
    // วางครบต้องใช้สามแถว · 3 อันแรก + "+N": แถว 1 = 288 · แถว 2 = 140 + 8 + 40 = 188
    expect(fit([140, 140, 140, 140, 140])).toBe(3)
  })

  it('drops one more chip when the +N chip would not fit beside the last one', () => {
    // 3 อัน + "+N": แถว 2 = 260 + 8 + 40 = 308 เกิน จึงเหลือ 2 อัน แล้ว "+N" ขึ้นแถว 2
    expect(fit([140, 140, 260, 100])).toBe(2)
  })

  it('still places a chip wider than the row on a row of its own', () => {
    expect(fit([320])).toBe(1)
  })

  it('returns 0 for no chips', () => {
    expect(fit([])).toBe(0)
  })
})
