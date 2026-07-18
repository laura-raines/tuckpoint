# CLAUDE.md — Tuckpoint marketing homepage

Scope: the marketing homepage at route `/` ONLY. The app (dashboard, timeline, onboarding, Seller's Packet generation) is already built — do not touch `/app` routes, shared components, or the app's design tokens. This file plus the approved mockup are the complete spec.

**Source of truth:** `design/tuckpoint-home.html` in this repo is the approved mockup for layout, copy, and the shader. Port it faithfully into Next.js; do not redesign, "improve," or restructure it.

## Design tokens

Base tokens shared with the app (reference only — should already exist):

```
--ink:      #1F2A3D   /* text, structure */
--ink-soft: #46536B
--card:     #FFFDF8
--line:     #DCD4C2
--track:    #EAE3D2
--muted:    #79715F
--stamp:    #B3372E   /* money/attention ONLY */
--filed:    #5E7255   /* confirmations ONLY */
--filed-bg: #EDF1E7
```

Homepage-only additions (marketing is deliberately warmer than the app):

```
--paper:      #F8F3E9   /* warmer than app paper */
--paper-deep: #F1EADB
--brick:      #9E3B2A   /* BRAND accent: kicker, hovers, price tags, logo mark */
--brick-bg:   #F7E7E2
```

Rules:
- Brick is the *brand* accent; stamp is the *money* accent. Different reds on purpose — never merge or substitute one for the other.
- Fonts: Zilla Slab (display), **Source Serif 4** (homepage body — do NOT let it leak into app routes, which use Public Sans), IBM Plex Mono (every date, dollar, address, and label).
- Light mode only. No shadows except the flat offset "paper stack" shadow on the document mock.

## Hero

- Centered column, in order: mono kicker → large logo signature → subhead → address-input CTA.
- Kicker: "The building's memory · for Chicago's self-managed condos" — uppercase, tracked, brick. The kicker permanently owns the "what is this" job because the H1 is the wordmark. Never remove it.
- Logo signature: 2×2 brick-grid mark (cells: brick / ink / ink / brick, 2px radius, up to 72px) beside "Tuckpoint" in Zilla Slab 600 at clamp(56px, 9vw, 104px). The same mark appears small in the nav — hero and nav are the only two placements.
- Subhead: "The shared record for two-, three-, and six-flats with no property manager — what's been done, what's due next, what each owner's share will be, and the Seller's Packet the day anyone sells."
- Address CTA: bordered input group, mono placeholder "2847 W PALMER ST", attached ink button "Find my building", mono footnote "We start with Chicago's public permit records — the city already knows your roof." Routes into the app's existing onboarding flow.

## WebGL "kiln" shader (hero background)

Port the fragment shader from the mockup into a client component (`<KilnCanvas/>`):
- fbm-noise horizontal strata drifting slowly (sediment/brick-course feel), palette limestone cream → sand → terracotta → ember, paper-grain overlay, subtle pointer-following warmth, bottom half dissolving into `--paper` via a veil gradient so hero and page read as one material.
- Engineering requirements: `prefers-reduced-motion` → render a single static frame (no RAF loop); no WebGL → warm CSS gradient fallback; cap devicePixelRatio at 1.75; cancel RAF and release the context on unmount.
- Raw WebGL, ~80 lines of GLSL as in the mockup. No three.js, no additional scenes, no parallax, no scroll-jacking. One shader, one page.

## Page sections (numbered, in this order, each with a mortar-line header — 2px solid ink bottom border, section number right-aligned in mono)

1. **01 — City records.** Permit-import reveal. Two columns: copy ("Type your address. We do the archaeology.") + permit card listing dated entries with mono dates/costs; city-sourced rows get a small "found in city records" tag in filed green.
2. **02 — Capital timeline.** Full CSS timeline demo obeying every app timeline rule: solid ink bars = documented (ink-soft for older), dashed-border bars = projected windows shown as RANGES ("'28–31", never a single year), near-term projection = stamp dashed + brick-bg fill, hatched 45° bar = honest gap ("no permit record — add date"), 1.5px stamp today-rule with tiny label. Verbatim disclaimer below: "A projection from public records and typical lifespans — not an inspection."
3. **03 — Funding math.** Three-cell ledger grid (hairline-separated): projected cost (stamp, "~$22,000") → building's policy ("50 / 50") → per-unit result ("$95/mo · ~$3,740 total"). Closing slab line: "Every projection becomes your number — so the big repair arrives as a plan, never an ambush."
4. **04 — Seller's Packet.** Paper document mock (white, flat paper-deep offset shadow): title "Section 22.1 Disclosure Statement," statutory line items with mono statuses (ON FILE / CURRENT / COMPUTED / $14,200 / FY 2025 / NONE), mono stampline with generation timestamp + "Not legal advice." Beside it, copy leading with the 10-business-day statutory deadline. Price tag: "$149–249 per packet · paid by the selling owner." Copy MUST frame the packet as generated from the live record — never as an exported folder of stored documents.
5. **05 — Pricing.** Header: "Priced under the 'call a meeting' threshold." Two cards: **The Building Record** — $50/building/year, featured with 1.5px ink border, bullets (permit auto-import, capital timeline, funding policy + per-unit math, decisions/votes surviving turnover, vault + digest); **Seller's Packet** — $149 when a unit sells, bullets (complete §22.1 structure, computed expenditures, timestamped affirmations, honest gap page).

Footer: paper-deep, 2px ink top rule; small mark + wordmark, "The building's memory. Chicago, IL.", and in mono: "Built on Chicago open data" / "Prepared from association records · Not legal advice" / copyright.

## Buttons and nav (usability spec — learned the hard way)

- Nav: fixed, ≥94% opaque paper background with blur, hairline bottom border. Links in Zilla Slab; hover to brick.
- Primary button: SOLID hardcoded fills (never inherit translucency from a blurred parent) — ink #1F2A3D fill, paper #FBFAF7 text, Zilla Slab 600, 12px/22px padding, 5px radius, 1.5px ink border. Hover: brick fill + 1px translateY lift — the state change must be unmistakable. `:focus-visible`: 3px brick outline, 2px offset. Ghost variant: transparent, ink text, paper-deep hover, no lift.

## Copy voice

Plain language first; statute as secondary text. Mono for anything that is data. No exclamation points, no "simply/just/easy," sentence case everywhere (labels may be uppercase). Red only ever means money or attention — including in marketing.

## Don'ts

- Don't restyle the H1 — it is the wordmark, full stop. No italic-brick words, no taglines inside it.
- Don't add sections, testimonials, logos, or feature grids not listed above.
- Don't let Source Serif 4, the warm paper, or brick tokens leak into app routes.
- Don't ship any uncached/unthrottled effect that could jank the demo laptop — the shader is the only animation on the page.
