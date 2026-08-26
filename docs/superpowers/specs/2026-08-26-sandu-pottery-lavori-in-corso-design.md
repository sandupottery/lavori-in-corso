# Sandu Pottery — pagina temporanea "lavori in corso"

**Date:** 2026-08-26
**Status:** approved, ready for implementation planning
**Repo:** new GitHub org for the client (name TBD at publish time), public

## 1. Problem

`sandupottery.com` currently serves a Cloudflare `error 1001` page. The Shopify
store was cancelled; the DNS zone at Aruba still points the apex at Shopify's IP
(`23.227.38.65`) and `www` at `shops.myshopify.com`, neither of which resolves to
a live store any more.

The client — Sandra, an artisan potter in Bergamo — is actively handing out
business cards at craft markets. In her words: *"A Madesimo ho acquisito nuovi
clienti e molti altri hanno preso il biglietto da visita. È super importante non
lasciare vuoto il sito."*

The permanent showcase site requires her sustained involvement and she has no
time. This spec covers a **temporary** site that stands in until then.

**Hard deadline:** the next market is 19–20 September 2026.

## 2. Goal and non-goals

### Goal

A static page that, for someone holding her business card, answers three
questions in this order:

1. Is she real, and is the work good? → one large photograph
2. Where do I find her next? → the market calendar
3. How do I reach her? → email and socials

### Non-goals

- No e-commerce, cart, checkout, shipping, or price display.
- No CMS or admin UI. Content changes are a commit.
- No contact form (static hosting, no backend). `mailto:` only.
- No dark mode. The palette is a porcelain light theme; `color-scheme: light`.
- No product catalogue. The gallery is a handful of photographs, not a shop.

## 3. Audience and context of use

Primary: a person who met her at a market stall in Lombardy, took a card, and is
typing the URL — most often on a phone, often the same evening. Mobile-first is
not a preference here, it is the dominant case.

Secondary: someone arriving from Instagram (`@sandu_pottery`) or a Google search
for a market she attends.

## 4. Recovered assets and facts

Recovered from the dead Shopify store's still-live CDN and cached HTML:

| Asset | Source | Location |
| --- | --- | --- |
| Official logo (vector) | `cdn.shopify.com/s/files/1/0778/9022/4465/files/SandU_Pottery_Logo.svg` | `brand-assets/SandU_Pottery_Logo.svg` |
| Old OG image | same CDN | `brand-assets/og-image-shopify.jpg` |

- Old tagline: *"Creazioni in ceramica lavorate a mano e al tornio. Made with
  love from Bergamo, Italy"*
- Instagram: `@sandu_pottery` and `@letettazze` — two accounts for the two halves of her work. Facebook existed but the client asked for it to be dropped.
- Old collection taxonomy (three brand worlds): animals (`animali`, `cani`,
  `gattetazze`); bodies (`tettazze`, `corpi-segnati`, `corpi-creatori`);
  botanicals (`foglie`, `mentine`, `more`, `fragole`, `nasturzi`, `malve`)

The Wayback Machine holds essentially nothing (3 URLs, no product pages, no CDN
assets), so no further recovery is possible without the Shopify admin login.

### Client answers received 2026-08-26

| Item | Answer |
| --- | --- |
| Public email | `info@sandupottery.com` — also her Shopify account address, so the mailbox is confirmed live on Aruba |
| Social links | The two Instagram accounts only. Drop Facebook. |
| P.IVA / company name | **Not published on this site.** The footer carries neither, and no placeholder stands in for them. |
| Aruba access | Received. Unblocks the DNS work; still needs a Cloudflare account to migrate *to*. |
| Shopify access | Password received, but 2FA is a passkey the client holds. The plan is cancelled with data retained for two years and reactivation offered at €1/month. |

### Still open (blocks publish, not build)

| Item | Needed for | Placeholder in build |
| --- | --- | --- |
| 8–10 photographs | gallery | 3 supplied + one marked placeholder tile |
| Cloudflare account | DNS migration and Pages deploy | — |

## 5. Design system

### Direction

