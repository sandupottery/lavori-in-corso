# Sandu Pottery "Lavori in corso" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a static, bilingual, self-maintaining one-page site at `sandupottery.com` that shows the artisan's work, her market calendar, and how to reach her, replacing the Cloudflare error page currently live.

**Architecture:** Next.js App Router with `output: "export"` produces a fully static bundle. All market data lives in one typed TypeScript module that feeds three consumers: the rendered page, `Event` JSON-LD, and `.ics` files emitted by a post-build script. Past dates are hidden by a tiny inline `<script>` that runs during HTML parsing — before paint and before hydration — so the page never shows a stale date regardless of when it was built. Two sibling routes (`/` Italian, `/en` English) share one component tree and a `Record<Locale, Dizionario>` dictionary that TypeScript forces to stay in sync.

**Tech Stack:** Bun · Next.js 16.3.3 · React 19.2.8 · Tailwind CSS v4.3.3 (`@theme`, no config file) · Biome 2.5.10 · Lefthook · commitlint · release-please · `bun test` · Cloudflare Pages via `wrangler-action`

**Spec:** `docs/superpowers/specs/2026-08-26-sandu-pottery-lavori-in-corso-design.md`

## Global Constraints

- **Package manager is Bun.** Never `npm install` or `yarn`. Lockfile is `bun.lock`.
- **No ESLint, no Prettier.** Biome only. `bun run lint` is the gate.
- **No Framer Motion.** Deliberate deviation from the STST template (spec §10). One CSS fade-up is the entire motion budget.
- **No scheduled rebuild workflow.** Deliberate deviation (spec §7).
- **`output: "export"`** — no server components that fetch, no middleware, no route handlers with dynamic behaviour, no `next/image` optimization (`images.unoptimized: true`).
- **Language of the product is Italian.** All identifiers, file names, and code comments in `src/content/` and `src/lib/` use Italian domain vocabulary (`mercati`, `ricorrenze`, `dizionario`) because that is what the client and future maintainers speak. Framework files keep their required English names.
- **Palette tokens, exact values** — `porcellana #FAF7F3`, `sabbia #EDE3D6`, `inchiostro #241F1C`, `testo #4A423D`, `tenue #5B534E`, `nota #6E645B`, `terracotta #C2603A`, `terracotta-scritta #9A4526`, `rosa #E4A896`, `glassa #9FAEBD`, `verderame #4A6654`.
- **Colour rules that are not negotiable:** `terracotta`, `rosa` and `glassa` must never be used for text. Links use `terracotta-scritta`. Every text/background pair must clear WCAG AA (4.5:1).
- **Typefaces:** Quicksand (display) and Newsreader (body), self-hosted `woff2`, loaded with `next/font/local`. No `next/font/google` — the build must not depend on network access.
- **Placeholders that ship:** the public email, the business name and P.IVA, and gallery photos beyond the three supplied are not yet confirmed by the client. They must appear as visibly bracketed placeholders (`[EMAIL DA CONFERMARE]`) — never invented values.
- **Timezone is `Europe/Rome`.** All "is this date past?" logic resolves today in Rome, never UTC. At 00:30 CEST a UTC-based date is still the previous day, which would make the page announce yesterday's market.
- **Conventional commits**, enforced by commitlint. Types: `feat`, `fix`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`.

---

## File Structure

```
src/
  app/
    globals.css              Tailwind import + @theme tokens
    layout.tsx               <html>/<body>, font variables, color-scheme
    page.tsx                 Italian route  (/)
    en/page.tsx              English route  (/en)
    icon.png                 favicon
    apple-icon.png           touch icon
    manifest.ts              → out/manifest.webmanifest
    robots.ts                → out/robots.txt
    sitemap.ts               → out/sitemap.xml
  components/
    Pagina.tsx               the whole page, parameterised by locale
    Intestazione.tsx         logo + language switch
    Apertura.tsx             hero: eyebrow, H1, intro, photo
    CartaProssimo.tsx        "Prossimo mercatino" / "Oggi sono a…" card
    Mercatini.tsx            the two-column "due tempi" calendar
    Galleria.tsx             photo grid
    Contatti.tsx             email + socials
    PiePagina.tsx            footer
    Filo.tsx                 hand-drawn rule (SVG)
    Zampina.tsx              paw print (SVG)
    ScriptFreschezza.tsx     the inline past-date filter
  content/
    mercati.ts               the 25 dated markets
    ricorrenze.ts            the 3 standing rules
    dizionario.ts            it/en strings, Dizionario type
    sito.ts                  URL, email, socials, business identity
  lib/
    fonts.ts                 next/font/local declarations
    date.ts                  pure date helpers
    ics.ts                   pure RFC 5545 builder
    jsonld.ts                pure schema.org builders
  fonts/                     3 self-hosted woff2 files
scripts/
  genera-ics.ts              post-build .ics emitter
tests/
  date.test.ts
  ics.test.ts
  jsonld.test.ts
  mercati.test.ts            data integrity
  dizionario.test.ts         locale key parity
public/
  foto/                      pre-optimised photographs
  logo.svg                   recovered brand mark
```

`src/lib/*` holds pure, testable functions with no React and no I/O. `src/content/*` holds data only. `src/components/*` holds presentation. This split is what makes `bun test` meaningful on a site with no backend.

---

### Task 1: Repo scaffold, tooling, and CI/CD

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `biome.json`, `lefthook.yml`, `commitlint.config.mjs`, `release-please-config.json`, `.release-please-manifest.json`, `.gitignore`, `Dockerfile`, `nginx.conf`, `.dockerignore`, `.devcontainer/devcontainer.json`, `.github/workflows/ci.yml`, `.github/workflows/release.yml`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Move: `email-files/` → `docs/fonti-cliente/`, `brand-assets/SandU_Pottery_Logo.svg` → `public/logo.svg`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a repo where `bun run build`, `bun run lint`, `bunx tsc --noEmit` and `bun test` all succeed. Every later task assumes these four commands exist.

- [ ] **Step 1: Initialise the repo and move the source material out of the root**

```bash
cd /Users/eneascaccabarozzi/Projects/Sandupottery/vetrina
git init -b main
git config user.name "Enea Scaccabarozzi"
git config user.email "me@eneascaccabarozzi.xyz"
mkdir -p docs/fonti-cliente public/foto
git mv 2>/dev/null || true
mv email-files/* docs/fonti-cliente/ && rmdir email-files
mv brand-assets/SandU_Pottery_Logo.svg public/logo.svg
mv brand-assets/og-image-shopify.jpg docs/fonti-cliente/
rmdir brand-assets
rm -f .DS_Store
```

- [ ] **Step 2: Write `package.json`**

```json
{
	"name": "sandupottery-lavori-in-corso",
	"version": "0.1.0",
	"private": true,
	"scripts": {
		"dev": "next dev",
		"build": "next build && bun run scripts/genera-ics.ts",
		"start": "next start",
		"lint": "biome check .",
		"lint:fix": "biome check --fix .",
		"format": "biome format --write .",
		"test": "bun test"
	},
	"dependencies": {
		"next": "16.3.3",
		"react": "19.2.8",
		"react-dom": "19.2.8"
	},
	"devDependencies": {
		"@biomejs/biome": "2.5.10",
		"@commitlint/cli": "21.2.2",
		"@commitlint/config-conventional": "21.2.2",
		"@tailwindcss/postcss": "4.3.3",
		"@types/bun": "latest",
		"@types/node": "^20",
		"@types/react": "^19",
		"@types/react-dom": "^19",
		"lefthook": "2.1.10",
		"tailwindcss": "4.3.3",
		"typescript": "^5"
	}
}
```

`scripts/genera-ics.ts` does not exist yet, so `bun run build` will fail until Task 5. Until then use `bunx next build` to verify the Next side.

- [ ] **Step 3: Write `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "export",
	images: {
		unoptimized: true,
	},
	trailingSlash: false,
};

export default nextConfig;
```

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"lib": ["dom", "dom.iterable", "esnext"],
		"allowJs": true,
		"skipLibCheck": true,
		"strict": true,
		"noUncheckedIndexedAccess": true,
		"noEmit": true,
		"esModuleInterop": true,
		"module": "esnext",
		"moduleResolution": "bundler",
		"resolveJsonModule": true,
		"isolatedModules": true,
		"jsx": "react-jsx",
		"incremental": true,
		"plugins": [{ "name": "next" }],
		"paths": { "@/*": ["./src/*"] }
	},
	"include": [
		"next-env.d.ts",
		"**/*.ts",
		"**/*.tsx",
		".next/types/**/*.ts",
		".next/dev/types/**/*.ts",
		"**/*.mts"
	],
	"exclude": ["node_modules", "out"]
}
```

There is deliberately no `types` array: `@types/bun` is auto-included, and an explicit array would disable that and break `import ... from "bun:test"`.

`noUncheckedIndexedAccess` is on deliberately: the calendar code indexes arrays constantly and this catches the off-by-one class of bug at compile time.

- [ ] **Step 5: Write `postcss.config.mjs` and `biome.json`**

`postcss.config.mjs`:

```js
const config = {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};

export default config;
```

`biome.json`:

```json
{
	"$schema": "https://biomejs.dev/schemas/2.5.10/schema.json",
	"vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
	"files": {
		"ignoreUnknown": false,
		"includes": ["**", "!node_modules", "!.next", "!out", "!bun.lock", "!src/fonts", "!public"]
	},
	"formatter": { "enabled": true, "indentStyle": "tab", "lineWidth": 100 },
	"linter": { "enabled": true, "rules": { "recommended": true } },
	"javascript": { "formatter": { "quoteStyle": "double", "semicolons": "always" } },
	"css": { "parser": { "cssModules": false, "tailwindDirectives": true } },
	"assist": { "enabled": true, "actions": { "source": { "organizeImports": "on" } } },
	"overrides": [
		{
			"includes": ["src/components/ScriptFreschezza.tsx"],
			"linter": { "rules": { "security": { "noDangerouslySetInnerHtml": "off" } } }
		}
	]
}
```

The override is required — Task 9 injects the freshness script with `dangerouslySetInnerHTML`, which is the only correct way to emit a parser-time inline script from React.

- [ ] **Step 6: Write the git hooks and release config**

`lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    biome-check:
      glob: "*.{js,ts,jsx,tsx,json,css}"
      run: bunx biome check --no-errors-on-unmatched --files-ignore-unknown=true {staged_files}
    typecheck:
      run: bunx tsc --noEmit

commit-msg:
  commands:
    commitlint:
      run: bunx commitlint --edit {1}

pre-push:
  parallel: true
  commands:
    biome-check:
      run: bunx biome check .
    typecheck:
      run: bunx tsc --noEmit
    test:
      run: bun test
    build:
      run: bun run build
