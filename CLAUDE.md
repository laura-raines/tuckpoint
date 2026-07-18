# CLAUDE.md — Tuckpoint

Hackathon build. Read this whole file before writing any code. When in doubt, ask Laura rather than inventing — especially on design tokens, copy voice, and anything touching the §22.1 document.

## What we're building

Tuckpoint is the operating system for Chicago's self-managed condo buildings (2–12 unit associations with no property manager). It is the building's memory (maintenance + permit history), its clock (capital timeline with projected replacement windows and per-owner cost shares), and its meeting room (decisions, votes, documents). The payoff feature: one-click generation of the Illinois Section 22.1 resale disclosure package as a professional PDF.

Business model (context, not weekend scope): $50/building/year subscription (association is the customer of record) + $149–249 per disclosure package (paid by the selling owner).

**Positioning rule that affects copy:** never describe this as "HOA management software." It is the building's record. Come for the roof clock, stay for everything.

## Weekend scope (build EXACTLY this, resist everything else)

Demo arc, in order:
1. Type a Chicago address → building permits auto-import from the city's open data → "we found your roof (2014) and masonry (2008) in city records" → steward confirms with one click ("the city already knew your building").
2. Confirmation lands DIRECTLY on the reveal, not a blank dashboard: capital timeline pre-populated — documented history + projected windows + one honest gap (porch, unknown) — with the 3-year horizon summarized in one sentence up top.
3. Funding math: "$22K masonry projected 2028–2031 → 50% from reserves, unit 2's share ~$3,740 ≈ $95/month starting now."
4. Click **Generate Seller's Packet (§22.1)** → complete disclosure PDF in seconds.
5. Second AI moment: upload a photo/PDF of a contractor invoice → Claude extracts a structured maintenance entry.

Onboarding principle: the app does the work before asking the user for any. Never show an empty registry; the permit import IS the first-run experience.

IN scope: building setup w/ permit import, maintenance/capital log, capital timeline screen, funding policy + per-unit math, §22.1 PDF generation, invoice extraction.
OUT of scope (do not build): auth beyond a fake logged-in steward, payments, email digests, zero-login approval links, meetings module UI (seed decision data directly), disclosure rescue flow, mobile app, dark mode.

## Stack

- **Next.js (App Router) + Tailwind on Vercel.** One repo, `create-next-app`.
- **Firebase:** Firestore for data, Cloud Functions ONLY if genuinely needed — prefer Next.js API routes for the weekend (permit fetch, PDF, Claude calls). Fewer moving parts.
- **Chicago Socrata API** for permits (dataset: Building Permits, data.cityofchicago.org, resource `ydr8-5enu`). Use SoQL `$where` filtering on street number/name. Get a free app token; put it in `.env.local` as `SOCRATA_APP_TOKEN`.
- **@react-pdf/renderer** for the §22.1 PDF (server-side in an API route). Do NOT use Puppeteer.
- **Anthropic SDK** (`claude-sonnet-4-6`) for invoice extraction and the disclosure's narrative paragraphs. Key in `.env.local` as `ANTHROPIC_API_KEY`, never client-side.
- No component libraries (no shadcn, no MUI). Hand-rolled components with the tokens below — the look IS the product.

## Caching rule (demo insurance)

Every external call (Socrata, Claude) goes through a thin wrapper that writes the response to Firestore (`cache/{hash}`) and reads from cache first. The demo must run fully from cache with wifi off. Build this in hour one, not hour twenty.

## Design system — "Ledger × Masonry"

Register: a well-designed public institution. Warm, sturdy, plainspoken. The app should look like the trustworthy legal record it produces.

### Colors (exact values, no substitutes, no Tailwind default palette)

```
--ink:        #1F2A3D   /* primary text, structure, documented history */
--ink-soft:   #46536B   /* secondary fills, older history bars */
--ink-faint:  #C6D0DE   /* text on ink backgrounds */
--paper:      #FBFAF7   /* page background */
--card:       #FFFFFF   /* raised cards */
--line:       #DDD9CF   /* hairline borders */
--track:      #EAE7DE   /* timeline empty track */
--muted:      #77716A   /* secondary text, labels */
--stamp:      #B3372E   /* ONLY: projected costs, money due, action needed */
--stamp-bg:   #FCF1F0   /* tint behind stamp elements */
--filed:      #5E7255   /* ONLY: confirmations — filed, approved, paid, complete */
--filed-bg:   #EFF2EC   /* tint behind filed elements */
```

Color discipline (non-negotiable):
- `stamp` red means money/attention. If red appears, it costs something or needs something. Never decorative.
- `filed` green means done/recorded. Never for CTAs.
- Everything else is ink/paper/muted. The primary button is INK, not red.
- Light mode only this weekend.

### Typography