**Porcellana + tocco Quaderno.** A porcelain-quiet layout with generous air that
lets the objects speak, warm sand as the secondary surface, and her own ink-line
drawing vocabulary used sparingly — a hand-drawn rule between sections, a paw
print as the calendar's list marker. Chosen over a fully earthy "bottega"
treatment (risks looking like a generic artisan template) and a fully hand-drawn
"quaderno" treatment (slides into craft-fair twee).

The direction must serve all three of her brand worlds equally. A palette tuned
only to the cute cats would betray the `corpi` line, which is arguably the heart
of the brand.

### Palette

Sampled from her photographs (k-means plus targeted crops), then white-balance
corrected. Contrast ratios are measured, not estimated.

| Token | Hex | on porcellana | on sabbia | Use |
| --- | --- | --- | --- | --- |
| `porcellana` | `#FAF7F3` | — | — | page background |
| `sabbia` | `#EDE3D6` | — | — | calendar card surface |
| `inchiostro` | `#241F1C` | 15.27 | 12.86 | body text, headings |
| `inchiostro-tenue` | `#5B534E` | 7.04 | 5.93 | secondary text |
| `terracotta` | `#C2603A` | 3.91 | 3.29 | **decorative only** — paw markers, rules |
| `terracotta-scritta` | `#9A4526` | 6.04 | 5.09 | links, small accent text |
| `rosa` | `#E4A896` | 1.90 | 1.60 | **never text** — link underlines, washes |
| `glassa` | `#9FAEBD` | 2.12 | 1.79 | **never text** — hand-drawn rules |
| `verderame` | `#4A6654` | 5.92 | 4.99 | optional second accent |

Terracotta is deliberately two tokens. The attractive value fails AA for body
text; anything a visitor reads uses `terracotta-scritta`.

### Typography

| Role | Face | Rationale |
| --- | --- | --- |
| Display — headings, labels, dates | **Quicksand** 500/600/700 | Near-exact match for the logo's rounded monoline geometric lettering, so page and mark read as one system. Free. |
| Body — running text, place names | **Newsreader** 300/400 + italic | Warm low-contrast text serif; carries the "quaderno" temperature without costume, and holds up in the calendar's dense rows. |

Both are self-hosted as local `woff2` under `src/fonts/` via `next/font/local`,
matching the STST convention and removing a build-time network dependency.

Fallback stacks: `Quicksand, "Century Gothic", "Avenir Next", sans-serif` and
`Newsreader, "Iowan Old Style", Georgia, serif`.

### Copy voice

First person singular, warm, plain, no marketing gloss. She is one woman with a
wheel.

- H1: **"Sto rifacendo il sito."** — not "Coming soon", not "Sito in
  costruzione". The page is a shop window with a handwritten note in it, not a
  construction site.
- Sub: "Nel frattempo ci vediamo ai mercatini."
- Section heads: "Dove mi trovi", "Qualche pezzo", "Scrivimi".

### Marks

- **Hand-drawn rule** — an irregular SVG cubic path in `glassa`, section divider.
- **Paw print** — inline SVG (five ellipses) in `terracotta`, calendar list marker.
  Never an emoji.

## 6. Information architecture

Single scrolling page per locale. No navigation bar; the only nav is the language
switch. Section order follows the audience's question order from §3.

```
header      logo · IT/EN switch
hero        eyebrow · H1 · intro · [next-market card] · photo
rule
mercatini   "Dove mi trovi" · two-column card (rhythm | dates)
galleria    "Qualche pezzo" · photo grid
contatti    "Scrivimi" · email · due account Instagram
footer      nome e città · credit
```

### Hero — "Biglietto"

Copy left, framed photograph right, with the next-market card promoted **into**
the hero rather than left to the calendar section. Answers "dove la trovo?"
above the fold, which is the visitor's actual question. Chosen over a full-bleed
photo treatment (her photographs are mostly vertical and visually busy, so
overlaid text is a legibility risk) and a leaning-print treatment (charming, but
the rotation and shadow are easy to overdo).

### Calendar — "Due tempi"

The calendar carries two kinds of information with different lifetimes:

- **The standing rhythm** — Bergamo Bassa the 2nd Sunday, Bergamo Alta the 4th
  Sunday, Milano piazza Diaz the 4th Thursday. Evergreen, builds trust.
- **The dated list** — ~30 specific dates, each of which expires.

