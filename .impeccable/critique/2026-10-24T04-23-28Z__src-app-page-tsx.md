---
target: หน้าแรก (landing) รอบ 2
total_score: 25
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 3
target_identity: "file:D:\\SpinePeak\\SpinPeak-frontend\\src\\app\\page.tsx"
target_fingerprint: "sha256:3a34353a002ff715902659a673a8030e650da4467532ea4f4968f7a081a7538e"
target_path: "D:\\SpinePeak\\SpinPeak-frontend\\src\\app\\page.tsx"
timestamp: 2026-10-24T04-23-28Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

# Critique round 2: Spine Peak landing (src/app/page.tsx), 25/36 (69%, Acceptable, near Good). Round 1 was 20/36.

| # | Heuristic | R1 | R2 | Key issue |
|---|---|---|---|---|
| 1 | Visibility | 2 | 3 | Contact buttons don't say they open LINE |
| 2 | Real world | 3 | 3 | "คอร์สขายดี" holds only SETs; "ติวเตอร์" in hero |
| 3 | Control | 2 | 3 | External links open new tabs; carousel pauses |
| 4 | Consistency | 2 | 2 | SET card details button is dark (DESIGN reserves dark for contact); 4 admin labels; duplicate "ดู SET ทั้งหมด" |
| 5 | Error prevention | 2 | 3 | Mocks stripped in production; arrows hide with one card |
| 6 | Recognition | 2 | 3 | Groups show counts; SET cards don't say which grade |
| 7 | Flexibility | n/a | n/a | Single-purpose persuade page |
| 8 | Minimalist | 3 | 2 | Mobile hero ~1840px, teacher photo twice; repeated "ไม่จำกัดอายุ" |
| 9 | Error recovery | 2 | 3 | LINE in footer; general prefill |
| 10 | Help | 2 | 3 | ContactNote answers cost/choice/payment at the CTA |

Detector: exit 0, 20 advisory (19 font-size: recurring 17/22/26/28px → document in DESIGN.md; #000 mask false positive). Browser /: 2 dot-grid false positives. /courses, /sets: placeholder 3.1:1, h1→h3 skips, strike 3.9:1 on /sets cards, straggler, placeholder stripes.

## Priority issues
- [P1] Production promo strip is a single orphan "−51%" card with duplicate link. Fix: hide strip when no seasonal and ≤1 evergreen; move "ประหยัดสูงสุด 51%" to featured header. /impeccable distill
- [P1] GroupEntry shows 19 options (3 groups + 15 chips + admin). Fix: groups first, reveal categories per group, or 3 chips + "+N". /impeccable distill
- [P1] Contact buttons lost emphasis: SET details buttons use dark (contact) style; nothing says LINE. Fix: brand/outline for details, dark only for contact, LINE cue. /impeccable polish
- [P2] Mobile hero too long, teacher photo duplicated, first price ~2250px. Fix: small avatar or hide hero photo below md. /impeccable adapt
- [P2] SET cards don't say who they're for; Biocontest tagline repeats title. Fix: group·category line (not an eyebrow above heading), better taglines. /impeccable clarify

## Persona red flags
Parent: price ~2250px down, credentials in prose, no what-you-get on page, "ติวเตอร์". Jordan: SET unexplained, best-sellers only SETs, no LINE cue. Casey: floating button covers "สวช." chip, blends into blue band, 3 screens to first price. Riley: 4s autoplay with one card, 3-line titles, countdown blank pre-hydrate.

## Minor
Hard-coded "44 คอร์ส" stat; stats wrap 2+1 on mobile; band repeats lifetime claim; "แนะนำครู" mono eyebrow on Thai; small header logo on mobile.

## Questions
Grade → SET entry instead of 44 courses? Real proof artifact before reviews? Hero CTA "ให้แอดมินช่วยเลือก"?
