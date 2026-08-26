# ADR-001: Static bilingual one-page site with parse-time date filtering

**Status:** accepted
**Date:** August 2026
**Source:** [`docs/superpowers/specs/2026-08-26-sandu-pottery-lavori-in-corso-design.md`](../superpowers/specs/2026-08-26-sandu-pottery-lavori-in-corso-design.md) (Task 001)

## Context

`sandupottery.com` was serving a Cloudflare `error 1001` page. The client's Shopify
store had been cancelled; the DNS zone at Aruba still pointed the apex at
Shopify's IP and `www` at `shops.myshopify.com`, neither of which resolved to a
live store any more. The client is actively handing out business cards at craft
markets and needs the domain to answer with *something* before the next market
(19–20 September 2026), well before the permanent showcase site — which needs
her sustained involvement and time she does not currently have — can exist.

This ADR records the decisions that shape the whole repo, not just one of them,
because they are load-bearing for each other: the static-export choice forces
the routing choice, which forces the freshness-filtering choice.

## Decision 1: Fully static export (`output: "export"`)

There is no server, no middleware, no API route, and no scheduled rebuild
workflow. The site is Next.js App Router compiled to static files and served
from Cloudflare Pages.

Reasoning, from spec §10 ("Technical architecture"):

> Mirrors the STST `lite-site` repo, which the same author built and deploys the
> same way.

| Layer | Choice |
| --- | --- |
| Runtime / package manager | Bun |
| Framework | Next.js (App Router), `output: "export"` |
| Styling | Tailwind CSS v4 via PostCSS, CSS-first `@theme` tokens |
| Fonts | `next/font/local`, self-hosted woff2 |
| Lint + format | Biome (no ESLint, no Prettier) |
| Git hooks | Lefthook — pre-commit, commit-msg, pre-push |
| Commits | commitlint, conventional commits |
| Versioning | release-please |
| Container | Dockerfile (multi-stage, nginx) + devcontainer |
| CI | GitHub Actions — `ci.yml` on dev/PR, `release.yml` on main |
| Hosting | Cloudflare Pages via `cloudflare/wrangler-action` |

### Deliberate deviations from STST, verbatim from spec §10

> - **No Framer Motion.** STST needs it for layout cycling; this page needs one
>   gentle fade-up. CSS handles it at a fraction of the bundle.
> - **No scheduled rebuild workflow.** See §7.
> - **`docs/brand.md` added** — this project has a real brand system to record,
>   which STST did not.

The "See §7" cross-reference is doing real work: a naive fix for a static site's
stale content is a cron-triggered rebuild. That was considered here and rejected
— see Decision 3 below for why.

### Consequences

- No backend means no contact form; `mailto:` only, and no CMS — content
  changes are a commit. Both are explicit non-goals in spec §2.
- Deploys are cache-friendly and cheap, and the failure surface (server crash,
  cold start, DB outage) that a dynamic site would carry does not exist here.
- Anything that would normally run server-side at request time (the freshness
  filter, most obviously) has to run client-side instead — this is the root
  cause of Decision 3.

## Decision 2: Two concrete routes (`/`, `/en`), not a `[locale]` segment

From spec §6 ("Information architecture › Language routing"):

> `/` is Italian; `/en` is English. Implemented as two concrete routes sharing
> one component and a typed dictionary — not a `[locale]` dynamic segment, and
> not a redirect from `/`, since middleware does not run under `output: 'export'`
> and a meta-refresh hop is worse for the primary Italian audience.
>
> `alternates.languages` supplies `hreflang`; both routes appear in the sitemap.

This follows directly from Decision 1: a `[locale]` segment with middleware-based
negotiation is the conventional Next.js i18n pattern, but middleware does not run
under static export, so it was never actually available here. The remaining
options were a client-side redirect (a visible hop, and a bad one for the
majority Italian audience who should never see it) or two plain routes sharing
one component (`src/components/Pagina.tsx`) and one typed dictionary
(`src/content/dizionario.ts`). The two-route approach was chosen because it is
simplest, requires no negotiation logic at all, and costs nothing extra: both
routes are pre-rendered anyway.