Mixing them buries the evergreen half under the perishable half. The module
splits them: a left rail for the rhythm, a right area for dates grouped by
month. On mobile they stack with the rhythm first.

### Language routing

`/` is Italian; `/en` is English. Implemented as two concrete routes sharing one
component and a typed dictionary — not a `[locale]` dynamic segment, and not a
redirect from `/`, since middleware does not run under `output: 'export'` and a
meta-refresh hop is worse for the primary Italian audience.

`alternates.languages` supplies `hreflang`; both routes appear in the sitemap.

## 7. Freshness — the staleness problem

A static page built today will show "19–20 settembre" in November. The site is
rebuilt only on push, so build-time filtering alone is insufficient.

**Decision: filter on the client, with a plain inline script — not React.**

A React filter during render causes a hydration mismatch against the prerendered
HTML; a filter in `useEffect` shows stale rows until hydration, which on a phone
is the worst outcome. Instead every date row carries `data-fine="YYYY-MM-DD"`,
and an inline `<script>` placed immediately after the list hides past rows during
parsing — before first paint, before hydration, and independent of whether the JS
bundle ever loads.

```js
var oggi = new Date().toISOString().slice(0, 10);
document.querySelectorAll("[data-fine]").forEach(function (el) {
  if (el.dataset.fine < oggi) el.hidden = true;
});
```

ISO date strings compare correctly lexicographically, which avoids timezone
arithmetic entirely.

A scheduled rebuild was considered and **rejected**: it produces ~52 no-op
commits a year and does not fix the case it appears to fix.

### Derived states

- **"Oggi sono qui"** — when today matches a market date, the hero card reads
  *"Oggi sono a Bergamo Alta"* instead of *"Prossimo mercatino"*. Same inline
  script, no backend.
- **Empty state** — after the last date (27 December 2026) every row is hidden.
  The card must then show *"Le date del prossimo anno arrivano presto — scrivimi
  e ti dico dove sono"*, never a blank panel. This is a content problem no build
  strategy solves; the copy is the mitigation.

## 8. Content model

The calendar is the single source of truth for the rendered list, the JSON-LD,
and the generated `.ics` files. It is typed data in the repo, not markup.

```ts
export type Mercato = {
  id: string;          // stable slug, used for the .ics filename
  inizio: string;      // ISO date
  fine?: string;       // ISO date, for multi-day markets
  citta: string;       // "Milano"
  luogo: string;       // "piazza Diaz"
  dettaglio?: string;  // "MM Moscova"
  mappa: string;       // Google Maps URL
};

export type Ricorrenza = {
  luogo: string;
  regola: string;      // "la 4ª domenica"
  mesi: string[];
};
```

Adding a market is one edit to one file plus a push. This is documented in
`docs/content-editing.md` so a future agent — or Enea in a hurry — can do it
without reading the components.

### Source data

Transcribed from the client's `CALENDARIO SITO.pdf` (extracted via its embedded
ToUnicode CMap; the PDF has no text layer). Recurring: Bergamo Bassa 2nd Sunday
(Mar–Jun, Oct–Dec); Bergamo Alta 4th Sunday (Apr–Jun, Sep–Dec); Milano piazza
Diaz 4th Thursday. Plus 30 dated events, September–December 2026.

## 9. Extras

| Feature | Rationale |
| --- | --- |
| **`Event` JSON-LD** per market, plus `LocalBusiness` | Highest-leverage item on the page. Google surfaces events in search and Maps, which directly serves the "don't leave the site empty" goal. Invisible on the page. |
| **Map links** on every date row | "Passaggio Torre Adalberto" means nothing to a visitor from Milan. Near-zero cost. |
| **`.ics` per market + combined feed** | Generated as real files into `out/` at build time from the same content model. Useful for her regulars. |

## 10. Technical architecture

Mirrors the STST `lite-site` repo, which the same author built and deploys the
same way.

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

### Deliberate deviations from STST

- **No Framer Motion.** STST needs it for layout cycling; this page needs one
  gentle fade-up. CSS handles it at a fraction of the bundle.
- **No scheduled rebuild workflow.** See §7.
- **`docs/brand.md` added** — this project has a real brand system to record,
  which STST did not.

### Design tokens

Tokens live in `src/app/globals.css` under `@theme` as `--color-sp-*`, mirroring
STST's `--color-st-*` convention, bridged to `next/font` variables the same way.

