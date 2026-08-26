# Contributing

This is a small, temporary site with a light process — but the process that
exists is enforced, not optional.

## Commits

Commits follow [Conventional Commits](https://www.conventionalcommits.org/),
enforced by commitlint via a Lefthook `commit-msg` hook. The allowed types are
pinned in `commitlint.config.mjs`:

```
feat  fix  chore  ci  docs  style  refactor  perf
```

A commit message with any other type (`test:`, `build:`, ...) is rejected
before it's created. This also drives `release-please`'s changelog and
versioning, so an inaccurate type produces an inaccurate release note — pick
the type that describes the change, not the one that's most convenient.

## The four gates

Every push and pull request runs the same four checks in CI
(`.github/workflows/ci.yml`), in this order:

```bash
bun run lint          # Biome check
bunx tsc --noEmit     # Type check
bun run test          # Unit tests
bun run build         # Static export + .ics generation
```

Lefthook's `pre-push` hook (`lefthook.yml`) runs all four automatically before
`git push` is allowed to complete, and `pre-commit` already runs Biome and the
type check on staged files. Don't rely on the hooks alone, though — run the
full sequence yourself after touching `src/content/mercati.ts` or anything in
`src/lib/`, since those are the highest-consequence files in the repo and the
hooks only catch what the assertions already check for.

## Before you touch the calendar or the freshness script

- Adding or editing a market date: see `docs/content-editing.md` first.
- Anything involving `src/components/ScriptFreschezza.tsx`,
  `src/components/Pagina.tsx`, `.ics` generation, or the `Event` JSON-LD: read
  `AGENTS.md` › "Rules that will bite you" first. Several of these have failure
  modes that no automated check currently catches.

## Pull requests

Target `dev`. `main` is release-only — `release-please` opens release PRs
against it and the deploy workflow runs from there.
