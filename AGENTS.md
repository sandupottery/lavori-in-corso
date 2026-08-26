<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project Context

Temporary "lavori in corso" site for Sandu Pottery, an artisan potter in Bergamo, Italy. It replaces a cancelled Shopify store. Its job: show her work, list her craft-market dates, and give people a way to write. No shop, no cart, no shipping.

The permanent showcase site is a separate, later project.

## Architecture

- Two routes: `/` (Italian) and `/en` (English), sharing `src/components/Pagina.tsx`
- `output: "export"` — fully static, no server, no middleware
- One content model in `src/content/mercati.ts` feeds three consumers: the page, the `Event` JSON-LD, and the `.ics` files
- Past dates are hidden by a parse-time inline script, **not** by React — see `src/components/ScriptFreschezza.tsx` for why

## Tech & Tooling

- Bun for everything. Never `npm` or `yarn`.
- Biome for lint + format (no ESLint, no Prettier)
- Lefthook for git hooks; commitlint enforcing conventional commits
- Tailwind CSS v4 via PostCSS, CSS-first `@theme` — there is no `tailwind.config.ts`
- `bun test` for the pure functions in `src/lib/`
- No Framer Motion. One CSS keyframe is the whole motion budget.

## Commands

| Command             | Purpose                        |
| ------------------- | ------------------------------ |
| `bun install`       | Install deps                   |
| `bun run dev`       | Dev server                     |
| `bun run build`     | Static build + generate `.ics` |
| `bun run lint`      | Lint check                     |
| `bunx tsc --noEmit` | Type check                     |
| `bun test`          | Unit tests                     |

## Rules that will bite you

- **`ScriptFreschezza.tsx` may touch only `element.style` — never an attribute, `textContent`, or a class.** It is a parse-time inline `<script>`, the last child of `<main>` in `Pagina.tsx`, that hides past market dates before first paint. React does not manage `element.style` unless a component passes a `style` prop, and none of the components it touches do — so writing to `.style` is invisible to React's reconciliation. Writing anything else (an attribute, text, a class) creates a mismatch between the server-rendered HTML and what React expects on hydration; React 19's answer to a hydration mismatch is to discard the server HTML for that subtree and re-render it from scratch client-side, which silently erases whatever the script had just done — the page flashes correct, then reverts to stale. Two rounds of debugging were spent finding this. Do not touch `ScriptFreschezza.tsx` or `Pagina.tsx`, and do not rename any `data-*` attribute it reads (`data-fine`, `data-inizio`, `data-elenco-date`, `data-gruppo-mese`, `data-nessuna-data`, `data-tutte-le-date`, `data-voce-prossimo`, `data-nessun-prossimo`, `data-etichetta-prossimo`, `data-etichetta-oggi`, `data-suggerimento`). The real position constraint: the script must render after all markup emitting the `data-*` attributes it queries, since it runs once during parsing and does not re-scan. **Any new component emitting `data-fine` or `data-voce-prossimo` must be placed above the script in the DOM** — currently last in `<main>` in `Pagina.tsx` — or its rows are silently unfiltered rather than erroring.
- **`.ics` `DTEND` is exclusive; schema.org `endDate` is inclusive.** A market running 2026-09-19–20 gets `DTEND;VALUE=DATE:20260921` in the `.ics` (the day *after* the last day, per RFC 5545) but `endDate: "2026-09-20"` in the JSON-LD (the last day itself, per schema.org). They differ by one day **on purpose** — collapsing them to match would make one of the two wrong. `tests/ics.test.ts` ("scrive un evento di due giorni con DTEND al terzo giorno") and `tests/jsonld.test.ts` ("un evento lungo ha endDate all'ultimo giorno, non al giorno dopo") both pin this; if you ever see them disagree about what "the end date" should be, that is the asymmetry, not a bug.
- **Never compute "today" with `toISOString()`.** If you need "today" in TypeScript, use `oggiRoma()` from `src/lib/date.ts`. `toISOString()` reports UTC, and Rome is UTC+1/+2 — between midnight and 1am (winter) or 2am (summer) local time, `toISOString()` still names the previous day, which would make the freshness script hide today's market as if it had already passed. Note that `ScriptFreschezza.tsx` itself does **not** call `oggiRoma()` — it deliberately duplicates the same Rome-timezone logic inline, in plain ES5, because it must run before any bundle (and therefore before `src/lib/date.ts`) loads. That duplication is intentional, not a missed import; keep both copies and their tests in sync if the Rome-timezone logic ever changes.
- **The English date format is pinned to Bun's bundled ICU, and that pin is deliberate.** `Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" })` yields `"Thursday 24 September"` under Bun's ICU and `"Thursday, 24 September"` (with a comma) under Node's full-ICU. `tests/date.test.ts` asserts the no-comma Bun form. If a Bun upgrade changes the bundled CLDR data, that test failing is the alarm working as designed, not a false positive — it means the live site's date labels just changed shape. Fix it by updating the expected string to match the new correct output, or by composing the label from `formatToParts` if the format starts churning across Bun versions. Never "fix" a failure here by loosening or deleting the assertion — that turns off the alarm instead of answering it.
- **Bracketed placeholders (e.g. `[EMAIL DA CONFERMARE]`) are load-bearing.** They mark a fact the client has not yet supplied. Never invent a value to make one go away — leave the placeholder and note what is still needed. (None remain in this repo as of Task 12; every open fact was resolved. If you introduce new client-facing copy before all facts are in, use this convention rather than a guess.)
- **Never use `terracotta` (`#C2603A`), `rosa` or `glassa` for text.** They fail WCAG AA. Links use `terracotta-scritta` (`#9A4526`). See `docs/brand.md`.

## Adding a market date

See `docs/content-editing.md`. It is one edit to `src/content/mercati.ts` plus a push.

## Learned Patterns

| Pattern | Reference | Date |
| ------- | --------- | ---- |
| `biome migrate --write` on this Biome version (2.5.10) rewrote `linter.rules.recommended: true` to `linter.rules.preset: "none"`, which silently disables the entire recommended ruleset — verified empirically, an unused variable stopped being flagged. The correct migration is `preset: "recommended"`. Never trust a codemod's output without re-running the check it claims to fix. | Task 12 | 2026-08-26 |
