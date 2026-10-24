---
target: หน้าแรก (landing)
total_score: 20
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
target_identity: "file:D:\\SpinePeak\\SpinPeak-frontend\\src\\app\\page.tsx"
target_fingerprint: "sha256:35752a3b226b3dde16956656e143b7c4f91a82d9333d13cd08a46ae7a894be56"
target_path: "D:\\SpinePeak\\SpinPeak-frontend\\src\\app\\page.tsx"
timestamp: 2026-10-24T03-27-55Z
slug: src-app-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

# Critique: Spine Peak landing (src/app/page.tsx), 20/36 (56%, Acceptable)

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | CTA doesn't say it opens LINE; promo carousel autoplays 4s without position dots |
| 2 | Match System / Real World | 3 | "ติวเตอร์ชีววิทยา" in hero; "VDO 21 ชม." jargon for parents |
| 3 | User Control and Freedom | 2 | Featured cards' main button jumps to LINE; no detail button |
| 4 | Consistency and Standards | 2 | "สมัครเรียนเลย" vs "ทักแอดมิน" for the same action |
| 5 | Error Prevention | 2 | Generic CTAs send empty LINE prefill; mock content can ship |
| 6 | Recognition Rather Than Recall | 2 | No grade/exam entry on the landing page |
| 7 | Flexibility and Efficiency | n/a | Single-purpose persuade page |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; "ไม่จำกัดอายุ" repeated 4 times |
| 9 | Error Recovery | 2 | No fallback without LINE app; LINE missing from footer contacts |
| 10 | Help and Documentation | 2 | howToApply hidden in footer dialog, not near CTA |

## Design specificity
Visual layer specific (microscope dots/rings, masked Kru Nam, SET cover stacks, real prices). Page skeleton generic (hero → promos → featured → teacher → reviews → band). Missing the defining move: grade/exam entry (site.goalCards only used on /courses).
Detector: exit 0; 20 advisory (19 design-system-font-size, mostly undocumented 17px; 1 design-system-color #000 mask in hero.tsx:11, false positive). Browser: ai-color-palette dot grids (false positive), strike price 2.3:1, placeholder 3.1:1, skipped headings h1→h3 on /courses and /sets, straggler on /sets hero.

## Priority issues
- [P1] No grade/exam entry on landing. Fix: group chips + site.goalCards under hero, linked to filtered /courses; above photo on mobile. /impeccable layout
- [P1] Mock reviews and promos rendered live, no empty-state design. Fix: empty reviews.json (catalog hides section + nav), real-evidence placeholder, dev-only mocks. /impeccable harden
- [P2] Contact CTAs inconsistent, no reassurance, empty prefill, no LINE in footer. Fix: "ทักแอดมินเพื่อสมัคร" everywhere, microline "ถามได้ฟรี · แอดมินช่วยเลือกคอร์สให้ · จ่ายในแชท", generic prefill, LINE in footer. /impeccable clarify
- [P2] Featured cards skip detail; struck price 2.3:1; savings in 12px mono. Fix: primary "ดูรายละเอียด", secondary "ทักแอดมิน", large savings chip, strike >= 3:1. /impeccable distill
- [P3] Mobile rhythm: hero photo pushes products below fold, nav targets ~20px, floating button covers links, carousel no dots (already pauses on interaction, carousel.tsx:55). /impeccable adapt

## Persona red flags
- Parent: "สมัครเรียนเลย" feels like commitment; no how-to-buy near CTA; small mono and faint prices; teacher bio 4 screens down.
- Jordan: hero says only biology; can't map "ม.2 → สอบเข้า ม.4"; opaque facts.
- Casey: no product in first 360px viewport; tiny nav; floating button covers links.
- Riley: mock content visible; no LINE fallback; 3-line SET titles.

## Minor
"คอร์สขายดี" holds only SETs; teacher section dead end; verify "ถามได้ตลอดคอร์ส"; hero badge omits teacher-exam and chem/physics; -51% promo second in carousel; Thai in mono falls back small; 17px missing from DESIGN.md.

## Questions
Hero as grade picker? CTAs promising advice instead of purchase? Prove quality with real PDF page / real worked exam question instead of reviews?