### Consequences

- Adding a third language means a third route file plus a third locale in
  `Dizionario`, not a routing change.
- `hreflang` and sitemap entries are static and trivially correct — there is no
  runtime negotiation to get wrong.
- **`<html lang>` is `"it"` on both routes.** `/en` is a nested layout
  (`src/app/en/layout.tsx`) that wraps its content in `<div lang="en">`
  rather than a second root `<html>` — the App Router only emits one `<html>`
  per route tree here, and the shared root layout owns it. Content inside the
  `/en` page correctly inherits `lang="en"` for assistive tech, so the
  practical gap is narrower than it sounds: it's the document-level signal —
  `<head>` and crawler/browser language detection — that stays Italian on the
  English route. Fixing this properly means route groups with independent
  root layouts, which touches the same page tree that
  `ScriptFreschezza.tsx`'s placement depends on (Decision 3) — not a change
  to make under this deadline for a cosmetic SEO/a11y gap. Accepted as a
  known trade-off; candidate fix for the permanent site.

## Decision 3: Parse-time inline script for date filtering, not React

This is the decision with the most failed alternatives behind it, and the one
most worth reading in full before touching `src/components/ScriptFreschezza.tsx`.

### The problem

From spec §7 ("Freshness — the staleness problem"):

> A static page built today will show "19–20 settembre" in November. The site is
> rebuilt only on push, so build-time filtering alone is insufficient.

A scheduled rebuild (cron-triggered `next build` + redeploy) was considered and
rejected for the reason spec §7 gives directly:

> A scheduled rebuild was considered and **rejected**: it produces ~52 no-op
> commits a year and does not fix the case it appears to fix.

It does not fix the case because the actual failure mode is a visitor loading a
page that was built yesterday and is now one day stale between rebuilds — a
daily cron narrows that window but cannot close it, at the cost of a commit a
week whose only content is "nothing changed, only time passed."

### The two designs that were rejected

**Design A — filter during React render.** Compute which dates are still
current as part of the component tree and only render the current ones.
Rejected because the server pre-renders the page at build time with whatever
"today" was at build time, and the client re-renders during hydration with
whatever "today" is *now*. Any date that expired in between renders differently
on the server-rendered HTML than in the client's hydration pass — a hydration
mismatch, which React resolves by discarding the server HTML for that subtree
and rebuilding it client-side.

**Design B — filter in `useEffect`.** Run the filtering only after mount,
client-side, avoiding the render-time mismatch. Rejected because the effect
runs *after* hydration, so every visitor sees the full unfiltered list —
including expired markets — for one paint, then watches it change. On a phone,
which is the dominant case per spec §3, that flash of stale content is the
worst of both worlds: it is both wrong and visible.

### The decision

From spec §7, verbatim:

> **Decision: filter on the client, with a plain inline script — not React.**
>
> A React filter during render causes a hydration mismatch against the
> prerendered HTML; a filter in `useEffect` shows stale rows until hydration,
> which on a phone is the worst outcome. Instead every date row carries
> `data-fine="YYYY-MM-DD"`, and an inline `<script>` placed immediately after
> the list hides past rows during parsing — before first paint, before
> hydration, and independent of whether the JS bundle ever loads.
>
> ```js
> var oggi = new Date().toISOString().slice(0, 10);
> document.querySelectorAll("[data-fine]").forEach(function (el) {
>   if (el.dataset.fine < oggi) el.hidden = true;
> });
> ```
>
> ISO date strings compare correctly lexicographically, which avoids timezone
> arithmetic entirely.

Two things changed between this spec sketch and the shipped implementation in
`src/components/ScriptFreschezza.tsx`, both discovered by debugging real
failures rather than anticipated up front:

