# Sandu Pottery — lavori in corso

Temporary "work in progress" website for [Sandu Pottery](https://sandupottery.com),
an artisan potter in Bergamo, Italy. It stands in for a cancelled Shopify store
while the permanent showcase site (a separate, later project) is not yet
possible. Its job is small and specific: show that she's real and the work is
good, list where to find her at craft markets, and give people a way to write
to her. No shop, no cart, no shipping.

**Live:** https://sandupottery.com

## Stack

- **Next.js (App Router)**, `output: "export"` — fully static, no server, no
  middleware
- **Bun** for everything — package manager, dev server, test runner, scripts
- **Tailwind CSS v4** via PostCSS, CSS-first `@theme` tokens
- **Biome** for lint + format (no ESLint, no Prettier)
- **Cloudflare Pages** for hosting

See `docs/architecture/ADR-001-sito-statico-temporaneo.md` for the reasoning
behind these choices, and `AGENTS.md` for the full agent-facing project
context, commands, and the rules most likely to bite you if ignored.

## Commands

| Command          | Purpose                        |
| ---------------- | ------------------------------- |
| `bun install`    | Install dependencies            |
| `bun run dev`    | Start the dev server            |
| `bun run build`  | Static build + generate `.ics`  |
| `bun test`       | Run the unit test suite         |

## The calendar

The dated markets live in `src/content/mercati.ts`; the standing monthly
rhythm lives in `src/content/ricorrenze.ts`. `mercati.ts` feeds the rendered
page, the `Event` JSON-LD, and the generated `.ics` calendar files, all from
the same data.

**Adding or changing a market date is documented in
[`docs/content-editing.md`](docs/content-editing.md).** Read that before
editing the calendar — it's one edit to one file plus a push, and the doc
covers the rules that keep `bun test` passing.

## Documentation map

| Doc | Covers |
| --- | --- |
| [`AGENTS.md`](AGENTS.md) | Project context, architecture, commands, rules that will bite you |
| [`docs/content-editing.md`](docs/content-editing.md) | How to add or change a market date |
| [`docs/brand.md`](docs/brand.md) | Design tokens, typography, copy voice |
| [`docs/architecture/`](docs/architecture/) | Architecture Decision Records |
| [`docs/dns-cloudflare.md`](docs/dns-cloudflare.md) | The Aruba → Cloudflare DNS cutover runbook |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Commit conventions and the CI gates |
| [`SECURITY.md`](SECURITY.md) | How to report a vulnerability |
