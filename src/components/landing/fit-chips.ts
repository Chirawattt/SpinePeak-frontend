// คำนวณว่าชิปวางได้กี่อันภายในจำนวนบรรทัดที่กำหนด แบบเดียวกับ flex-wrap (วางต่อกันซ้ายไปขวา เต็มแล้วขึ้นบรรทัดใหม่)
// แยกออกมาเป็นฟังก์ชันล้วน จะได้ test ได้โดยไม่ต้องมีเบราว์เซอร์

/**
 * จำนวนชิปที่แสดงได้ (นับจากซ้าย) ภายใน rows บรรทัด
 * วางครบทุกอันได้ คืนจำนวนทั้งหมด (ไม่ต้องมีชิป "+N") · ไม่ได้ คืนจำนวนที่วางได้พร้อมเว้นช่องท้ายไว้ให้ชิป "+N"
 * widths = ความกว้างของชิปแต่ละอัน · plusWidth = ความกว้างของชิป "+N" · gap = ระยะห่างระหว่างชิปทั้งแนวนอน
 */
export function countChipsThatFit(widths: number[], plusWidth: number, rowWidth: number, { rows = 2, gap = 8 } = {}): number {
  const fits = (count: number) => {
    const placed = widths.slice(0, count)
    if (count < widths.length) placed.push(plusWidth)
    let row = 1
    let x = 0
    for (const w of placed) {
      const next = x === 0 ? w : x + gap + w
      if (next <= rowWidth || x === 0) {
        x = next
        continue
      }
      row += 1
      x = w
      if (row > rows) return false
    }
    return true
  }

  for (let count = widths.length; count > 0; count--) {
    if (fits(count)) return count
  }
  return 0
}
