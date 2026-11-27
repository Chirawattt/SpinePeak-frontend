# โปรโมชันแบบสไลด์เต็มใบ (short design)

## Intent
Redesign the landing-page promotion section: one promo fills the whole card, as a carousel, with `<` `>` buttons inside the card. A slide shows the owner's banner image when there is one, otherwise a designed text card.

## Approaches
1. **New `PromoCarousel` using native scroll-snap (picked).** Swipe comes from the browser; arrows, dots and autoplay are a small client component. The shared `Carousel` (reviews, clips) is left alone.
2. Add a "full card" mode to the shared `Carousel`. Less duplication of the autoplay timer, but its header arrows, gap maths and touch-hiding all need branches, and other sections can break.
3. A carousel library (e.g. Embla). New dependency for a few slides.

## Design
- Section keeps the "โปรโมชัน" heading, `#promo` anchor and hide-when-empty rule. Same order: seasonal first, then evergreen.
- Card spans the content width, rounded 22px, fixed height per breakpoint (all slides equal).
- Arrows: round buttons over the left and right edges, vertically centred, **visible on phones too**. Dots at the bottom show the position and are clickable. With one promo, no arrows or dots.
- Arrows wrap from last to first. Swipe still works.
- Autoplay every 6s (was 4s, too short to read a poster). Pauses on hover, touch or focus; off with reduced motion.
- Text slides: big type on brand colours (seasonal on ink with countdown, set-savings on brand wash, contact on white). Clicking the slide does what it does today (internal link or LINE).
- Image slides: the whole image is the link; the promo name is its accessible label and alt text. A seasonal image slide still hides itself after `endsAt`.

## Content
Each promo in `content/site.json` gets two optional fields, files in `public/`:
- `image`: wide banner, 3:1, suggested 2400×800
- `imageMobile`: tall banner, 4:5, suggested 1080×1350

Without `imageMobile`, phones show the wide image whole (letterboxed on ink), never cropped.

## Non-goals
Sheet-sync columns for the images, an image upload tool, video slides, changes to other carousels.

## Left to the builder
Exact heights, type sizes, dot and arrow styling, within DESIGN.md.