## 11. DNS and deployment

### Findings

| Fact | Value |
| --- | --- |
| Registrar | Tucows, **reseller Aruba S.p.A.** — the Aruba account controls it |
| Nameservers | `dns.technorail.com`, `dns2.technorail.com`, `dns3.arubadns.net`, `dns4.arubadns.cz` |
| Domain locks | `clientTransferProhibited`, `clientUpdateProhibited` |
| Expiry | 2027-05-01 |

**A registrar transfer is not required.** Moving DNS to Cloudflare only needs a
nameserver change, made from inside the Aruba panel. No EPP code, no unlock, no
60-day lock.

### Mail must survive the cutover

Her mail is hosted at Aruba and lives entirely in the zone being moved. All of
the following must be replicated in Cloudflare and verified **before** the
nameservers are switched, or her mail dies silently:

```
MX    10 mx.sandupottery.com
A     mx    62.149.128.{74,151,154,157,160,163,166}
A     mail  62.149.128.{74,151,154,157,160,163,166}
A     smtp  62.149.128.{200,201,202,203}
A     webmail 62.149.158.{91,92}
CNAME imap        → imaps.aruba.it
CNAME autoconfig  → autodiscover.aruba.it
TXT   @      v=spf1 include:_spf.aruba.it ~all
TXT   _dmarc v=DMARC1; p=none; adkim=r; aspf=r
```

Cutover order: create the zone in Cloudflare → replicate every record above →
verify by querying Cloudflare's nameservers directly → only then change
nameservers at Aruba → confirm mail delivery end-to-end.

### Credentials required from the client

Blocking: Aruba panel login (username / customer code + password), and which
phone or email receives the 2FA code. The exact list of live `@sandupottery.com`
mailboxes, so none are broken. Her mailbox password is **not** needed.

Non-blocking but time-sensitive: the Shopify login. Even on a cancelled plan the
admin allows a product CSV and image export — the entire catalogue for the
permanent site. The CDN still serves her files today; that will not last.

## 12. Accessibility and performance

- All text/background pairs meet WCAG AA; `rosa` and `glassa` are barred from
  text by token documentation and never used for it.
- Interactive targets ≥ 44px on mobile.
- `lang` set correctly per route; `hreflang` on both.
- `prefers-reduced-motion` disables the fade-up.
- Images checked in pre-optimised; `next/image` runs `unoptimized` under static
  export, so sizing is the author's responsibility.
- `color-scheme: light` declared — the design does not have a dark variant and
  says so rather than letting the browser invert it.

## 13. Repo and agent conventions

Mirrors the STST layout, which is already agent-navigable.

```
AGENTS.md                     project context, architecture, commands
CLAUDE.md                     → @AGENTS.md
docs/architecture/            ADR index + records
docs/brand.md                 design-token source of truth
docs/content-editing.md       how to add a market date
docs/superpowers/specs/       this document
.tasks/NNN-slug/              task.md + plan/phase-N-*.md
```

`AGENTS.md` opens with the `nextjs-agent-rules` block instructing agents to read
`node_modules/next/dist/docs/` before writing Next.js code, and carries a
"Learned Patterns" table.

## 14. Risks

| Risk | Mitigation |
| --- | --- |
| Nameserver change breaks her email | Replicate and verify the full zone before switching (§11) |
| Gallery has too few photographs | Blocked on her Shopify login or 8–10 new photos; build ships with marked placeholders until then |
| Calendar empties after Dec 2026 | Explicit empty state copy (§7) |
| Shopify data purged after the two-year retention window | Logo and OG image already saved; reactivating at €1/month is the cheap recovery path and needs the client's passkey |
| `info@sandupottery.com` breaks during the DNS cutover | It is the confirmed live mailbox — verify delivery to it specifically, before and after the nameserver switch |

## 15. Open questions

None blocking implementation. Two blocking publish:

1. **A Cloudflare account to migrate to.** The Aruba credentials are in hand, but
   they only let us change nameservers — there must be a destination zone first.
2. **Photographs.** Three are in hand; the gallery wants 8–10.

The build proceeds with a visibly marked placeholder tile for the missing
photographs, and is shown locally before anything is published.