- **Display/headers:** Zilla Slab (600 for page titles, 500 for section heads). Google Fonts via `next/font`.
- **Body/UI:** Public Sans (400/500).
- **All dates, dollars, percentages, addresses, PINs:** IBM Plex Mono (400/500). This is the signature — data always looks like a record. Use tabular figures.
- Scale: page title 28/600 slab · section 20/500 slab · card head 16/500 slab · body 14.5/400 sans · label 11/500 sans uppercase tracked 0.08em · data 14 mono.
- Sentence case everywhere. Labels may be uppercase (they're labels). Never Title Case.

### Component rules

- Cards: `--card` bg, 0.5–1px `--line` border, 6px radius, 16px padding. No shadows anywhere.
- Structure rules: section headers sit on a 2px solid `--ink` bottom border (the "mortar line"). This is the layout signature — use it consistently, and nowhere else use heavy borders.
- Primary button: ink bg, paper text, 4px radius. Secondary: 1px ink border, transparent. One primary per screen.
- Building header block on every screen: address + units + built year in uppercase Plex Mono, `--muted`.

### The capital timeline (hero screen — build this best)

- Horizontal rows, one per system (Roof, Masonry, Porch, Boiler, Water heater). Row label left (56–90px), track fills remaining width. Years axis on top; a 1.5px `--stamp` vertical rule marks today.
- Documented life: solid bar, `--ink` (most recent work) or `--ink-soft` (older). Label inside: "Roof '14".
- Projected window: dashed 1.5px border bar, transparent or tint fill. Ink dash = far out; stamp dash + `--stamp-bg` fill = within ~5 years. ALWAYS a range ("'28–31"), never a single year — false precision is the enemy.
- Every projection exposes its basis on tap/hover: "Permitted 2014 · modified bitumen · typical life 18–22 yrs".
- **Gap state (first-class, identical everywhere):** unknown data renders as a 45° hatched bar (`repeating-linear-gradient`, `--track`/`--line`) with 1px `--line` border and a plain-language label ("no permit record — add date"). Amber-free, alarm-free, honest. Same hatch treatment for gaps in the PDF's gap page and any card showing missing info.

### The §22.1 PDF (a second product — do not make it look like the app)

- ink on white, serif body (Zilla Slab headers, a readable serif or Public Sans body), Plex Mono for all figures and dates.
- Cover page: building address, "Section 22.1 Disclosure Statement", generation date/time in mono, "Prepared via Tuckpoint from association records."
- Sections numbered in the Act's own order: (1) Declaration/bylaws/rules [list of docs on file], (2) Liens & unit account, (3) Anticipated capital expenditures (next 2 yrs — pulled from timeline + funding policy, showing approved decisions), (4) Reserve fund status, (5) Receipts & disbursements, (6) Pending suits/judgments, (7) Insurance evidence.
- Unknowns get one graceful "Items pending association confirmation" page — never silently omitted.
- Required footer on every page: "Prepared from records maintained by the association. This document is not legal advice."

### Copy voice

Plain language first, statute underneath: "Money set aside for big repairs" with "(reserve fund — §22.1(a) disclosure)" as secondary text. The disclosure feature is labeled **"Seller's Packet"** with "§22.1 disclosure statement" as its subtitle — but copy must always frame it as GENERATED from the building's live record, never as an exported folder of stored documents. Buttons verb-first ("Generate Seller's Packet", "Add work", "Set funding policy"). The estimate framing sentence, verbatim wherever projections appear: "A projection from public records and typical lifespans — not an inspection." No exclamation points. No "simply/just/easy."

Fallback cost constants when no permit/ZIP data exists (Chicago 2–4 unit ranges): roof $8–15K, boiler $4–8K, tuckpointing $10–30K, porch rebuild $15–40K, water heater $1.5–3K. Always shown as ranges.

## Data model (Firestore)

```
buildings/{buildingId}
  address, streetNumber, streetName, unitCount, yearBuilt, pin
  fundingPolicy: {
    reservePct: 50,            // % of capital cost from reserves
    assessmentPct: 50,         // remainder via special assessment
    allocationMethod: "ownership" | "equal" | "custom"
  }
  reserves: { balance: 14200, asOf: <date> }

buildings/{id}/units/{unitId}
  label ("Unit 1"), ownershipPct (must sum to 100 across units),
  customAllocationPct (only if allocationMethod = custom; must sum to 100),
  ownerName, arrears: 0

buildings/{id}/systems/{systemId}
  name ("Roof"), category, installYear, installSource ("permit" | "manual" | null),
  material, typicalLifeMin, typicalLifeMax, estCostLow, estCostHigh,
  status: "documented" | "unknown",
  lastInspection?, conditionPhotoUrl?, warrantyDocUrl?, lastVendor?
  // registry can include beyond the core five: water heater, sump pump,
  // gutters/downspouts, electrical panel, sidewalk, parking — seed only five for demo

buildings/{id}/events/{eventId}      // ONE collection = the whole timeline
  type: "permit" | "maintenance" | "decision" | "assessment"
  date, systemId?, title, cost?, contractor?, source ("city" | "manual" | "extracted"),
  permitNumber?, docUrl?, decision?: { summary, vote ("3–0"), status: "filed" },
  workStatus?: "requested" | "scheduled" | "done"   // default "done"; full ticket workflow is post-weekend

buildings/{id}/documents/{docId}
  category: "declaration" | "bylaws" | "rules" | "insurance" | "minutes" | "other"
  title, url, uploadedAt

cache/{hash}: { url, response, fetchedAt }
```

Derived (compute in code, don't store): projected window = installYear + [lifeMin, lifeMax]; reserve draw = estCost × reservePct; unit share = (estCost × assessmentPct) × unit allocation; monthly set-aside = unit share ÷ months until window start; reserve pace = balance ÷ Σ(near-term reserve draws) — pace is measured against the POLICY's reserve portion, never the full cost.

## Permit import logic

1. Query Socrata: `$where=street_number='2847' AND street_name like '%PALMER%'`, order by issue_date desc.
2. Map permit types/descriptions to systems via keywords: ROOF→Roof; TUCKPOINT|MASONRY|BRICK→Masonry; PORCH→Porch; BOILER|FURNACE|HVAC→Boiler; ELECTRIC→Electrical. Unmatched permits still become timeline events (type "permit", no systemId).
3. Use `reported_cost` where present; also compute the demo stat "recent masonry permits on 2–4 unit buildings in this ZIP averaged $X" from the same dataset (single aggregation query, cached).
4. Everything imported lands as suggestions the steward confirms — never silently authoritative.

## Claude API usage (two calls, both server-side)

1. **Invoice extraction:** image/PDF in → JSON out `{date, system, title, cost, contractor}` → pre-filled event form the steward confirms. Prompt for JSON-only response; parse defensively.
2. **Disclosure narrative:** given the building's structured data, draft the plain-language paragraphs for sections 3–4 of the PDF. Facts come ONLY from the data provided; instruct the model to write "not on file" for anything missing rather than inventing. Temperature low.

## Seed data

One demo building: "2847 W Palmer St" (verify the real permit response for whatever address we finalize BEFORE Saturday; if weak, pick a better address — test 5 candidates). 3 units at 34/33/33% ownership, funding policy 50/50 ownership-allocated, reserves $14,200, systems: Roof (2014, documented via permit), Masonry (2008, documented), Boiler (2015, serviced 2025), Porch (unknown — the designed gap), plus one filed decision ("2026.05 — Voted 3–0: defer porch inspection to 2027") and one assessment event. Seed script in `scripts/seed.ts`, runnable repeatedly.

## Build order (work top to bottom; each step demoable)

1. Repo, fonts, tokens as Tailwind theme + CSS vars, app shell with building header. Cache wrapper.
2. Seed script + Firestore wiring. Read path only.
3. Capital timeline screen (the hero — spend real time here).
4. Permit import: address form → Socrata → suggestions → confirm into events/systems.
5. Funding policy settings + per-unit math on the timeline ("your share" panel).
6. §22.1 PDF route + document.
7. Invoice extraction flow.
8. Polish pass: empty/gap states, the ZIP cost-average stat, demo walkthrough twice from cache.

If behind schedule, cut from the bottom: 7 first, then 6 becomes a beautifully styled HTML page printed to PDF via the browser. Never cut 3 or 4 — they ARE the demo.

## Hard don'ts

- No dark mode, no responsive heroics (laptop demo), no auth flows, no Stripe.
- No red anywhere except money/attention semantics. No green CTAs. No shadows. No Title Case.
- **No status dots or traffic-light (green/yellow/red) indicators on assets.** Urgency is expressed through the timeline's own semantics: near-term projection → stamp treatment + dollar figure + "What's next" placement. "Your roof is yellow" is banned; "'32–36, ~$18K, reserves 65% on pace" is the product.
- The capital timeline is center stage on the dashboard — asset cards, if any, are a secondary row, never the hero, never horizontal-scroll.
- No single-year projections. No silently-omitted unknowns — every gap is visible and labeled.
- No uncached network calls in the demo path.
- The PDF never claims to be legal advice, an inspection, or an appraisal.

## Post-weekend backlog (recorded so we don't build it now)

- Asset "health card" detail view: condition photo hero, vital stats (install date, expected life, days since inspection), vendor history list, sticky Log Maintenance / Upload Warranty drawer.
- Maintenance ticket workflow UI (requested → scheduled → done) on top of the existing workStatus field.
- Budget vs. actual view (annual budget, monthly dues, expenses, running reserve) — explicitly not full GL accounting.
- Expanded registry systems beyond the demo five.
