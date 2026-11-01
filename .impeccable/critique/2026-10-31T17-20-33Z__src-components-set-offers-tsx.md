---
target: SetOffers หน้าคอร์ส
total_score: 19
max_score: 32
na_heuristics: 7,9
p0_count: 0
p1_count: 2
target_identity: "file:D:\\SpinePeak\\SpinPeak-frontend\\src\\components\\set-offers.tsx"
target_fingerprint: "sha256:2810e5dd02f4f433c2a2d7ccd529400a17e62c2f2d254fc7cd74121d9228cf95"
target_path: "D:\\SpinePeak\\SpinPeak-frontend\\src\\components\\set-offers.tsx"
timestamp: 2026-10-31T17-20-33Z
slug: src-components-set-offers-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score (SetOffers หน้าคอร์ส)
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | hover lift ใช้ได้ |
| 2 | Match System / Real World | 2 | บอกแค่ประหยัดเป็นบาท ไม่บอกว่าจ่ายเพิ่มเท่าไรได้อะไร; "คุ้มกว่า" ทั้งที่ลด 10.- |
| 3 | User Control and Freedom | 3 | |
| 4 | Consistency and Standards | 2 | การ์ด featured ใบเดียวที่ไม่มีหัว ink + SetCoverFan ตาม DESIGN.md; title 20/600 แทน 22/700; tagline muted แทน ink-soft |
| 5 | Error Prevention | 2 | ไม่บอกว่ามีคอร์สอะไรใน SET |
| 6 | Recognition Rather Than Recall | 2 | ต้องจำราคาคอร์สจากการ์ดราคาข้างบนมาคิดเอง |
| 7 | Flexibility and Efficiency | n/a | รายการ 2 ใบ |
| 8 | Aesthetic and Minimalist Design | 3 | สะอาด แต่ปุ่มเต็มกว้างซ้ำกับลิงก์ทั้งใบ |
| 9 | Error Recovery | n/a | |
| 10 | Help and Documentation | 2 | ไม่อธิบายว่า SET คืออะไร |
| Total | | 19/32 | Acceptable (59%) |

## Priority Issues
- [P1] "ซื้อเป็น SET คุ้มกว่า" แสดงกับ SET ที่ลดแค่ 10.-/20.- (1%) · setSavings ซ่อนเมื่อ <=0 เท่านั้น ขัด PRODUCT.md
- [P1] ไม่บอกว่าจ่ายเพิ่มเท่าไรได้คอร์สอะไรเพิ่ม · ไม่มี %
- [P2] ขอบดำเด่นเพราะเป็นเส้น ink เส้นเดียวรอบกล่องสีจาง ไม่มีหัว ink ตาม DESIGN.md (เส้น 1.5px ถูกปัดเป็น 1px ใน Chrome) · คอนทราสต์ขอบ 14.9:1 เทียบการ์ดข้างเคียง 1.2:1
- [P2] eyebrow ภาษาไทยเป็น font-mono ช่องว่างกว้างผิดกฎ "Mono Is For Labels"
- [P3] ปุ่ม "ดู SET นี้" เต็มกว้างซ้ำกับการ์ดที่กดได้ทั้งใบ กินที่ ~60px/ใบบนมือถือ

## Detector
CLI exit 0, 1 advisory (text-[28px] ราคา — DESIGN.md ระบุ 28px ไว้แล้ว = false positive). Overlay: ai-color-palette บน dot texture = false positive.