```

`commitlint.config.mjs`:

```js
export default {
	extends: ["@commitlint/config-conventional"],
};
```

`release-please-config.json`:

```json
{
	"packages": {
		".": {
			"release-type": "node",
			"bump-minor-pre-major": true,
			"bump-patch-for-minor-pre-major": true,
			"changelog-sections": [
				{ "type": "feat", "section": "Features" },
				{ "type": "fix", "section": "Bug Fixes" },
				{ "type": "chore", "section": "Miscellaneous" },
				{ "type": "ci", "section": "CI/CD" },
				{ "type": "docs", "section": "Documentation" },
				{ "type": "style", "section": "Styles" },
				{ "type": "refactor", "section": "Refactoring" },
				{ "type": "perf", "section": "Performance" }
			]
		}
	}
}
```

`.release-please-manifest.json`:

```json
{ ".": "0.1.0" }
```

`.gitignore`:

```
node_modules
.next
out
next-env.d.ts
tsconfig.tsbuildinfo
.DS_Store
.env*.local
.superpowers/
.design/*.html
!.design/*.dc.html
```

- [ ] **Step 7: Write the container and devcontainer files**

`Dockerfile`:

```dockerfile
# ── Stage 1: Install dependencies ────────────────────────────
FROM oven/bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ── Stage 2: Build static site ───────────────────────────────
FROM oven/bun:1-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# ── Stage 3: Serve with nginx ────────────────────────────────
FROM nginx:1-alpine AS runner
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

`nginx.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml text/calendar;
    gzip_min_length 256;

    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(woff2?|ttf|otf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|avif)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    location ~* \.ics$ {
        default_type text/calendar;
        add_header Cache-Control "public, max-age=3600";
    }

    location / {
        try_files $uri $uri.html $uri/ =404;
        add_header Cache-Control "no-cache";
    }
}
```

`.dockerignore`:

```
node_modules
.next
out
.git
.design
docs
```

`.devcontainer/devcontainer.json`:

```json
{
	"name": "sandupottery-lavori-in-corso",
	"image": "mcr.microsoft.com/devcontainers/base:ubuntu",
	"features": {
		"ghcr.io/devcontainers-contrib/features/bun:1": {}
	},
	"postCreateCommand": "bun install",
	"customizations": {
		"vscode": {
			"extensions": ["biomejs.biome", "bradlc.vscode-tailwindcss"]
		}
	}
}
```

- [ ] **Step 8: Write the CI workflows**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
    push:
        branches: [dev]
    pull_request:
        branches: [dev, main]
    workflow_call:

concurrency:
    group: ci-${{ github.ref }}
    cancel-in-progress: true

jobs:
    ci:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: oven-sh/setup-bun@v2
            - name: Cache bun dependencies
              uses: actions/cache@v4
              with:
                  path: ~/.bun/install/cache
                  key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}
                  restore-keys: bun-${{ runner.os }}-
            - run: bun install --frozen-lockfile
            - name: Biome check
              run: bun run lint
            - name: Type check
              run: bunx tsc --noEmit
            - name: Unit tests
              run: bun test
            - name: Build
              run: bun run build
            - name: Upload build artifact
              uses: actions/upload-artifact@v4
              with:
                  name: static-site
                  path: out/
                  retention-days: 7
```

`.github/workflows/release.yml`:

```yaml
name: Release

on:
    push:
        branches: [main]

permissions:
    contents: write
    pull-requests: write
    packages: write

concurrency:
    group: release-${{ github.ref }}
    cancel-in-progress: false

jobs:
    ci:
        uses: ./.github/workflows/ci.yml

    release:
        needs: ci
        runs-on: ubuntu-latest
        outputs:
            release_created: ${{ steps.release.outputs.release_created }}
            tag_name: ${{ steps.release.outputs.tag_name }}
        steps:
            - uses: googleapis/release-please-action@v4
              id: release
              with:
                  release-type: node

    deploy:
        needs: [ci, release]
        if: needs.release.outputs.release_created == 'true'
        runs-on: ubuntu-latest
        steps:
            - name: Download build artifact
              uses: actions/download-artifact@v4
              with:
                  name: static-site
                  path: out/
            - name: Deploy to Cloudflare Pages
              uses: cloudflare/wrangler-action@v3
              with:
                  apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
                  accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
                  command: pages deploy out --project-name=sandupottery-lavori-in-corso
```

The STST release workflow also builds a GHCR image and uploads a tarball. Both are dropped here — this site is served from Cloudflare Pages only, and the Dockerfile exists for local parity, not for distribution.

- [ ] **Step 9: Write a minimal `layout.tsx`, `page.tsx` and `globals.css` so the build has something to compile**

`src/app/globals.css`:

```css
@import "tailwindcss";
```

`src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Sandu Pottery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it">
			<body>{children}</body>
		</html>
	);
}
```

`src/app/page.tsx`:

```tsx
export default function Home() {
	return <main>Sandu Pottery</main>;
}
```

- [ ] **Step 10: Install and verify all four gates**

```bash
bun install
bunx next build
bun run lint
bunx tsc --noEmit
bun test
```

Expected: `next build` writes `out/index.html`; lint and typecheck pass; `bun test` reports zero tests found and exits 0. `bun run build` still fails on the missing ics script — that is expected until Task 5.

- [ ] **Step 11: Install the git hooks and commit**

```bash
bunx lefthook install
git add -A
git commit -m "chore: scaffold next.js static export with biome, lefthook and ci"
```

---

### Task 2: Design tokens and self-hosted fonts

**Files:**
- Create: `src/fonts/Quicksand.woff2`, `src/fonts/Newsreader.woff2`, `src/fonts/Newsreader-Italic.woff2`, `src/lib/fonts.ts`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`

**Interfaces:**
- Consumes: Task 1's build pipeline
- Produces: `quicksand` and `newsreader` exports from `@/lib/fonts` (each with a `.variable` class string); Tailwind utilities `font-display`, `font-testo`, and `bg-sp-*` / `text-sp-*` / `border-sp-*` for every palette token.

- [ ] **Step 1: Download the three font files**

Both families are variable fonts; the `latin` subset (`U+0000–00FF` plus general punctuation) covers every Italian accent as well as `ª`, `°`, `—` and curly quotes, so one file per style is enough.

```bash
mkdir -p src/fonts
curl -sS -o src/fonts/Quicksand.woff2 \
  "https://fonts.gstatic.com/s/quicksand/v37/6xKtdSZaM9iE8KbpRA_hK1QNYuDyPw.woff2"
curl -sS -o src/fonts/Newsreader.woff2 \
  "https://fonts.gstatic.com/s/newsreader/v26/cY9VfjOCX1hbuyalUrK49dLac06G1ZGsZBtoBAbNJYQ5ayZC.woff2"
curl -sS -o src/fonts/Newsreader-Italic.woff2 \
  "https://fonts.gstatic.com/s/newsreader/v26/cY9kfjOCX1hbuyalUrK439vogqC9yFZCYg7oRZaLP4obnf7fTXglsMwoT9ZHFjSShVCjzSY.woff2"
file src/fonts/*.woff2
```

Expected: three `Web Open Font Format (Version 2)` files, roughly 28 KB, 58 KB and 24 KB.

- [ ] **Step 2: Write `src/lib/fonts.ts`**

```ts
import localFont from "next/font/local";

// Quicksand — display face. Matches the lettering of the client's own logo,
// so the wordmark and the page read as one system.
export const quicksand = localFont({
	src: [{ path: "../fonts/Quicksand.woff2", style: "normal", weight: "400 700" }],
	variable: "--font-display-var",
	display: "swap",
});

// Newsreader — body face. Warm, low-contrast text serif that holds up in the
// dense rows of the market calendar.
export const newsreader = localFont({
	src: [
		{ path: "../fonts/Newsreader.woff2", style: "normal", weight: "300 500" },
		{ path: "../fonts/Newsreader-Italic.woff2", style: "italic", weight: "300 500" },
	],
	variable: "--font-testo-var",
	display: "swap",
});
```

The `weight` values are **ranges**, not single numbers — these are variable fonts and a single value would make Next synthesise the other weights.

- [ ] **Step 3: Write the theme tokens into `src/app/globals.css`**

```css
@import "tailwindcss";

@theme {
	/* ── Colori, campionati dagli smalti ── */
	--color-sp-porcellana: #faf7f3;
	--color-sp-sabbia: #ede3d6;
	--color-sp-inchiostro: #241f1c;
	--color-sp-testo: #4a423d;
	--color-sp-tenue: #5b534e;
	--color-sp-nota: #6e645b;
	--color-sp-terracotta: #c2603a;
	--color-sp-terracotta-scritta: #9a4526;
	--color-sp-rosa: #e4a896;
	--color-sp-glassa: #9faebd;
	--color-sp-verderame: #4a6654;
	--color-sp-bordo: #dfd1bf;

	/* ── Caratteri ── */
	/* Ponte fra le variabili di next/font (su <html>) e le utility Tailwind */
	--font-display: var(--font-display-var);
	--font-testo: var(--font-testo-var);
}