1. **`toISOString()` was replaced with a Rome-timezone comparison
   (`oggiRoma()` in spirit — the script inlines the equivalent
   `toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' })` since it cannot
   import a module).** `toISOString()` reports UTC. Between midnight and 1–2am
   local time, UTC is still the previous day, so a UTC-based "today" would
   un-hide a market that should already be showing as current, or hide one that
   just started. This is the same bug class documented as a standalone rule in
   `AGENTS.md`.
2. **`el.hidden = true` was replaced with `el.style.display = 'none'`, and this
   is now enforced project-wide: the script may touch `element.style` and
   nothing else.** Setting `el.hidden` (or any attribute, `textContent`, or
   class) mutates the DOM in a way React does not know about but *does* check
   for during hydration. React 19's response to a hydration mismatch it detects
   is to discard the server-rendered HTML for that subtree and re-render it
   from scratch on the client — which produces new DOM nodes that never
   received the script's mutation. The visible symptom was a page that flashed
   correctly filtered, then reverted to showing expired dates a moment later,
   because React had quietly rebuilt the subtree without the script's
   `hidden` attribute. `element.style` is invisible to this mechanism only
   because none of the components involved — `Mercatini.tsx` and its
   children, **and also `Apertura.tsx` and `CartaProssimo.tsx`, which
   `Apertura.tsx` renders and which is not a child of `Mercatini`** — pass a
   `style` prop, so React never claims ownership of that channel. The two
   halves of the script are mirror images of each other: in the calendar
   list (`Mercatini.tsx`) the script *hides* rows that default to visible; in
   the hero card (`CartaProssimo.tsx`, under `Apertura.tsx`) it *reveals* the
   matching entry, which defaults to hidden, and hides the empty-state
   fallback, which defaults to visible. Both directions are correct and
   intentional — see the `[data-nessun-prossimo]` comment in `globals.css`.
   Two rounds of debugging were spent finding this; see the full rule and the
   list of `data-*` attributes involved in `AGENTS.md`.

### Derived states, verbatim from spec §7

> - **"Oggi sono qui"** — when today matches a market date, the hero card reads
>   *"Oggi sono a Bergamo Alta"* instead of *"Prossimo mercatino"*. Same inline
>   script, no backend.
> - **Empty state** — after the last date (27 December 2026) every row is
>   hidden. The card must then show *"Le date del prossimo anno arrivano
>   presto — scrivimi e ti dico dove sono"*, never a blank panel. This is a
>   content problem no build strategy solves; the copy is the mitigation.

### Consequences

- The filtering logic now lives in exactly one place
  (`ScriptFreschezza.tsx`) and must stay inline, last in `<main>`, and
  `element.style`-only. Any future change to the calendar markup (renaming a
  `data-*` attribute, adding a wrapper `<div>` with its own `style` prop between
  the script and the rows it queries) risks silently breaking it in a way no
  test currently catches — see `AGENTS.md` › "Rules that will bite you".
