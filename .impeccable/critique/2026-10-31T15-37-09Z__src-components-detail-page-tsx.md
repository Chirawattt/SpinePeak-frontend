---
target: PriceCard หน้า course-detail
total_score: 26
max_score: 36
na_heuristics: 9
p0_count: 0
p1_count: 2
target_identity: "file:D:\\SpinePeak\\SpinPeak-frontend\\src\\components\\detail-page.tsx"
target_fingerprint: "sha256:99d367d61053502fb0a4b7c527758fe5119171534c131f6aeb3d45dee953137f"
target_path: "D:\\SpinePeak\\SpinPeak-frontend\\src\\components\\detail-page.tsx"
timestamp: 2026-10-31T15-37-09Z
slug: src-components-detail-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

## Design Health Score (PriceCard หน้าคอร์ส)
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | ContactNote บอกว่าจะเปิด LINE |
| 2 | Match System / Real World | 4 | ภาษาไทยเป็นธรรมชาติ |
| 3 | User Control and Freedom | 3 | |
| 4 | Consistency and Standards | 2 | ช่องปุ่มรองมีสองความหมาย (คลิป / Messenger); SET ใช้ปุ่มในหน้าเสมอ |
| 5 | Error Prevention | 3 | |
| 6 | Recognition Rather Than Recall | 3 | |
| 7 | Flexibility and Efficiency | 3 | ContactBar ลอยช่วย |
| 8 | Aesthetic and Minimalist Design | 2 | "ไม่จำกัดอายุ"/"PDF" ซ้ำ 3 ที่; ปกซ้ำกับ thumbnail คลิปบนเดสก์ท็อป |
| 9 | Error Recovery | n/a | ไม่มี error state |
| 10 | Help and Documentation | 3 | |
| Total | | 26/36 | Good (72%) |

## Priority Issues
- [P1] COURSE_BULLETS ซ้ำกับบรรทัดใต้ราคาและแถวตัวเลข: ตัด bullets, รวม "เรียนได้ทั้งคอมและมือถือ" เข้าบรรทัดใต้ราคา
- [P1] ปุ่มรองมีสองความหมาย: คอร์สมีคลิป = ดูคลิป, ไม่มีคลิป = Messenger แข่งกับปุ่มหลัก
- [P2] ปุ่ม "ดูคลิปตัวอย่างฟรี" ซ้ำบนเดสก์ท็อป (คลิปอยู่ข้างการ์ด) แต่จำเป็นบนมือถือ (คลิปอยู่ต่ำกว่าจอแรก ~360px): lg:hidden
- [P2] ความยาวการ์ดจริงมาจากปก (174–245px) ไม่ใช่ bullets (108px)
- [P3] bullets ไม่มี marker ดูเป็นข้อความหลุด

## Detector
CLI exit 0, 3 advisory font-size (ไม่ใช่ PriceCard). Overlay: ai-color-palette บน dot texture = false positive.