@layer base {
	:root {
		color-scheme: light;
	}

	body {
		background-color: var(--color-sp-porcellana);
		color: var(--color-sp-inchiostro);
	}

	/* Una sola animazione in tutto il sito, e si disattiva su richiesta */
	@media (prefers-reduced-motion: no-preference) {
		.sp-entra {
			animation: sp-entra 0.5s ease-out both;
		}
	}

	@keyframes sp-entra {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
}
```

`--color-sp-bordo` (`#DFD1BF`) is the single hairline value used on the sabbia card. It exists as a token precisely so nobody reintroduces the three near-identical variants the design review caught.

- [ ] **Step 4: Wire the font variables onto `<html>`**

Replace `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { newsreader, quicksand } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
	title: "Sandu Pottery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" className={`${quicksand.variable} ${newsreader.variable} antialiased`}>
			<body className="font-testo">{children}</body>
		</html>
	);
}
```

- [ ] **Step 5: Render a temporary specimen to verify tokens and fonts**

Replace `src/app/page.tsx`. This is scaffolding and is fully replaced in Task 7.

```tsx
const TOKEN = [
	["porcellana", "bg-sp-porcellana border border-sp-bordo"],
	["sabbia", "bg-sp-sabbia"],
	["inchiostro", "bg-sp-inchiostro"],
	["testo", "bg-sp-testo"],
	["tenue", "bg-sp-tenue"],
	["nota", "bg-sp-nota"],
	["terracotta", "bg-sp-terracotta"],
	["terracotta-scritta", "bg-sp-terracotta-scritta"],
	["rosa", "bg-sp-rosa"],
	["glassa", "bg-sp-glassa"],
	["verderame", "bg-sp-verderame"],
] as const;

export default function Home() {
	return (
		<main className="flex flex-col gap-10 p-10">
			<h1 className="font-display text-5xl font-semibold">Sto rifacendo il sito.</h1>
			<p className="max-w-xl font-testo text-xl leading-relaxed text-sp-testo">
				Nel frattempo ci vediamo ai mercatini. Ogni pezzo nasce al tornio, viene modellato e
				decorato a mano: uno per volta, tutti diversi.
			</p>
			<p className="max-w-xl font-testo text-lg italic text-sp-nota">
				La 2ª domenica e il 4° giovedì — corsivo, accenti, ordinali.
			</p>
			<div className="grid grid-cols-4 gap-4">
				{TOKEN.map(([nome, classe]) => (
					<div key={nome} className="flex flex-col gap-2">
						<div className={`h-16 rounded-sm ${classe}`} />
						<span className="font-display text-xs">{nome}</span>
					</div>
				))}
			</div>
		</main>
	);
}
```

- [ ] **Step 6: Verify visually and by build**

```bash
bunx next build && bun run lint && bunx tsc --noEmit
bun run dev
```

Open `http://localhost:3000` and confirm: the heading renders in rounded geometric Quicksand and clearly differs from the serif paragraph; the italic line is a **true** italic, not a slanted roman; `ª` and `°` render as proper ordinals; eleven swatches appear. In DevTools → Network, confirm the three font files are served from `/_next/static/media/` and that **no request goes to `fonts.googleapis.com` or `fonts.gstatic.com`**.

- [ ] **Step 7: Commit**

```bash
git add src/fonts src/lib/fonts.ts src/app/globals.css src/app/layout.tsx src/app/page.tsx
git commit -m "feat: add design tokens and self-hosted quicksand and newsreader"
```

---

### Task 3: Content model and market data

**Files:**
- Create: `src/content/mercati.ts`, `src/content/ricorrenze.ts`, `src/content/sito.ts`, `tests/mercati.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type Mercato = { id: string; inizio: string; fine?: string; citta: string; luogo: string; dettaglio?: string; mappa: string }`
  - `const mercati: readonly Mercato[]` — 25 entries, chronologically sorted
  - `type Ricorrenza = { luogo: string; regolaIt: string; regolaEn: string }`
  - `const ricorrenze: readonly Ricorrenza[]` — 3 entries
  - `const sito` — `{ url, nome, email, instagram, facebook, ragioneSociale, partitaIva, citta }`

- [ ] **Step 1: Write the failing data-integrity test**

`tests/mercati.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { mercati } from "@/content/mercati";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe("mercati", () => {
	test("contiene le 25 date del calendario del cliente", () => {
		expect(mercati.length).toBe(25);
	});

	test("ogni data è una stringa ISO valida", () => {
		for (const m of mercati) {
			expect(m.inizio).toMatch(ISO);
			expect(Number.isNaN(Date.parse(m.inizio))).toBe(false);
			if (m.fine !== undefined) {
				expect(m.fine).toMatch(ISO);
				expect(Number.isNaN(Date.parse(m.fine))).toBe(false);
			}
		}
	});

	test("la fine non precede mai l'inizio", () => {
		for (const m of mercati) {
			if (m.fine !== undefined) expect(m.fine >= m.inizio).toBe(true);
		}
	});

	test("l'elenco è ordinato cronologicamente", () => {
		const date = mercati.map((m) => m.inizio);
		expect([...date].sort()).toEqual(date);
	});

	test("gli id sono unici", () => {
		expect(new Set(mercati.map((m) => m.id)).size).toBe(mercati.length);
	});

	test("gli id sono slug sicuri per un nome di file", () => {
		for (const m of mercati) expect(m.id).toMatch(/^[a-z0-9-]+$/);
	});

	test("ogni mercato ha città, luogo e un link a una mappa", () => {
		for (const m of mercati) {
			expect(m.citta.length).toBeGreaterThan(0);
			expect(m.luogo.length).toBeGreaterThan(0);
			expect(m.mappa.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
		}
	});

	// Le due date che escono dallo schema, entrambe documentate nel PDF del cliente:
	// l'8 dicembre è l'Immacolata (mercato di martedì) e il 22 dicembre è
	// l'ultimo banco prima di Natale, spostato dal giovedì al martedì.
	const ECCEZIONI = new Set(["2026-12-08", "2026-12-22"]);

	test("i mercati ricorrenti compaiono il giorno della settimana giusto", () => {
		const giorno = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();
		for (const m of mercati) {
			if (ECCEZIONI.has(m.inizio)) continue;
			// Bergamo Alta è di domenica, piazza Diaz di giovedì.
			if (m.luogo.includes("Torre Adalberto")) expect(giorno(m.inizio)).toBe(0);
			if (m.luogo === "piazza Diaz") expect(giorno(m.inizio)).toBe(4);
		}
	});

	test("le eccezioni dichiarate esistono davvero nel calendario", () => {
		// Se una data d'eccezione sparisce o cambia, questo test lo dice invece di
		// lasciare l'esclusione a coprire silenziosamente un errore nuovo.
		for (const iso of ECCEZIONI) {
			expect(mercati.some((m) => m.inizio === iso)).toBe(true);
		}
	});
});
```

The last test is the one that earns its keep: it catches a mistyped day number in a recurring market, which is otherwise invisible until a customer turns up on the wrong day.

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test tests/mercati.test.ts`
Expected: FAIL — cannot resolve module `@/content/mercati`.

- [ ] **Step 3: Write `src/content/mercati.ts`**

Transcribed from `docs/fonti-cliente/CALENDARIO SITO.pdf`. Do not edit any date without checking it against that file.

```ts
export type Mercato = {
	/** Slug stabile: diventa anche il nome del file .ics. */
	id: string;
	/** Data ISO YYYY-MM-DD. */
	inizio: string;
	/** Ultimo giorno, se il mercato dura più di una giornata. */
	fine?: string;
	citta: string;
	luogo: string;
	dettaglio?: string;
	mappa: string;
};

const mappa = (q: string) =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const mercati: readonly Mercato[] = [
	// ── Settembre 2026 ──
	{
		id: "2026-09-19-villa-guardia",
		inizio: "2026-09-19",
		fine: "2026-09-20",
		citta: "Villa Guardia",
		luogo: "Parco comunale",
		dettaglio: "L'isola che c'è",
		mappa: mappa("Parco comunale, Villa Guardia CO"),
	},
	{
		id: "2026-09-24-milano-diaz",
		inizio: "2026-09-24",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-09-27-bergamo-alta",
		inizio: "2026-09-27",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},

	// ── Ottobre 2026 ──
	{
		id: "2026-10-10-milano-darsena",
		inizio: "2026-10-10",
		citta: "Milano",
		luogo: "piazza XXIV Maggio",
		dettaglio: "Darsena",
		mappa: mappa("Piazza XXIV Maggio, Milano"),
	},
	{
		id: "2026-10-11-bergamo-cavour",
		inizio: "2026-10-11",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
	{
		id: "2026-10-14-milano-garibaldi",
		inizio: "2026-10-14",
		fine: "2026-10-15",
		citta: "Milano",
		luogo: "corso Garibaldi",
		dettaglio: "MM Moscova",
		mappa: mappa("Corso Garibaldi, Milano"),
	},
	{
		id: "2026-10-17-monza-italia",
		inizio: "2026-10-17",
		citta: "Monza",
		luogo: "corso Italia",
		mappa: mappa("Corso Italia, Monza"),
	},
	{
		id: "2026-10-18-milano-baggio",
		inizio: "2026-10-18",
		citta: "Milano",
		luogo: "Baggio",
		mappa: mappa("Baggio, Milano"),
	},
	{
		id: "2026-10-22-milano-diaz",
		inizio: "2026-10-22",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-10-23-milano-argentina",
		inizio: "2026-10-23",
		fine: "2026-10-24",
		citta: "Milano",
		luogo: "piazza Argentina",
		mappa: mappa("Piazza Argentina, Milano"),
	},
	{
		id: "2026-10-25-bergamo-alta",
		inizio: "2026-10-25",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
	{
		id: "2026-10-31-milano-gramsci",
		inizio: "2026-10-31",
		citta: "Milano",
		luogo: "piazza Gramsci",
		mappa: mappa("Piazza Gramsci, Milano"),
	},

	// ── Novembre 2026 ──
	{
		id: "2026-11-08-bergamo-cavour",
		inizio: "2026-11-08",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
	{
		id: "2026-11-15-monza-italia",
		inizio: "2026-11-15",
		citta: "Monza",
		luogo: "corso Italia",
		mappa: mappa("Corso Italia, Monza"),
	},
	{
		id: "2026-11-21-milano-marconi",
		inizio: "2026-11-21",
		citta: "Milano",
		luogo: "via Marconi",
		dettaglio: "angolo piazza Duomo",
		mappa: mappa("Via Marconi, Milano"),
	},
	{
		id: "2026-11-22-bergamo-alta",
		inizio: "2026-11-22",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
	{
		id: "2026-11-26-milano-diaz",
		inizio: "2026-11-26",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-11-29-bergamo-alta",
		inizio: "2026-11-29",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},

	// ── Dicembre 2026 ──
	{
		id: "2026-12-02-milano-garibaldi",
		inizio: "2026-12-02",
		fine: "2026-12-03",
		citta: "Milano",
		luogo: "corso Garibaldi",
		dettaglio: "MM Moscova",
		mappa: mappa("Corso Garibaldi, Milano"),
	},
	{
		id: "2026-12-08-bergamo-alta",
		inizio: "2026-12-08",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
	{
		id: "2026-12-12-milano-gramsci",
		inizio: "2026-12-12",
		citta: "Milano",
		luogo: "piazza Gramsci",
		mappa: mappa("Piazza Gramsci, Milano"),
	},
	{
		id: "2026-12-13-bergamo-cavour",
		inizio: "2026-12-13",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
	{
		id: "2026-12-18-milano-argentina",
		inizio: "2026-12-18",
		fine: "2026-12-20",
		citta: "Milano",
		luogo: "piazza Argentina",
		mappa: mappa("Piazza Argentina, Milano"),
	},
	{
		id: "2026-12-22-milano-diaz",
		inizio: "2026-12-22",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-12-27-bergamo-alta",
		inizio: "2026-12-27",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
];
```

All 31 individual days were checked against the weekday the client's PDF states for each — 0 discrepancies, so the PDF is internally consistent and this transcription matches it. Two dates legitimately break the recurring pattern and are already listed in `ECCEZIONI` above: **8 December** (Bergamo Alta on a Tuesday — Immacolata) and **22 December** (piazza Diaz on a Tuesday, moved before Christmas).

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test tests/mercati.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Write `src/content/ricorrenze.ts`**

```ts
export type Ricorrenza = {
	luogo: string;
	regolaIt: string;
	regolaEn: string;
};

export const ricorrenze: readonly Ricorrenza[] = [
	{
		luogo: "Bergamo Bassa",
		regolaIt: "la 2ª domenica — da marzo a giugno, e da ottobre a dicembre",
		regolaEn: "2nd Sunday — March to June, and October to December",
	},
	{
		luogo: "Bergamo Alta",
		regolaIt: "la 4ª domenica — da aprile a giugno, e da settembre a dicembre",
		regolaEn: "4th Sunday — April to June, and September to December",
	},
	{
		luogo: "Milano, piazza Diaz",
		regolaIt: "il 4° giovedì di ogni mese",
		regolaEn: "4th Thursday of every month",
	},
];
```

- [ ] **Step 6: Write `src/content/sito.ts`**

```ts
/**
 * Valori fra parentesi quadre = da confermare con la cliente.
 * Non inventarli: devono restare visibili finché non arriva il dato vero.
 */
export const sito = {
	url: "https://sandupottery.com",
	nome: "Sandu Pottery",
	citta: "Bergamo",
	email: "[EMAIL DA CONFERMARE]",
	instagram: "https://www.instagram.com/sandu_pottery/",
	facebook: "https://www.facebook.com/p/Sandupottery-100063684326940/",
	ragioneSociale: "[RAGIONE SOCIALE DA CONFERMARE]",
	partitaIva: "[P.IVA DA CONFERMARE]",
} as const;

/** True finché la cliente non ha fornito il dato. Nasconde i mailto rotti. */
export const emailDaConfermare = sito.email.startsWith("[");
```

`emailDaConfermare` matters: a `mailto:[EMAIL DA CONFERMARE]` link is worse than no link, so Task 10 renders plain text until the real address arrives.

- [ ] **Step 7: Run all gates and commit**

```bash
bun test && bun run lint && bunx tsc --noEmit
git add src/content tests/mercati.test.ts
git commit -m "feat: add market calendar, recurring markets and site constants"
```

---

### Task 4: Date helpers

**Files:**
- Create: `src/lib/date.ts`, `tests/date.test.ts`

**Interfaces:**
- Consumes: `Mercato` from `@/content/mercati`
- Produces:
  - `type Locale = "it" | "en"`
  - `oggiRoma(adesso?: Date): string`
  - `ultimoGiorno(m: Intervallo): string`
  - `eFuturo(m: Intervallo, oggi: string): boolean`
  - `eOggi(m: Intervallo, oggi: string): boolean`
  - `giornoDopo(iso: string): string`
  - `giorniBrevi(m: Intervallo): string`
  - `etichettaLunga(m: Intervallo, locale: Locale): string`
  - `raggruppaPerMese<T extends Intervallo>(voci: readonly T[], locale: Locale): { chiave: string; etichetta: string; voci: T[] }[]`

- [ ] **Step 1: Write the failing tests**

`tests/date.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import {
	eFuturo,
	eOggi,
	etichettaLunga,
	giorniBrevi,
	giornoDopo,
	oggiRoma,
	raggruppaPerMese,
	ultimoGiorno,
} from "@/lib/date";

describe("oggiRoma", () => {
	test("restituisce la data di Roma, non quella UTC", () => {
		// 2026-06-14T23:30:00Z è già il 15 giugno a Roma (UTC+2).
		expect(oggiRoma(new Date("2026-06-14T23:30:00Z"))).toBe("2026-06-15");
	});

	test("gestisce l'ora solare", () => {
		// 2026-01-14T23:30:00Z è già il 15 gennaio a Roma (UTC+1).
		expect(oggiRoma(new Date("2026-01-14T23:30:00Z"))).toBe("2026-01-15");
	});

	test("prima di mezzanotte a Roma resta il giorno precedente", () => {
		expect(oggiRoma(new Date("2026-06-14T21:30:00Z"))).toBe("2026-06-14");
	});
});

describe("ultimoGiorno", () => {
	test("usa fine quando c'è", () => {
		expect(ultimoGiorno({ inizio: "2026-09-19", fine: "2026-09-20" })).toBe("2026-09-20");
	});

	test("ricade su inizio quando manca fine", () => {
		expect(ultimoGiorno({ inizio: "2026-09-24" })).toBe("2026-09-24");
	});
});

describe("eFuturo", () => {
	test("un mercato di oggi è ancora futuro", () => {
		expect(eFuturo({ inizio: "2026-09-24" }, "2026-09-24")).toBe(true);
	});

	test("l'ultimo giorno di un mercato lungo è ancora futuro", () => {
		expect(eFuturo({ inizio: "2026-09-19", fine: "2026-09-20" }, "2026-09-20")).toBe(true);
	});

	test("il giorno dopo la fine non lo è più", () => {
		expect(eFuturo({ inizio: "2026-09-19", fine: "2026-09-20" }, "2026-09-21")).toBe(false);
	});
});

describe("eOggi", () => {
	test("vero nel mezzo di un mercato di più giorni", () => {
		expect(eOggi({ inizio: "2026-12-18", fine: "2026-12-20" }, "2026-12-19")).toBe(true);
	});

	test("falso prima dell'inizio", () => {
		expect(eOggi({ inizio: "2026-12-18", fine: "2026-12-20" }, "2026-12-17")).toBe(false);
	});
});

describe("giornoDopo", () => {
	test("avanza di un giorno", () => {
		expect(giornoDopo("2026-09-20")).toBe("2026-09-21");
	});

	test("attraversa il cambio di mese", () => {
		expect(giornoDopo("2026-10-31")).toBe("2026-11-01");
	});

	test("attraversa il cambio d'anno", () => {
		expect(giornoDopo("2026-12-31")).toBe("2027-01-01");
	});
});

describe("giorniBrevi", () => {
	test("un solo giorno", () => {
		expect(giorniBrevi({ inizio: "2026-09-24" })).toBe("24");
	});

	test("due giorni consecutivi", () => {
		expect(giorniBrevi({ inizio: "2026-09-19", fine: "2026-09-20" })).toBe("19–20");
	});
});

describe("etichettaLunga", () => {
	test("italiano, un giorno", () => {
		expect(etichettaLunga({ inizio: "2026-09-24" }, "it")).toBe("giovedì 24 settembre");
	});

	test("italiano, due giorni", () => {
		expect(etichettaLunga({ inizio: "2026-09-19", fine: "2026-09-20" }, "it")).toBe(
			"sabato 19 – domenica 20 settembre",
		);
	});

	test("italiano, intervallo a cavallo di due mesi", () => {
		expect(etichettaLunga({ inizio: "2026-10-31", fine: "2026-11-01" }, "it")).toBe(
			"sabato 31 ottobre – domenica 1 novembre",
		);
	});

	test("inglese", () => {
		expect(etichettaLunga({ inizio: "2026-09-24" }, "en")).toBe("Thursday 24 September");
	});
});

describe("raggruppaPerMese", () => {
	const voci = [
		{ inizio: "2026-09-24" },
		{ inizio: "2026-09-27" },
		{ inizio: "2026-10-10" },
	];

	test("raggruppa in ordine e conserva le voci", () => {
		const gruppi = raggruppaPerMese(voci, "it");
		expect(gruppi.map((g) => g.chiave)).toEqual(["2026-09", "2026-10"]);
		expect(gruppi[0]?.voci.length).toBe(2);
		expect(gruppi[1]?.voci.length).toBe(1);
	});

	test("etichetta il mese nella lingua giusta", () => {
		expect(raggruppaPerMese(voci, "it")[0]?.etichetta).toBe("Settembre");
		expect(raggruppaPerMese(voci, "en")[0]?.etichetta).toBe("September");
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test tests/date.test.ts`
Expected: FAIL — cannot resolve module `@/lib/date`.

- [ ] **Step 3: Write `src/lib/date.ts`**

```ts
export type Locale = "it" | "en";

export type Intervallo = {
	inizio: string;
	fine?: string;
};

const FUSO = "Europe/Rome";

/**
 * La data di oggi a Roma, come stringa ISO.
 * Non usare toISOString(): a mezzanotte e mezza ora legale UTC è ancora ieri,
 * e la pagina annuncerebbe il mercato del giorno prima.
 */
export function oggiRoma(adesso: Date = new Date()): string {
	// en-CA formatta come YYYY-MM-DD.
	return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(adesso);
}

/** L'ultimo giorno dell'intervallo: quello che finisce in data-fine. */
export function ultimoGiorno(m: Intervallo): string {
	return m.fine ?? m.inizio;
}

/** Il mercato non è ancora finito rispetto a `oggi`. */
export function eFuturo(m: Intervallo, oggi: string): boolean {
	return ultimoGiorno(m) >= oggi;
}

/** `oggi` cade dentro l'intervallo, estremi inclusi. */
export function eOggi(m: Intervallo, oggi: string): boolean {
	return m.inizio <= oggi && oggi <= ultimoGiorno(m);
}

/** ISO + 1 giorno. Serve al DTEND dei .ics, che è esclusivo. */
export function giornoDopo(iso: string): string {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 1);
	return d.toISOString().slice(0, 10);
}

const giorno = (iso: string) => Number(iso.slice(8, 10));

/** "24" oppure "19–20": solo i numeri, per l'elenco fitto. */
export function giorniBrevi(m: Intervallo): string {
	if (m.fine === undefined || m.fine === m.inizio) return String(giorno(m.inizio));
	return `${giorno(m.inizio)}–${giorno(m.fine)}`;
}

function formatta(iso: string, locale: Locale, opzioni: Intl.DateTimeFormatOptions): string {
	const lingua = locale === "it" ? "it-IT" : "en-GB";
	return new Intl.DateTimeFormat(lingua, { ...opzioni, timeZone: "UTC" }).format(
		new Date(`${iso}T12:00:00Z`),
	);
}

/** "giovedì 24 settembre" oppure "sabato 19 – domenica 20 settembre". */
export function etichettaLunga(m: Intervallo, locale: Locale): string {
	const conMese: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
	const senzaMese: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric" };

	if (m.fine === undefined || m.fine === m.inizio) return formatta(m.inizio, locale, conMese);

	const stessoMese = m.inizio.slice(0, 7) === m.fine.slice(0, 7);
	const primo = formatta(m.inizio, locale, stessoMese ? senzaMese : conMese);
	return `${primo} – ${formatta(m.fine, locale, conMese)}`;
}

/** Raggruppa per mese, conservando l'ordine cronologico. */
export function raggruppaPerMese<T extends Intervallo>(
	voci: readonly T[],
	locale: Locale,
): { chiave: string; etichetta: string; voci: T[] }[] {
	const gruppi: { chiave: string; etichetta: string; voci: T[] }[] = [];

	for (const voce of voci) {
		const chiave = voce.inizio.slice(0, 7);
		const ultimo = gruppi.at(-1);
		if (ultimo?.chiave === chiave) {
			ultimo.voci.push(voce);
			continue;
		}
		const nome = formatta(voce.inizio, locale, { month: "long" });
		gruppi.push({
			chiave,
			etichetta: nome.charAt(0).toUpperCase() + nome.slice(1),
			voci: [voce],
		});
	}

	return gruppi;
}
```

Every formatter pins `timeZone: "UTC"` and parses at noon. Without that, `new Date("2026-09-24")` is midnight UTC, which in a browser west of Greenwich formats as 23 September.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test tests/date.test.ts`
Expected: PASS — 19 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/date.ts tests/date.test.ts
git commit -m "feat: add rome-timezone date helpers for the market calendar"
```

---

### Task 5: `.ics` generation and build wiring

**Files:**
- Create: `src/lib/ics.ts`, `scripts/genera-ics.ts`, `tests/ics.test.ts`

**Interfaces:**
- Consumes: `Mercato`, `giornoDopo` from `@/lib/date`, `sito`
- Produces:
  - `type EventoICS = { uid: string; inizio: string; fine?: string; titolo: string; luogo: string; url: string }`
  - `creaICS(eventi: readonly EventoICS[], nomeCalendario: string, dtstamp: string): string`
  - `scripts/genera-ics.ts` writing `out/calendario/<id>.ics` and `out/calendario/mercatini.ics`

- [ ] **Step 1: Write the failing tests**

`tests/ics.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { creaICS, type EventoICS } from "@/lib/ics";

const STAMP = "20260826T120000Z";

const evento: EventoICS = {
	uid: "2026-09-24-milano-diaz",
	inizio: "2026-09-24",
	titolo: "Sandu Pottery — Milano, piazza Diaz",
	luogo: "piazza Diaz, Milano",
	url: "https://sandupottery.com",
};

describe("creaICS", () => {
	test("usa terminatori di riga CRLF", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics.includes("\r\n")).toBe(true);
		expect(/[^\r]\n/.test(ics)).toBe(false);
	});

	test("apre e chiude il calendario", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
		expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
		expect(ics).toContain("VERSION:2.0");
		expect(ics).toContain("CALSCALE:GREGORIAN");
	});

	test("scrive un evento di un giorno come data intera con DTEND esclusivo", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics).toContain("DTSTART;VALUE=DATE:20260924");
		// DTEND è esclusivo: il giorno DOPO l'ultimo giorno.
		expect(ics).toContain("DTEND;VALUE=DATE:20260925");
	});

	test("scrive un evento di due giorni con DTEND al terzo giorno", () => {
		const ics = creaICS(
			[{ ...evento, uid: "x", inizio: "2026-09-19", fine: "2026-09-20" }],
			"Mercatini",
			STAMP,
		);
		expect(ics).toContain("DTSTART;VALUE=DATE:20260919");
		expect(ics).toContain("DTEND;VALUE=DATE:20260921");
	});

	test("rende gli UID unici per dominio", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics).toContain("UID:2026-09-24-milano-diaz@sandupottery.com");
	});

	test("fa l'escape di virgole, punti e virgola e barre rovesce", () => {
		const ics = creaICS(
			[{ ...evento, titolo: "Milano, piazza Diaz; banco 3 \\ tornio" }],
			"Mercatini",
			STAMP,
		);
		expect(ics).toContain("SUMMARY:Milano\\, piazza Diaz\\; banco 3 \\\\ tornio");
	});

	test("piega le righe più lunghe di 75 ottetti", () => {
		const lungo = "A".repeat(200);
		const ics = creaICS([{ ...evento, titolo: lungo }], "Mercatini", STAMP);
		for (const riga of ics.split("\r\n")) {
			expect(Buffer.byteLength(riga, "utf8")).toBeLessThanOrEqual(75);
		}
		// Le continuazioni iniziano con uno spazio.
		expect(ics).toContain("\r\n A");
	});

	test("non spezza un carattere multi-byte a fine riga", () => {
		// Accenti fitti attorno all'ottetto 75: se la maschera di continuazione
		// non viene applicata, qui compare un carattere di sostituzione.
		const titolo = `${"è".repeat(60)} coda`;
		const ics = creaICS([{ ...evento, titolo }], "Mercatini", STAMP);
		expect(ics).not.toContain("\uFFFD");
		const ricomposto = ics
			.split("\r\n")
			.filter((r) => r.startsWith("SUMMARY:") || r.startsWith(" "))
			.map((r, i) => (i === 0 ? r.slice("SUMMARY:".length) : r.slice(1)))
			.join("");
		expect(ricomposto).toBe(titolo);
	});

	test("è deterministico a parità di input", () => {
		expect(creaICS([evento], "Mercatini", STAMP)).toBe(creaICS([evento], "Mercatini", STAMP));
	});
});
```

`dtstamp` is a parameter rather than `new Date()` precisely so the output is byte-identical across runs — otherwise every build produces different files and the deploy diff is noise.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test tests/ics.test.ts`
Expected: FAIL — cannot resolve module `@/lib/ics`.

- [ ] **Step 3: Write `src/lib/ics.ts`**

```ts
import { giornoDopo } from "@/lib/date";

export type EventoICS = {
	uid: string;
	inizio: string;
	fine?: string;
	titolo: string;
	luogo: string;
	url: string;
};

const DOMINIO = "sandupottery.com";

/** RFC 5545 §3.3.11: virgola, punto e virgola, barra rovescia e a capo. */
function escapeTesto(v: string): string {
	return v
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1: righe di massimo 75 ottetti, continuazioni con uno spazio. */
function piega(riga: string): string {
	const byte = Buffer.from(riga, "utf8");
	if (byte.length <= 75) return riga;

	const pezzi: string[] = [];
	let inizio = 0;
	let limite = 75;

	while (inizio < byte.length) {
		let fine = Math.min(inizio + limite, byte.length);
		// Non spezzare mai a metà di un carattere multi-byte: i byte di
		// continuazione UTF-8 hanno i due bit alti a 10.
		// Le parentesi contano: `x as number & 0xc0` verrebbe letto come
		// intersezione di tipi e la maschera non verrebbe mai applicata.
		while (fine > inizio && fine < byte.length && ((byte[fine] as number) & 0xc0) === 0x80) {
			fine--;
		}
		pezzi.push(byte.subarray(inizio, fine).toString("utf8"));
		inizio = fine;
		limite = 74; // le righe successive perdono un ottetto per lo spazio iniziale
	}

	return pezzi.join("\r\n ");
}

const data = (iso: string) => iso.replace(/-/g, "");

export function creaICS(
	eventi: readonly EventoICS[],
	nomeCalendario: string,
	dtstamp: string,
): string {
	const righe: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//${DOMINIO}//lavori in corso//IT`,
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${escapeTesto(nomeCalendario)}`,
	];

	for (const e of eventi) {
		righe.push(
			"BEGIN:VEVENT",
			`UID:${e.uid}@${DOMINIO}`,
			`DTSTAMP:${dtstamp}`,
			`DTSTART;VALUE=DATE:${data(e.inizio)}`,
			`DTEND;VALUE=DATE:${data(giornoDopo(e.fine ?? e.inizio))}`,
			`SUMMARY:${escapeTesto(e.titolo)}`,
			`LOCATION:${escapeTesto(e.luogo)}`,
			`URL:${escapeTesto(e.url)}`,
			"END:VEVENT",
		);
	}

	righe.push("END:VCALENDAR");

	return `${righe.map(piega).join("\r\n")}\r\n`;
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test tests/ics.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Write `scripts/genera-ics.ts`**

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mercati } from "@/content/mercati";
import { sito } from "@/content/sito";
import { creaICS, type EventoICS } from "@/lib/ics";

const USCITA = join(process.cwd(), "out", "calendario");

/**
 * DTSTAMP fisso rispetto all'ultima data del calendario, non a "adesso":
 * così due build sullo stesso contenuto producono file identici.
 */
const DTSTAMP = "20260826T120000Z";

function aEvento(m: (typeof mercati)[number]): EventoICS {
	const dove = m.dettaglio ? `${m.luogo} (${m.dettaglio})` : m.luogo;
	return {
		uid: m.id,
		inizio: m.inizio,
		fine: m.fine,
		titolo: `${sito.nome} — ${m.citta}, ${dove}`,
		luogo: `${dove}, ${m.citta}`,
		url: sito.url,
	};
}

async function main(): Promise<void> {
	await mkdir(USCITA, { recursive: true });

	const eventi = mercati.map(aEvento);

	await writeFile(
		join(USCITA, "mercatini.ics"),
		creaICS(eventi, `${sito.nome} — mercatini`, DTSTAMP),
		"utf8",
	);

	await Promise.all(
		eventi.map((e) =>
			writeFile(join(USCITA, `${e.uid}.ics`), creaICS([e], e.titolo, DTSTAMP), "utf8"),
		),
	);

	console.log(`calendario: ${eventi.length + 1} file .ics scritti in out/calendario`);
}

await main();
```

- [ ] **Step 6: Run the full build and verify the files land**

```bash
bun run build
ls out/calendario | head -5
wc -l < out/calendario/mercatini.ics
head -12 out/calendario/2026-09-19-villa-guardia.ics
```

Expected: 26 files in `out/calendario`; the multi-day file shows `DTSTART;VALUE=DATE:20260919` and `DTEND;VALUE=DATE:20260921`.

- [ ] **Step 7: Verify a real calendar client accepts one**

Open `out/calendario/2026-09-19-villa-guardia.ics` in macOS Calendar (`open out/calendario/2026-09-19-villa-guardia.ics`). Confirm it offers to add a two-day all-day event on 19–20 September 2026, **not** 19–21. If it shows three days, `giornoDopo` is being applied twice.

- [ ] **Step 8: Commit**

```bash
git add src/lib/ics.ts scripts/genera-ics.ts tests/ics.test.ts
git commit -m "feat: generate ics files for every market at build time"
```

---

### Task 6: JSON-LD builders

**Files:**
- Create: `src/lib/jsonld.ts`, `tests/jsonld.test.ts`

**Interfaces:**
- Consumes: `Mercato`, `sito`, `Locale`
- Produces:
  - `costruisciEventi(mercati: readonly Mercato[], locale: Locale): object[]`
  - `costruisciAttivita(locale: Locale): object`
  - `graficoJsonLd(mercati: readonly Mercato[], locale: Locale): string` — the serialised `@graph` for injection

- [ ] **Step 1: Write the failing tests**

`tests/jsonld.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import type { Mercato } from "@/content/mercati";
import { costruisciAttivita, costruisciEventi, graficoJsonLd } from "@/lib/jsonld";

const unGiorno: Mercato = {
	id: "2026-09-24-milano-diaz",
	inizio: "2026-09-24",
	citta: "Milano",
	luogo: "piazza Diaz",
	mappa: "https://www.google.com/maps/search/?api=1&query=Piazza%20Diaz%2C%20Milano",
};

const dueGiorni: Mercato = {
	id: "2026-09-19-villa-guardia",
	inizio: "2026-09-19",
	fine: "2026-09-20",
	citta: "Villa Guardia",
	luogo: "Parco comunale",
	dettaglio: "L'isola che c'è",
	mappa: "https://www.google.com/maps/search/?api=1&query=x",
};

describe("costruisciEventi", () => {
	test("produce un Event per mercato", () => {
		expect(costruisciEventi([unGiorno, dueGiorni], "it").length).toBe(2);
	});

	test("marca il tipo e lo stato richiesti da Google", () => {
		const [e] = costruisciEventi([unGiorno], "it") as Record<string, unknown>[];
		expect(e?.["@type"]).toBe("Event");
		expect(e?.eventStatus).toBe("https://schema.org/EventScheduled");
		expect(e?.eventAttendanceMode).toBe("https://schema.org/OfflineEventAttendanceMode");
	});

	test("un evento di un giorno ha startDate uguale a endDate", () => {
		const [e] = costruisciEventi([unGiorno], "it") as Record<string, unknown>[];
		expect(e?.startDate).toBe("2026-09-24");
		expect(e?.endDate).toBe("2026-09-24");
	});

	test("un evento lungo ha endDate all'ultimo giorno, non al giorno dopo", () => {
		const [e] = costruisciEventi([dueGiorni], "it") as Record<string, unknown>[];
		expect(e?.startDate).toBe("2026-09-19");
		expect(e?.endDate).toBe("2026-09-20");
	});

	test("la location è un Place con indirizzo postale", () => {
		const [e] = costruisciEventi([unGiorno], "it") as Record<string, unknown>[];
		const luogo = e?.location as Record<string, unknown>;
		expect(luogo["@type"]).toBe("Place");
		expect(luogo.name).toBe("piazza Diaz");
		const indirizzo = luogo.address as Record<string, unknown>;
		expect(indirizzo["@type"]).toBe("PostalAddress");
		expect(indirizzo.addressLocality).toBe("Milano");
		expect(indirizzo.addressCountry).toBe("IT");
	});

	test("il dettaglio entra nel nome dell'evento", () => {
		const [e] = costruisciEventi([dueGiorni], "it") as Record<string, unknown>[];
		expect(String(e?.name)).toContain("L'isola che c'è");
	});
});

describe("costruisciAttivita", () => {
	test("descrive l'attività come LocalBusiness a Bergamo", () => {
		const a = costruisciAttivita("it") as Record<string, unknown>;
		expect(a["@type"]).toBe("LocalBusiness");
		expect(a.name).toBe("Sandu Pottery");
		const indirizzo = a.address as Record<string, unknown>;
		expect(indirizzo.addressLocality).toBe("Bergamo");
	});

	test("elenca i profili social come sameAs", () => {
		const a = costruisciAttivita("it") as Record<string, unknown>;
		expect((a.sameAs as string[]).some((u) => u.includes("instagram"))).toBe(true);
	});
});

describe("graficoJsonLd", () => {
	test("è JSON valido con un @graph", () => {
		const analizzato = JSON.parse(graficoJsonLd([unGiorno], "it")) as Record<string, unknown>;
		expect(analizzato["@context"]).toBe("https://schema.org");
		expect((analizzato["@graph"] as unknown[]).length).toBe(2);
	});

	test("non contiene < che possa chiudere il tag script", () => {
		expect(graficoJsonLd([unGiorno], "it")).not.toContain("<");
	});
});
```

The final test is a real XSS guard: an unescaped `<` in JSON-LD can terminate the surrounding `<script>` element.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun test tests/jsonld.test.ts`
Expected: FAIL — cannot resolve module `@/lib/jsonld`.

- [ ] **Step 3: Write `src/lib/jsonld.ts`**

```ts
import type { Mercato } from "@/content/mercati";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";
import { ultimoGiorno } from "@/lib/date";

const DESCRIZIONE: Record<Locale, string> = {
	it: "Creazioni in ceramica lavorate a mano e al tornio, da Bergamo.",
	en: "Handmade wheel-thrown ceramics from Bergamo, Italy.",
};

function nomeEvento(m: Mercato): string {
	const dove = m.dettaglio ? `${m.dettaglio}, ${m.luogo}` : m.luogo;
	return `${sito.nome} — ${dove}, ${m.citta}`;
}

export function costruisciEventi(mercati: readonly Mercato[], locale: Locale): object[] {
	return mercati.map((m) => ({
		"@type": "Event",
		name: nomeEvento(m),
		description: DESCRIZIONE[locale],
		startDate: m.inizio,
		// schema.org endDate è INCLUSIVO — al contrario del DTEND dei .ics.
		endDate: ultimoGiorno(m),
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
		location: {
			"@type": "Place",
			name: m.luogo,
			address: {
				"@type": "PostalAddress",
				addressLocality: m.citta,
				addressCountry: "IT",
			},
			hasMap: m.mappa,
		},
		organizer: {
			"@type": "Organization",
			name: sito.nome,
			url: sito.url,
		},
		url: sito.url,
	}));
}

export function costruisciAttivita(locale: Locale): object {
	return {
		"@type": "LocalBusiness",
		name: sito.nome,
		description: DESCRIZIONE[locale],
		url: sito.url,
		address: {
			"@type": "PostalAddress",
			addressLocality: sito.citta,
			addressCountry: "IT",
		},
		sameAs: [sito.instagram, sito.facebook],
	};
}

/**
 * Il grafo serializzato, pronto per <script type="application/ld+json">.
 * Gli < vengono neutralizzati: un < non sfuggito chiuderebbe il tag script.
 */
export function graficoJsonLd(mercati: readonly Mercato[], locale: Locale): string {
	const grafo = {
		"@context": "https://schema.org",
		"@graph": [costruisciAttivita(locale), ...costruisciEventi(mercati, locale)],
	};
	return JSON.stringify(grafo).replace(/</g, "\\u003c");
}
```

Note the asymmetry, and do not "fix" it: `.ics` `DTEND` is **exclusive** (day after), schema.org `endDate` is **inclusive** (last day). Both are correct as written.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun test tests/jsonld.test.ts`
Expected: PASS — 10 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/jsonld.ts tests/jsonld.test.ts
git commit -m "feat: build event and localbusiness json-ld from the market data"
```

---

### Task 7: Dictionary and bilingual routes

**Files:**
- Create: `src/content/dizionario.ts`, `src/app/en/page.tsx`, `tests/dizionario.test.ts`
- Modify: `src/app/page.tsx`, `src/app/layout.tsx`

**Interfaces:**
- Consumes: `Locale` from `@/lib/date`
- Produces:
  - `type Dizionario` — the full string set
  - `const dizionari: Record<Locale, Dizionario>`
  - `src/components/Pagina.tsx` is expected by both routes with signature `({ locale }: { locale: Locale })` — created in Task 8; this task stubs it.

- [ ] **Step 1: Write the failing test**

`tests/dizionario.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { dizionari } from "@/content/dizionario";

describe("dizionari", () => {
	test("esistono entrambe le lingue", () => {
		expect(Object.keys(dizionari).sort()).toEqual(["en", "it"]);
	});

	test("le due lingue hanno esattamente le stesse chiavi", () => {
		expect(Object.keys(dizionari.en).sort()).toEqual(Object.keys(dizionari.it).sort());
	});

	test("nessuna stringa è vuota", () => {
		for (const [lingua, d] of Object.entries(dizionari)) {
			for (const [chiave, valore] of Object.entries(d)) {
				expect(typeof valore === "string" && valore.length > 0).toBe(true);
				if (typeof valore !== "string" || valore.length === 0) {
					throw new Error(`${lingua}.${chiave} è vuota`);
				}
			}
		}
	});

	test("nessuna stringa inglese è rimasta in italiano", () => {
		// Sentinella grossolana ma efficace su una copia così breve.
		expect(dizionari.en.titolo).not.toBe(dizionari.it.titolo);
		expect(dizionari.en.doveMiTrovi).not.toBe(dizionari.it.doveMiTrovi);
	});
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun test tests/dizionario.test.ts`
Expected: FAIL — cannot resolve module `@/content/dizionario`.

- [ ] **Step 3: Write `src/content/dizionario.ts`**

```ts
import type { Locale } from "@/lib/date";

export type Dizionario = {
	occhiello: string;
	titolo: string;
	introduzione: string;
	prossimoMercatino: string;
	oggiSonoA: string;
	doveMiTrovi: string;
	doveSottotitolo: string;
	ogniMeseSempre: string;
	ogniMeseNota: string;
	prossimeDate: string;
	nessunaData: string;
	aggiungiAlCalendario: string;
	tutteLeDate: string;
	qualchePezzo: string;
	qualcheSottotitolo: string;
	scrivimi: string;
	scrivimiTesto: string;
	altraLingua: string;
	altraLinguaHref: string;
	descrizioneMeta: string;
};

export const dizionari: Record<Locale, Dizionario> = {
	it: {
		occhiello: "Ceramica fatta a mano · Bergamo",
		titolo: "Sto rifacendo il sito.",
		introduzione:
			"Nel frattempo ci vediamo ai mercatini. Ogni pezzo nasce al tornio, viene modellato e decorato a mano: uno per volta, tutti diversi.",
		prossimoMercatino: "Prossimo mercatino",
		oggiSonoA: "Oggi sono a",
		doveMiTrovi: "Dove mi trovi",
		doveSottotitolo: "Banco, tornio e gatti. Se passi, ti riconosco.",
		ogniMeseSempre: "Ogni mese, sempre",
		ogniMeseNota: "Queste non cambiano mai: se sei di Bergamo, sai già dove trovarmi.",
		prossimeDate: "Prossime date",
		nessunaData:
			"Le date del prossimo anno arrivano presto — scrivimi e ti dico dove sono.",
		aggiungiAlCalendario: "Aggiungi al calendario",
		tutteLeDate: "Scarica tutte le date",
		qualchePezzo: "Qualche pezzo",
		qualcheSottotitolo: "Gattetazze, corpi, foglie. Tutti fatti al tornio, uno per volta.",
		scrivimi: "Scrivimi",
		scrivimiTesto:
			"Per un pezzo su misura, un regalo o solo per sapere dove sarò: mandami due righe.",
		altraLingua: "English",
		altraLinguaHref: "/en",
		descrizioneMeta:
			"Creazioni in ceramica lavorate a mano e al tornio, da Bergamo. Il calendario dei prossimi mercatini e come contattarmi.",
	},
	en: {
		occhiello: "Handmade ceramics · Bergamo, Italy",
		titolo: "I'm rebuilding the site.",
		introduzione:
			"In the meantime, come and find me at the markets. Every piece is thrown on the wheel, shaped and decorated by hand: one at a time, all different.",
		prossimoMercatino: "Next market",
		oggiSonoA: "Today I'm at",
		doveMiTrovi: "Where to find me",
		doveSottotitolo: "A stall, a wheel and a lot of cats. Say hello if you're passing.",
		ogniMeseSempre: "Every month, always",
		ogniMeseNota: "These never change — if you're local, you already know where I am.",
		prossimeDate: "Upcoming dates",
		nessunaData: "Next year's dates are coming soon — write to me and I'll tell you where I'll be.",
		aggiungiAlCalendario: "Add to calendar",
		tutteLeDate: "Download every date",
		qualchePezzo: "A few pieces",
		qualcheSottotitolo: "Cat cups, bodies, leaves. All thrown on the wheel, one at a time.",
		scrivimi: "Write to me",
		scrivimiTesto:
			"For a commission, a gift, or just to ask where I'll be next: drop me a line.",
		altraLingua: "Italiano",
		altraLinguaHref: "/",
		descrizioneMeta:
			"Handmade wheel-thrown ceramics from Bergamo, Italy. The calendar of upcoming craft markets and how to get in touch.",
	},
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun test tests/dizionario.test.ts`
Expected: PASS — 4 tests.

- [ ] **Step 5: Stub `src/components/Pagina.tsx` so the routes compile**

Task 8 fills this in. The stub exists so this task's deliverable — two working routes with correct metadata — is independently testable.

```tsx
import type { Locale } from "@/lib/date";

export function Pagina({ locale }: { locale: Locale }) {
	return <main data-locale={locale}>Sandu Pottery</main>;
}
```

- [ ] **Step 6: Write both routes**

`src/app/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Pagina } from "@/components/Pagina";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
	title: sito.nome,
	description: dizionari.it.descrizioneMeta,
	alternates: {
		canonical: sito.url,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
};

export default function Home() {
	return <Pagina locale="it" />;
}
```

`src/app/en/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Pagina } from "@/components/Pagina";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
	title: sito.nome,
	description: dizionari.en.descrizioneMeta,
	alternates: {
		canonical: `${sito.url}/en`,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
};

export default function HomeEn() {
	return <Pagina locale="en" />;
}
```

- [ ] **Step 7: Set `lang` per route**

`output: "export"` renders one `<html>` from the shared root layout, so `lang` cannot vary from `layout.tsx`. Add a nested layout at `src/app/en/layout.tsx` that fixes the attribute on the English subtree's `<main>` wrapper instead, and keep `<html lang="it">` as the document default:

```tsx
export default function LayoutEn({ children }: { children: React.ReactNode }) {
	return <div lang="en">{children}</div>;
}
```

A `lang` on a wrapping element is valid HTML and is what screen readers use for the content; the document-level `it` remains correct for the default route.

- [ ] **Step 8: Build and verify both routes exist**

```bash
bunx next build
ls out/index.html out/en.html
grep -o 'hreflang="[a-z]*"' out/index.html | sort -u
grep -o 'lang="en"' out/en.html
```

Expected: both HTML files exist; `hreflang="it"` and `hreflang="en"` both appear; `out/en.html` carries `lang="en"` on the wrapper.

- [ ] **Step 9: Commit**

```bash
git add src/content/dizionario.ts src/components/Pagina.tsx src/app tests/dizionario.test.ts
git commit -m "feat: add italian and english routes with a type-linked dictionary"
```

---

### Task 8: Marks, header, hero and next-market card

**Files:**
- Create: `src/components/Zampina.tsx`, `src/components/Filo.tsx`, `src/components/Intestazione.tsx`, `src/components/Apertura.tsx`, `src/components/CartaProssimo.tsx`
- Modify: `src/components/Pagina.tsx`
- Add: `public/foto/gatti-calico.jpg`

**Interfaces:**
- Consumes: `dizionari`, `mercati`, `sito`, `oggiRoma`, `eFuturo`, `eOggi`, `etichettaLunga`
- Produces: `<Intestazione locale>`, `<Apertura locale>`, `<CartaProssimo locale>`, `<Zampina className>`, `<Filo />`

- [ ] **Step 1: Prepare the hero photograph**

```bash
mkdir -p public/foto
sips -s format jpeg -Z 1400 -s formatOptions 72 \
  "docs/fonti-cliente/IMG_20240221_185700_427.webp" --out public/foto/gatti-calico.jpg
sips -s format jpeg -Z 1400 -s formatOptions 72 \
  "docs/fonti-cliente/IMG_20240221_185700_452.webp" --out public/foto/gatti-grigi.jpg
sips -s format jpeg -Z 1400 -s formatOptions 68 \
  "docs/fonti-cliente/IMG_20241023_165943.jpg" --out public/foto/servizio-gatti.jpg
ls -la public/foto
```

Images are pre-sized because `images.unoptimized: true` means Next will not resize them. Each should land under ~250 KB.

- [ ] **Step 2: Write the two marks**

`src/components/Zampina.tsx`:

```tsx
export function Zampina({ className = "" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
			<ellipse cx="12" cy="16.2" rx="5.4" ry="4.3" />
			<ellipse cx="5.4" cy="10.6" rx="2.5" ry="3.1" />
			<ellipse cx="10" cy="7.2" rx="2.4" ry="3.2" />
			<ellipse cx="15.5" cy="7.4" rx="2.4" ry="3.2" />
			<ellipse cx="19.6" cy="11.2" rx="2.4" ry="3" />
		</svg>
	);
}
```

`src/components/Filo.tsx`:

```tsx
export function Filo() {
	return (
		<svg
			viewBox="0 0 1120 14"
			preserveAspectRatio="none"
			className="h-3.5 w-full text-sp-glassa"
			aria-hidden="true"
		>
			<title>separatore</title>
			<path
				d="M3 8 C 120 3, 220 12, 340 7 S 560 2, 690 9 S 900 4, 1117 7"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.7"
				strokeLinecap="round"
			/>
		</svg>
	);
}
```

Both use `currentColor` so the colour comes from a Tailwind text utility rather than a hardcoded hex — this is how the "one hex per role" rule is enforced structurally.

- [ ] **Step 3: Write `src/components/Intestazione.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";

export function Intestazione({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-8 sm:px-10">
			<Image
				src="/logo.svg"
				alt={sito.nome}
				width={186}
				height={60}
				priority
				className="h-auto w-36 sm:w-44"
			/>
			<Link
				href={d.altraLinguaHref}
				className="font-display text-sm text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
			>
				{d.altraLingua}
			</Link>
		</header>
	);
}
```

- [ ] **Step 4: Write `src/components/CartaProssimo.tsx`**

This card renders **every** upcoming market, marked with `data-fine` and `data-inizio`. The freshness script in Task 9 reveals exactly one. Rendering them all keeps the HTML static and lets the client pick correctly at any future date.

```tsx
import { dizionari } from "@/content/dizionario";
import { mercati } from "@/content/mercati";
import type { Locale } from "@/lib/date";
import { etichettaLunga, ultimoGiorno } from "@/lib/date";
import { Zampina } from "./Zampina";

export function CartaProssimo({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<div
			data-carta-prossimo
			className="flex items-start gap-4 rounded border border-sp-bordo bg-sp-sabbia p-5"
		>
			<Zampina className="mt-1 w-5 shrink-0 text-sp-terracotta" />
			<div>
				{mercati.map((m) => (
					<div
						key={m.id}
						data-voce-prossimo
						data-inizio={m.inizio}
						data-fine={ultimoGiorno(m)}
						hidden
					>
						<p className="font-display text-[11px] uppercase tracking-[0.14em] text-sp-tenue">
							<span data-etichetta-prossimo>{d.prossimoMercatino}</span>
						</p>
						<p className="pt-1 font-display text-lg font-semibold text-sp-inchiostro">
							{etichettaLunga(m, locale)}
						</p>
						<p className="font-testo text-base text-sp-testo">
							{m.citta}, {m.luogo}
							{m.dettaglio ? ` (${m.dettaglio})` : ""}
						</p>
					</div>
				))}
				<p data-nessun-prossimo className="font-testo text-base text-sp-testo">
					{d.nessunaData}
				</p>
			</div>
		</div>
	);
}
```

Every entry starts `hidden`, and the fallback line is visible by default — so with JavaScript disabled the visitor sees the honest "write to me" message rather than a wrong date.

- [ ] **Step 5: Write `src/components/Apertura.tsx`**

```tsx
import Image from "next/image";
import { dizionari } from "@/content/dizionario";
import type { Locale } from "@/lib/date";
import { CartaProssimo } from "./CartaProssimo";

export function Apertura({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<section className="sp-entra mx-auto grid w-full max-w-5xl gap-10 px-6 pt-14 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-20">
			<div className="flex flex-col gap-6">
				<p className="font-display text-[11px] uppercase tracking-[0.16em] text-sp-tenue">
					{d.occhiello}
				</p>
				<h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-sp-inchiostro sm:text-5xl lg:text-6xl">
					{d.titolo}
				</h1>
				<p className="max-w-md font-testo text-lg leading-relaxed text-sp-testo sm:text-xl">
					{d.introduzione}
				</p>
				<CartaProssimo locale={locale} />
			</div>

			<div className="relative p-3.5">
				<div className="absolute inset-0 -rotate-1 rounded-sm border border-sp-bordo" />
				<Image
					src="/foto/gatti-calico.jpg"
					alt={
						locale === "it"
							? "Tre gattini in ceramica smaltata, bianchi con macchie nere e arancioni"
							: "Three glazed ceramic kittens, white with black and orange patches"
					}
					width={1400}
					height={1400}
					priority
					className="relative h-[320px] w-full rounded-sm object-cover sm:h-[420px] lg:h-[480px]"
				/>
			</div>
		</section>
	);
}
```

- [ ] **Step 6: Assemble `src/components/Pagina.tsx`**

```tsx
import type { Locale } from "@/lib/date";
import { Apertura } from "./Apertura";
import { Filo } from "./Filo";
import { Intestazione } from "./Intestazione";

export function Pagina({ locale }: { locale: Locale }) {
	return (
		<>
			<Intestazione locale={locale} />
			<main>
				<Apertura locale={locale} />
				<div className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
					<Filo />
				</div>
			</main>
		</>
	);
}
```

- [ ] **Step 7: Verify visually at both widths**

```bash
bunx next build && bun run lint && bunx tsc --noEmit
bun run dev
```

Open `http://localhost:3000` at 390px and at 1440px. Confirm: the logo and language switch sit on one row; the H1 breaks sensibly; the photo frame's rotated border is visible behind the image; the next-market card shows the "write to me" fallback (the reveal script does not exist yet); nothing overflows horizontally at 390px. Check `/en` renders English copy.

- [ ] **Step 8: Commit**

```bash
git add public/foto src/components
git commit -m "feat: add header, hero and next-market card"
```

---

### Task 9: The market calendar and the freshness script

**Files:**
- Create: `src/components/Mercatini.tsx`, `src/components/ScriptFreschezza.tsx`
- Modify: `src/components/Pagina.tsx`

**Interfaces:**
- Consumes: `mercati`, `ricorrenze`, `dizionari`, `raggruppaPerMese`, `giorniBrevi`, `ultimoGiorno`
- Produces: `<Mercatini locale>`, `<ScriptFreschezza />`

- [ ] **Step 1: Write `src/components/Mercatini.tsx`**

```tsx
import { dizionari } from "@/content/dizionario";
import { mercati } from "@/content/mercati";
import { ricorrenze } from "@/content/ricorrenze";
import type { Locale } from "@/lib/date";
import { giorniBrevi, raggruppaPerMese, ultimoGiorno } from "@/lib/date";
import { Zampina } from "./Zampina";

export function Mercatini({ locale }: { locale: Locale }) {
	const d = dizionari[locale];
	const gruppi = raggruppaPerMese(mercati, locale);

	return (
		<section className="mx-auto w-full max-w-5xl px-6 pt-14 sm:px-10">
			<h2 className="font-display text-3xl font-semibold text-sp-inchiostro sm:text-4xl">
				{d.doveMiTrovi}
			</h2>
			<p className="pt-2 font-testo text-lg text-sp-tenue">{d.doveSottotitolo}</p>

			<div className="mt-7 grid gap-9 rounded bg-sp-sabbia p-6 sm:p-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
				<div className="flex flex-col gap-4">
					<p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-sp-terracotta-scritta">
						{d.ogniMeseSempre}
					</p>
					<ul className="flex flex-col gap-4">
						{ricorrenze.map((r) => (
							<li key={r.luogo}>
								<p className="font-display text-sm font-semibold text-sp-inchiostro">
									{r.luogo}
								</p>
								<p className="font-testo text-[15px] leading-snug text-sp-testo">
									{locale === "it" ? r.regolaIt : r.regolaEn}
								</p>
							</li>
						))}
					</ul>
					<p className="pt-1 font-testo text-sm italic leading-relaxed text-sp-nota">
						{d.ogniMeseNota}
					</p>
				</div>

				<div className="flex flex-col gap-5 lg:border-l lg:border-sp-bordo lg:pl-14">
					<p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-sp-terracotta-scritta">
						{d.prossimeDate}
					</p>

					<div data-elenco-date className="grid gap-7 sm:grid-cols-2">
						{gruppi.map((g) => (
							<div
								key={g.chiave}
								data-gruppo-mese
								className="flex flex-col gap-3"
							>
								<p className="font-display text-base font-bold text-sp-inchiostro">
									{g.etichetta}
								</p>
								<ul className="flex flex-col gap-3">
									{g.voci.map((m) => (
										<li
											key={m.id}
											data-fine={ultimoGiorno(m)}
											className="flex items-baseline gap-2.5"
										>
											<Zampina className="mt-0.5 w-3.5 shrink-0 self-start text-sp-terracotta" />
											<span>
												<span className="font-display text-sm font-semibold text-sp-inchiostro">
													{giorniBrevi(m)}
												</span>{" "}
												<a
													href={m.mappa}
													target="_blank"
													rel="noreferrer"
													className="font-testo text-[15px] leading-snug text-sp-testo underline decoration-sp-rosa underline-offset-2 hover:decoration-sp-terracotta"
												>
													{m.citta}, {m.luogo}
													{m.dettaglio ? ` (${m.dettaglio})` : ""}
												</a>{" "}
												<a
													href={`/calendario/${m.id}.ics`}
													className="inline-block font-display text-xs text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-2 hover:decoration-sp-terracotta"
												>
													{d.aggiungiAlCalendario}
												</a>
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<p
						data-nessuna-data
						hidden
						className="font-testo text-lg text-sp-testo"
					>
						{d.nessunaData}
					</p>

					<a
						data-tutte-le-date
						href="/calendario/mercatini.ics"
						className="self-start font-display text-sm font-semibold text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
					>
						{d.tutteLeDate}
					</a>
				</div>
			</div>
		</section>
	);
}
```

- [ ] **Step 2: Write `src/components/ScriptFreschezza.tsx`**

```tsx
/**
 * Nasconde le date passate PRIMA del primo paint.
 *
 * Deliberatamente non è React: uno useEffect girerebbe dopo l'idratazione e
 * mostrerebbe per un attimo le date scadute, e un filtro in fase di render
 * romperebbe l'idratazione contro l'HTML pre-renderizzato. Questo script viene
 * eseguito dal parser, subito dopo il markup che tocca.
 *
 * Nessuna dipendenza dal bundle: funziona anche se il JS di Next non arriva.
 */
const SCRIPT = `(function(){
try{
var oggi=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Rome'});

// 1. Elenco date: via quelle finite.
var righe=document.querySelectorAll('[data-elenco-date] li[data-fine]');
for(var i=0;i<righe.length;i++){if(righe[i].dataset.fine<oggi){righe[i].hidden=true;}}

// 2. Mesi rimasti senza righe visibili.
var mesi=document.querySelectorAll('[data-gruppo-mese]');
var restano=0;
for(var j=0;j<mesi.length;j++){
  if(mesi[j].querySelector('li[data-fine]:not([hidden])')){restano++;}
  else{mesi[j].hidden=true;}
}

// 3. Calendario vuoto: mostra il messaggio, nascondi il download.
if(restano===0){
  var vuoto=document.querySelector('[data-nessuna-data]');
  if(vuoto){vuoto.hidden=false;}
  var tutte=document.querySelector('[data-tutte-le-date]');
  if(tutte){tutte.hidden=true;}
}

// 4. Carta in testa: scopri il primo mercato non finito.
var voci=document.querySelectorAll('[data-voce-prossimo]');
var scelta=null;
for(var k=0;k<voci.length;k++){if(voci[k].dataset.fine>=oggi){scelta=voci[k];break;}}
if(scelta){
  var vuotoP=document.querySelector('[data-nessun-prossimo]');
  if(vuotoP){vuotoP.hidden=true;}
  scelta.hidden=false;
  if(scelta.dataset.inizio<=oggi){
    var et=scelta.querySelector('[data-etichetta-prossimo]');
    if(et){et.textContent=et.dataset.oggi||et.textContent;}
  }
}
}catch(e){}
})();`;

export function ScriptFreschezza() {
	// biome-ignore lint/security/noDangerouslySetInnerHtml: deve girare durante il parsing
	return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
```

- [ ] **Step 3: Pass the "today" label into the DOM so the script can swap it**

Modify the label span in `src/components/CartaProssimo.tsx` so the script has the localised string without embedding copy in JavaScript:

```tsx
						<span data-etichetta-prossimo data-oggi={d.oggiSonoA}>
							{d.prossimoMercatino}
						</span>
```

- [ ] **Step 4: Mount both in `src/components/Pagina.tsx`**

```tsx
import type { Locale } from "@/lib/date";
import { Apertura } from "./Apertura";
import { Filo } from "./Filo";
import { Intestazione } from "./Intestazione";
import { Mercatini } from "./Mercatini";
import { ScriptFreschezza } from "./ScriptFreschezza";

export function Pagina({ locale }: { locale: Locale }) {
	return (
		<>
			<Intestazione locale={locale} />
			<main>
				<Apertura locale={locale} />
				<div className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
					<Filo />
				</div>
				<Mercatini locale={locale} />
				<ScriptFreschezza />
			</main>
		</>
	);
}
```

`ScriptFreschezza` must come **after** `Mercatini` and after `Apertura` in document order — it queries elements that must already be parsed.

- [ ] **Step 5: Verify the three date states by hand**

```bash
bun run build
bunx serve out -l 4321   # or: python3 -m http.server -d out 4321
```

Open `http://localhost:4321`. Then, in DevTools console, simulate other days by overriding the locale formatter before reload is impractical — instead verify by temporarily editing `out/index.html`'s inline script, replacing the `oggi` assignment with a literal:

1. `var oggi='2026-09-01';` → reload. Expect: all 25 dates visible, card shows "Prossimo mercatino · sabato 19 – domenica 20 settembre".
2. `var oggi='2026-09-20';` → reload. Expect: the 19–20 entry still visible (it ends today), card label reads "Oggi sono a".
3. `var oggi='2026-12-28';` → reload. Expect: every month group hidden, "Le date del prossimo anno arrivano presto…" visible in both the card and the calendar, and the "Scarica tutte le date" link hidden.

Restore `out/` by re-running `bun run build`.

- [ ] **Step 6: Verify there is no flash of stale content**

In DevTools → Network, set throttling to "Slow 4G", then reload with the cache disabled. Watch the calendar area: past dates must **never** appear, not even for one frame. If they flash, the script is being emitted after the closing `</body>` or has been moved into a client component — put it back inline.

- [ ] **Step 7: Verify it degrades honestly with JavaScript off**

Disable JavaScript in DevTools and reload. Expect: the calendar shows all dates including past ones (acceptable — they are labelled by month and year context), and the next-market card shows the "write to me" fallback rather than a possibly-wrong date.

- [ ] **Step 8: Commit**

```bash
git add src/components/Mercatini.tsx src/components/ScriptFreschezza.tsx src/components/CartaProssimo.tsx src/components/Pagina.tsx
git commit -m "feat: add the market calendar with parse-time past-date filtering"
```

---

### Task 10: Gallery, contact and footer

**Files:**
- Create: `src/components/Galleria.tsx`, `src/components/Contatti.tsx`, `src/components/PiePagina.tsx`
- Modify: `src/components/Pagina.tsx`

**Interfaces:**
- Consumes: `dizionari`, `sito`, `emailDaConfermare`
- Produces: `<Galleria locale>`, `<Contatti locale>`, `<PiePagina locale>`

- [ ] **Step 1: Write `src/components/Galleria.tsx`**

```tsx
import Image from "next/image";
import { dizionari } from "@/content/dizionario";
import type { Locale } from "@/lib/date";

const FOTO = [
	{
		file: "/foto/gatti-grigi.jpg",
		it: "Due tazze-gatto smaltate, grigie e bianche, impilate",
		en: "Two stacked grey and white glazed cat cups",
	},
	{
		file: "/foto/servizio-gatti.jpg",
		it: "Servizio da caffè con gatti e zampine dipinti a mano",
		en: "Coffee set with hand-painted cats and paw prints",
	},
] as const;

export function Galleria({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<section className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
			<h2 className="font-display text-3xl font-semibold text-sp-inchiostro sm:text-4xl">
				{d.qualchePezzo}
			</h2>
			<p className="pt-2 font-testo text-lg text-sp-tenue">{d.qualcheSottotitolo}</p>

			<div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
				{FOTO.map((f) => (
					<Image
						key={f.file}
						src={f.file}
						alt={locale === "it" ? f.it : f.en}
						width={1400}
						height={1400}
						className="h-44 w-full rounded-sm object-cover sm:h-64 lg:h-72"
					/>
				))}
				{/* Segnaposto visibile: servono ancora 8-10 foto dalla cliente. */}
				<div className="col-span-2 flex h-44 items-center justify-center rounded-sm border border-dashed border-sp-bordo p-5 sm:h-64 lg:col-span-1 lg:h-72">
					<p className="text-center font-display text-xs leading-relaxed text-sp-nota">
						[SERVONO 8–10 FOTO]
					</p>
				</div>
			</div>
		</section>
	);
}
```

- [ ] **Step 2: Write `src/components/Contatti.tsx`**

```tsx
import { dizionari } from "@/content/dizionario";
import { emailDaConfermare, sito } from "@/content/sito";
import type { Locale } from "@/lib/date";
import { Filo } from "./Filo";

export function Contatti({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<section className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
			<Filo />
			<div className="grid gap-8 pt-10 lg:grid-cols-2 lg:items-end">
				<div className="flex flex-col gap-4">
					<h2 className="font-display text-3xl font-semibold text-sp-inchiostro sm:text-4xl">
						{d.scrivimi}
					</h2>
					<p className="max-w-md font-testo text-lg leading-relaxed text-sp-testo">
						{d.scrivimiTesto}
					</p>
					{emailDaConfermare ? (
						<p className="font-display text-xl font-semibold text-sp-nota">{sito.email}</p>
					) : (
						<a
							href={`mailto:${sito.email}`}
							className="self-start font-display text-xl font-semibold text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
						>
							{sito.email}
						</a>
					)}
				</div>

				<ul className="flex flex-col gap-3 font-display text-base lg:flex-row lg:gap-7 lg:pb-1">
					<li>
						<a
							href={sito.instagram}
							target="_blank"
							rel="me noreferrer"
							className="inline-flex min-h-11 items-center text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
						>
							Instagram — @sandu_pottery
						</a>
					</li>
					<li>
						<a
							href={sito.facebook}
							target="_blank"
							rel="me noreferrer"
							className="inline-flex min-h-11 items-center text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
						>
							Facebook
						</a>
					</li>
				</ul>
			</div>
		</section>
	);
}
```

`min-h-11` is 44px — the mobile hit-target floor from the spec.

- [ ] **Step 3: Write `src/components/PiePagina.tsx`**

```tsx
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";

export function PiePagina({ locale }: { locale: Locale }) {
	const riga =
		locale === "it"
			? `${sito.nome} — ceramiche fatte a mano, ${sito.citta}`
			: `${sito.nome} — handmade ceramics, ${sito.citta}, Italy`;

	return (
		<footer className="mx-auto w-full max-w-5xl px-6 pb-14 pt-20 sm:px-10">
			<div className="flex flex-col gap-2 border-t border-sp-bordo pt-5 font-display text-xs text-sp-nota sm:flex-row sm:justify-between">
				<span>{riga}</span>
				<span>
					{sito.ragioneSociale} · {sito.partitaIva}
				</span>
			</div>
		</footer>
	);
}
```

- [ ] **Step 4: Complete `src/components/Pagina.tsx`**

```tsx
import { mercati } from "@/content/mercati";
import type { Locale } from "@/lib/date";
import { graficoJsonLd } from "@/lib/jsonld";
import { Apertura } from "./Apertura";
import { Contatti } from "./Contatti";
import { Filo } from "./Filo";
import { Galleria } from "./Galleria";
import { Intestazione } from "./Intestazione";
import { Mercatini } from "./Mercatini";
import { PiePagina } from "./PiePagina";
import { ScriptFreschezza } from "./ScriptFreschezza";

export function Pagina({ locale }: { locale: Locale }) {
	return (
		<>
			<Intestazione locale={locale} />
			<main>
				<Apertura locale={locale} />
				<div className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
					<Filo />
				</div>
				<Mercatini locale={locale} />
				<Galleria locale={locale} />
				<Contatti locale={locale} />
				<ScriptFreschezza />
			</main>
			<PiePagina locale={locale} />
			{/* biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD serializzato e con < neutralizzati */}
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: graficoJsonLd(mercati, locale) }}
			/>
		</>
	);
}
```

Add `src/components/Pagina.tsx` to the `noDangerouslySetInnerHtml` override list in `biome.json`:

```json
			"includes": ["src/components/ScriptFreschezza.tsx", "src/components/Pagina.tsx"],
```

- [ ] **Step 5: Verify and commit**

```bash
bun run build && bun run lint && bunx tsc --noEmit && bun test
bun run dev
```

At 390px and 1440px confirm: the gallery placeholder is clearly marked; the email renders as plain grey text (not a link) because it is still a placeholder; social links are at least 44px tall on mobile; the footer shows both bracketed placeholders. Paste the page source's JSON-LD into `https://validator.schema.org/` and confirm 1 `LocalBusiness` and 25 `Event` items with no errors.

```bash
git add src/components biome.json
git commit -m "feat: add gallery, contact and footer with json-ld"
```

---

### Task 11: SEO plumbing and icons

**Files:**
- Create: `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/manifest.ts`, `src/app/icon.png`, `src/app/apple-icon.png`, `public/foto/og.jpg`
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/en/page.tsx`

**Interfaces:**
- Consumes: `sito`, `dizionari`
- Produces: `out/robots.txt`, `out/sitemap.xml`, `out/manifest.webmanifest`, favicons, Open Graph tags

- [ ] **Step 1: Generate the icons and the OG image from the recovered logo**

```bash
mkdir -p src/app
# Icona quadrata su fondo porcellana, dal logo recuperato.
qlmanage -t -s 512 -o /tmp public/logo.svg
# -z forza le dimensioni ignorando le proporzioni, e il logo è 691x221:
# prima si ridimensiona conservando l'aspetto, poi si riempie il quadrato.
sips -Z 480 /tmp/logo.svg.png --out /tmp/logo-480.png
sips -s format png -p 512 512 --padColor FAF7F3 /tmp/logo-480.png --out src/app/icon.png
cp src/app/icon.png src/app/apple-icon.png
# Immagine social 1200x630 dalla foto d'apertura.
sips -s format jpeg -c 630 1200 -s formatOptions 78 \
  public/foto/gatti-calico.jpg --out public/foto/og.jpg
ls -la src/app/icon.png src/app/apple-icon.png public/foto/og.jpg
```

- [ ] **Step 2: Write `src/app/robots.ts`, `src/app/sitemap.ts` and `src/app/manifest.ts`**

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: `${sito.url}/sitemap.xml`,
	};
}
```

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: sito.url,
			changeFrequency: "monthly",
			priority: 1,
			alternates: { languages: { it: sito.url, en: `${sito.url}/en` } },
		},
		{
			url: `${sito.url}/en`,
			changeFrequency: "monthly",
			priority: 0.8,
			alternates: { languages: { it: sito.url, en: `${sito.url}/en` } },
		},
	];
}
```

`src/app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: sito.nome,
		short_name: sito.nome,
		description: dizionari.it.descrizioneMeta,
		start_url: "/",
		display: "browser",
		background_color: "#faf7f3",
		theme_color: "#faf7f3",
		lang: "it",
		icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
	};
}
```

- [ ] **Step 3: Add `metadataBase` and shared metadata to `layout.tsx`**

```tsx
import type { Metadata, Viewport } from "next";
import { sito } from "@/content/sito";
import { newsreader, quicksand } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: new URL(sito.url),
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: "#faf7f3",
	colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" className={`${quicksand.variable} ${newsreader.variable} antialiased`}>
			<body className="font-testo">{children}</body>
		</html>
	);
}
```

- [ ] **Step 4: Add Open Graph and Twitter cards to both routes**

In `src/app/page.tsx`, extend the existing `metadata`:

```tsx
export const metadata: Metadata = {
	title: sito.nome,
	description: dizionari.it.descrizioneMeta,
	alternates: {
		canonical: sito.url,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
	openGraph: {
		type: "website",
		siteName: sito.nome,
		title: sito.nome,
		description: dizionari.it.descrizioneMeta,
		url: sito.url,
		locale: "it_IT",
		alternateLocale: ["en_GB"],
		images: [{ url: "/foto/og.jpg", width: 1200, height: 630, alt: sito.nome }],
	},
	twitter: {
		card: "summary_large_image",
		title: sito.nome,
		description: dizionari.it.descrizioneMeta,
		images: ["/foto/og.jpg"],
	},
};
```

Apply the same block to `src/app/en/page.tsx`, replacing `dizionari.it` with `dizionari.en`, `url` with `${sito.url}/en`, `locale` with `"en_GB"`, and `alternateLocale` with `["it_IT"]`.

- [ ] **Step 5: Verify the generated files**

```bash
bun run build
cat out/robots.txt
cat out/sitemap.xml
cat out/manifest.webmanifest
grep -o 'property="og:[a-z:]*"' out/index.html | sort -u
grep -c 'hreflang' out/index.html
```

Expected: `robots.txt` points at the sitemap; `sitemap.xml` lists both URLs with `xhtml:link` alternates; the manifest parses; `og:title`, `og:description`, `og:image`, `og:url`, `og:locale` all present.

- [ ] **Step 6: Commit**

```bash
git add src/app public/foto/og.jpg
git commit -m "feat: add robots, sitemap, manifest, icons and open graph metadata"
```

---

### Task 12: Documentation and agent conventions

**Files:**
- Create: `AGENTS.md`, `CLAUDE.md`, `README.md`, `CONTRIBUTING.md`, `LICENSE`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `docs/architecture/README.md`, `docs/architecture/ADR-001-sito-statico-temporaneo.md`, `docs/brand.md`, `docs/content-editing.md`, `docs/dns-cloudflare.md`

**Interfaces:**
- Consumes: everything built so far
- Produces: a repo a fresh agent can pick up without reading the source

- [ ] **Step 1: Write `AGENTS.md`**

````markdown
<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
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

- **Never use `terracotta` (`#C2603A`), `rosa` or `glassa` for text.** They fail WCAG AA. Links use `terracotta-scritta` (`#9A4526`). See `docs/brand.md`.
- **Never compute "today" with `toISOString()`.** Use `oggiRoma()`. UTC is a day behind Rome after midnight.
- **`.ics` `DTEND` is exclusive; schema.org `endDate` is inclusive.** They differ by one day on purpose. `tests/ics.test.ts` and `tests/jsonld.test.ts` both pin this.
- **Bracketed placeholders (`[EMAIL DA CONFERMARE]`) are load-bearing.** They mark facts the client has not supplied. Never invent a value to remove one.
- **The freshness script must stay inline and must stay after the markup it queries.** Moving it into a client component reintroduces a flash of stale dates.

## Adding a market date

See `docs/content-editing.md`. It is one edit to `src/content/mercati.ts` plus a push.

## Learned Patterns

| Pattern | Reference | Date |
| ------- | --------- | ---- |
````

- [ ] **Step 2: Write `CLAUDE.md`**

```markdown
@AGENTS.md
```

- [ ] **Step 3: Write `docs/content-editing.md`**

````markdown
# Aggiungere o modificare una data

Tutto il calendario vive in un solo file: `src/content/mercati.ts`.

## Aggiungere un mercato

Inserisci un oggetto **in ordine cronologico** nell'array `mercati`:

```ts
	{
		id: "2027-03-14-bergamo-cavour",
		inizio: "2027-03-14",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
```

Per un mercato di più giorni aggiungi `fine` con l'ultimo giorno:

```ts
		inizio: "2027-03-14",
		fine: "2027-03-15",
```

Regole:

- `id` deve essere unico e contenere solo minuscole, cifre e trattini — diventa il nome del file `.ics`.
- `inizio` e `fine` sono ISO `YYYY-MM-DD`.
- `mappa` usa sempre l'helper `mappa(...)`.
- L'array deve restare ordinato per `inizio`.

## Verificare

```bash
bun test
```

`tests/mercati.test.ts` controlla l'ordine, l'unicità degli id, la validità delle date e il giorno della settimana dei mercati ricorrenti. Se passa, il calendario è coerente.

Poi:

```bash
bun run build
```

Le date passate spariscono da sole nel browser: non serve ricostruire il sito quando una data scade.

## Aggiornare le ricorrenze

`src/content/ricorrenze.ts`. Ricorda di aggiornare **entrambe** le lingue (`regolaIt` e `regolaEn`).
````

- [ ] **Step 4: Write `docs/brand.md`**

````markdown
# Sistema visivo

Direzione: **Porcellana + tocco Quaderno**. Fondo porcellana, molta aria, testo a inchiostro, un solo accento terracotta. Il segno disegnato a mano compare solo due volte: il filo fra le sezioni e la zampina nell'elenco delle date.

## Colori

I valori sono campionati dalle fotografie della cliente e corretti sul bilanciamento del bianco. Il contrasto è misurato, non stimato.

| Token | Hex | su porcellana | su sabbia | Uso |
| --- | --- | --- | --- | --- |
| `sp-porcellana` | `#FAF7F3` | — | — | fondo pagina |
| `sp-sabbia` | `#EDE3D6` | — | — | scheda mercatini |
| `sp-inchiostro` | `#241F1C` | 15.27 | 12.86 | titoli, testo forte |
| `sp-testo` | `#4A423D` | 9.20 | 7.75 | paragrafi |
| `sp-tenue` | `#5B534E` | 7.04 | 5.93 | testo secondario |
| `sp-nota` | `#6E645B` | 5.41 | 4.55 | corsivi, minori |
| `sp-terracotta` | `#C2603A` | 3.91 | 3.29 | **solo segni** — zampine, filo |
| `sp-terracotta-scritta` | `#9A4526` | 6.04 | 5.09 | link e testo d'accento |
| `sp-rosa` | `#E4A896` | 1.90 | 1.60 | **mai testo** — sottolineature |
| `sp-glassa` | `#9FAEBD` | 2.12 | 1.79 | **mai testo** — filo disegnato |
| `sp-verderame` | `#4A6654` | 5.92 | 4.99 | in riserva, sito definitivo |
| `sp-bordo` | `#DFD1BF` | — | — | l'unico filetto della scheda |

Terracotta è volutamente **due** token: quello bello non passa AA per il testo corrente.

## Caratteri

| Ruolo | Famiglia | Perché |
| --- | --- | --- |
| Display | Quicksand 400–700 | Quasi identico al lettering del logo: pagina e marchio diventano una cosa sola |
| Testo | Newsreader 300–500 + corsivo | Serif caldo a basso contrasto; regge le righe fitte del calendario |

Entrambi self-hosted in `src/fonts/` come `woff2` variabili, sottoinsieme `latin`. La build non deve mai dipendere dalla rete.

## Voce

Prima persona singolare, calda, semplice. È una donna con un tornio, non un brand.

- Sì: «Sto rifacendo il sito.» «Nel frattempo ci vediamo ai mercatini.»
- No: «Coming soon», «Sito in costruzione», «Stay tuned».

La pagina è una vetrina con un biglietto scritto a mano dentro, non un cantiere.
````

- [ ] **Step 5: Write the ADR and its index**

`docs/architecture/README.md`:

```markdown
# Architecture Decision Records

| ADR | Decision | Date | Source |
| --- | --- | --- | --- |
| [ADR-001](ADR-001-sito-statico-temporaneo.md) | Static bilingual one-page site with parse-time date filtering | August 2026 | Task 001 |
```

`docs/architecture/ADR-001-sito-statico-temporaneo.md` must record, at minimum: the static-export decision and why; the `/` + `/en` routing choice over a `[locale]` segment; the parse-time inline script over React filtering, with the hydration-mismatch and flash-of-stale-content reasoning; the single content model feeding page, JSON-LD and `.ics`; the two-token terracotta; and the deliberate deviations from the STST template (no Framer Motion, no cron rebuild). Copy the reasoning verbatim from the spec sections §7, §10 and §5 rather than paraphrasing.

- [ ] **Step 6: Write `docs/dns-cloudflare.md`**

Copy spec §11 in full — the Aruba zone records, the cutover order, and the warning that the client's email lives in the zone being moved. This is the document someone will read at 11pm under pressure; it must be complete on its own.

- [ ] **Step 7: Write `README.md`, `CONTRIBUTING.md`, `LICENSE`, `CODE_OF_CONDUCT.md`, `SECURITY.md`**

`README.md` covers: what the site is, the live URL, the stack, the four commands, where the calendar lives, and a prominent link to `docs/content-editing.md`. `LICENSE` is MIT with the client named as copyright holder. `CONTRIBUTING.md` states conventional commits and the four gates. `CODE_OF_CONDUCT.md` is Contributor Covenant 2.1. `SECURITY.md` gives a reporting address — use `[EMAIL DA CONFERMARE]` until the client supplies one.

- [ ] **Step 8: Final verification of every gate**

```bash
bun install --frozen-lockfile
bun run lint
bunx tsc --noEmit
bun test
bun run build
ls out/index.html out/en.html out/robots.txt out/sitemap.xml out/manifest.webmanifest
ls out/calendario | wc -l
```

Expected: all green; 26 `.ics` files.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "docs: add agent conventions, adr, brand system and runbooks"
```

---

## Blocked on the client — do not invent these

These are **not** implementation tasks. They are handoffs, tracked here so nothing is silently forgotten:

1. **Aruba credentials** → create the Cloudflare zone, replicate the mail records from `docs/dns-cloudflare.md`, verify, then switch nameservers.
2. **Cloudflare account** → set repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, create the Pages project `sandupottery-lavori-in-corso`.
3. **Public email** → replace `sito.email`; `emailDaConfermare` flips to `false` and the address becomes a `mailto:` link automatically.
4. **Business name and P.IVA** → replace `sito.ragioneSociale` and `sito.partitaIva`.
5. **8–10 photographs** (or her Shopify login, from which they can be exported) → extend the `FOTO` array in `Galleria.tsx` and delete the placeholder tile.
6. **GitHub org** → create it, push, and confirm the repo is public.

---

## Self-Review

**Spec coverage.** §2 goals → Tasks 8–10. §5 palette → Task 2 + `docs/brand.md`. §5 typography → Task 2. §5 copy voice → Task 7 dictionary. §6 IA and hero → Tasks 8–10. §6 language routing → Task 7. §7 freshness, "oggi sono qui", empty state → Task 9. §8 content model → Task 3. §9 JSON-LD, map links, `.ics` → Tasks 5, 6, 9. §10 stack and deviations → Task 1. §11 DNS → `docs/dns-cloudflare.md` (Task 12) and the blocked list. §12 accessibility → contrast tokens (Task 2), `min-h-11` (Task 10), `prefers-reduced-motion` (Task 2), `color-scheme` (Task 11), `lang` (Task 7). §13 repo conventions → Tasks 1 and 12. No gaps.

**Placeholder scan.** The only bracketed strings are the deliberate client-facing placeholders defined in Global Constraints; every code step carries real code. Task 12 steps 5–7 describe document contents rather than transcribing them in full, which is acceptable for prose documents whose source material is the already-written spec — each names its source section explicitly.

**Type consistency.** `Locale` is defined once in `src/lib/date.ts` and imported everywhere. `Mercato` is defined once in `src/content/mercati.ts`. `ultimoGiorno` is used by `CartaProssimo`, `Mercatini`, `jsonld.ts` with one signature. `Intervallo` in `date.ts` is structurally satisfied by `Mercato`. `creaICS(eventi, nomeCalendario, dtstamp)` is called with three arguments in both `genera-ics.ts` and the tests. `graficoJsonLd(mercati, locale)` matches its use in `Pagina.tsx`. `Zampina` takes `className` in all five call sites.

One correction folded in during writing: Task 3's weekday test initially asserted Sunday for every Bergamo Alta entry and Thursday for every piazza Diaz entry. Checking all 31 days against the client's PDF showed two legitimate exceptions — 8 December (Immacolata) and 22 December (pre-Christmas), both Tuesdays. The test now carries an explicit `ECCEZIONI` set plus a second test asserting those exceptions still exist, so the exclusion cannot silently mask a future transcription error.