- The site works with JavaScript disabled or blocked, but the two consumers
  degrade in opposite, both-deliberate directions. The calendar list
  (`Mercatini.tsx`) degrades to showing every date, including expired ones —
  the CSS default is visible, and with the script inert nothing hides the
  stale rows. The hero card (`CartaProssimo.tsx`) degrades the other way: its
  CSS defaults leave every `[data-voce-prossimo]` entry hidden and
  `[data-nessun-prossimo]` visible, so with the script inert the card always
  reads the empty-state copy ("Le date del prossimo anno arrivano presto…"),
  even when current markets exist. This is deliberate, not a bug: the
  alternative default (show *some* date without the script able to check
  whether it's still current) risks showing a wrong, expired market date as
  if it were upcoming, and a wrong date is worse than no date. In practice
  this makes the hero card the freshness script's most fragile consumer —
  its no-JS fallback is silent understatement (says nothing's coming when
  something is) rather than the calendar's silent overstatement (keeps
  showing what's already passed), and only the script running correctly
  makes either one accurate.

## Decision 4: One content model feeds the page, the JSON-LD, and the `.ics` files

From spec §8 ("Content model"):

> The calendar is the single source of truth for the rendered list, the
> JSON-LD, and the generated `.ics` files. It is typed data in the repo, not
> markup.
>
> ```ts
> export type Mercato = {
>   id: string;          // stable slug, used for the .ics filename
>   inizio: string;      // ISO date
>   fine?: string;       // ISO date, for multi-day markets
>   citta: string;       // "Milano"
>   luogo: string;       // "piazza Diaz"
>   dettaglio?: string;  // "MM Moscova"
>   mappa: string;       // Google Maps URL
> };
>
> export type Ricorrenza = {
>   luogo: string;
>   regola: string;      // "la 4ª domenica"
>   mesi: string[];
> };
> ```
>
> Adding a market is one edit to one file plus a push. This is documented in
> `docs/content-editing.md` so a future agent — or Enea in a hurry — can do it
> without reading the components.

In the shipped code, `Ricorrenza` carries `regolaIt`/`regolaEn` instead of a
single `regola`, to keep both locales' recurrence copy alongside each other
(`src/content/ricorrenze.ts`) rather than routing it through the dictionary.

`src/content/mercati.ts` is read by: the `Mercatini` component (the rendered
list), `src/lib/jsonld.ts` (the `Event`/`LocalBusiness` schema.org graph, per
spec §9), and `scripts/genera-ics.ts` (the `.ics` files written into
`out/calendario/` at build time). A wrong or malformed entry in `mercati.ts` is
therefore wrong everywhere at once, which is also why `tests/mercati.test.ts` is
the most heavily guarded test file in the repo — see its weekday-pattern test
and the discussion of the Cavour gap it closed in Task 12.

### Consequences

- One typo fixes (or breaks) three surfaces simultaneously.
- The `.ics` `DTEND` (exclusive) vs. JSON-LD `endDate` (inclusive) asymmetry
  documented in `AGENTS.md` exists precisely because both formats derive from
  the same `Mercato.fine`, via different rules, at different call sites
  (`giornoDopo(ultimoGiorno(m))` for `.ics`, `ultimoGiorno(m)` for JSON-LD) — a
  single shared source with two correct-but-different projections, not two
  independent facts that happen to differ.

## Decision 5: Terracotta is deliberately two color tokens

From spec §5 ("Design system › Palette"):

> Sampled from her photographs (k-means plus targeted crops), then
> white-balance corrected. Contrast ratios are measured, not estimated.
>
> | Token | Hex | on porcellana | on sabbia | Use |
> | --- | --- | --- | --- | --- |
> | `terracotta` | `#C2603A` | 3.91 | 3.29 | **decorative only** — paw markers, rules |
> | `terracotta-scritta` | `#9A4526` | 6.04 | 5.09 | links, small accent text |
>
> Terracotta is deliberately two tokens. The attractive value fails AA for body
> text; anything a visitor reads uses `terracotta-scritta`.

The photograph-sampled terracotta (`#C2603A`) is the color that actually
appears in her glazes and reads as "her" terracotta, but at 3.91:1 on the page
background it fails WCAG AA (4.5:1) for text. Darkening it to `#9A4526`
(`terracotta-scritta`, 6.04:1) passes AA but is a visibly different, less warm
color — not simply a fix, a tradeoff. Rather than pick one value and accept
either an accessibility failure or a duller accent, the palette keeps both:
`terracotta` stays reserved for non-text marks (the paw print, the hand-drawn
rule) where contrast requirements are looser, and every reachable/readable
element (links, accent text) uses `terracotta-scritta` instead. This is
enforced as a hard rule in `AGENTS.md`, not just a style convention, because the
"nice" wrong value and the "correct" right value are one character-swap apart
in any editor and the failure would not be visually obvious in isolation — only
against a contrast checker.

### Consequences

- Any new UI element that puts terracotta text on the page must consciously
  choose `terracotta-scritta`; using `terracotta` for text is a contrast
  regression, not a style choice, and is the single most likely accessibility
  mistake a future edit could introduce.
