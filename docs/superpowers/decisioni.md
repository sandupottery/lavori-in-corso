# Decisioni prese durante la costruzione

Ogni voce è una decisione presa in autonomia mentre il sito veniva costruito,
con il motivo e il costo se fosse sbagliata. Sono qui perché il registro di
lavorazione non entra nel repository, e queste sono l'unica traccia del perché
il codice è come è.

Totale: 27 decisioni. Data: 26 agosto 2026.

1. Repo initialised during setup on branch `dev` off `main`, not by Task 1 — a worktree is meaningless with no prior history, and the plan's own CI runs on `dev`. Task 1 skips `git init` and the identity config, keeps the file moves. Cost if wrong: none; branch is renameable.

2. Drop `"types": ["bun-types"]` from `tsconfig.json`. The plan installs `@types/bun`, which is auto-included; an explicit `types` array disables that auto-inclusion and would break `import ... from "bun:test"` resolution. Cost if wrong: typecheck fails loudly on the first test file — caught in Task 3, not shipped.

3. Task 5's `piega()` has an operator-precedence bug — `(byte[fine] as number & 0xc0)` parses as a type intersection `number & 192`, so the byte is never masked and the continuation-boundary check silently never fires. Correct form is `((byte[fine] as number) & 0xc0) === 0x80`. Cost if wrong: multi-byte characters split mid-sequence in long `.ics` lines, producing mojibake in calendar apps. Our data has no line over 75 bytes with accents near the boundary, so it would likely never surface — which is exactly why it must be fixed now.

4. Task 11's `sips -s format png -z 512 512` distorts the logo — `-z` resamples to exact dimensions ignoring aspect ratio, and the logo is 691x221. Use `sips -Z 480` then `sips -p 512 512 --padColor FAF7F3`. Cost if wrong: a visibly squashed favicon.

5. Task 1's `.gitignore` must retain the `.superpowers/` line written during setup, or the SDD workspace becomes tracked. Cost if wrong: ledger and briefs get committed — noisy but harmless, and revertible.

6. Task 8 prepares all three photographs though it renders only one; Tasks 10 and 11 consume the other two. This is deliberate batching of one `sips` step, not dead weight. Cost if wrong: none.

7. public email is `info@sandupottery.com`. It is the address on her Shopify account and an `info@` role address on her own domain, so it is the contact address by construction. Cost if wrong: one string in `src/content/sito.ts`.

8. no P.IVA and no company name in the footer, per the client. The `emailDaConfermare` mechanism and both placeholder fields are removed outright rather than left as dead code — the email is now known, so the branch would be permanently false. Cost if wrong: if she later needs the P.IVA published for legal reasons, it is a two-line footer change.

9. two Instagram profiles (`@sandu_pottery`, `@letettazze`), no Facebook. `sito.profili` becomes a `readonly Profilo[]` rather than two named fields, so `Contatti` and the JSON-LD `sameAs` both iterate. Cost if wrong: trivial.

10. the Important finding ("bare `bun test` does not succeed, only `bun run test`") is a defect in my plan text, not in the implementation. Bun exits 1 on zero matching test files by design and offers no config override — only the `--pass-with-no-tests` flag. The implementer's fix (flag in the script, CI and lefthook routed through `bun run test`) is the correct resolution and was applied consistently across all three call sites. I amended Task 1's "Produces" contract to name `bun run test`, and added a step to Task 3 that REMOVES the flag once real tests exist — otherwise a broken glob or an emptied `tests/` directory would pass CI green with zero tests run. No fix round dispatched. Cost if wrong: none; the flag is inert from Task 3 onward.

11. the `.design` exclusion the implementer added to `biome.json` stands. The reviewer independently confirmed `.design/` predates this task (design-canvas mockups from the initial commit) and that `.dockerignore` already treats it the same way. Cost if wrong: none — those files are provenance, never shipped code.

12. I could not run the promised browser visual check — the Chrome extension timed out twice on `tabs_context_mcp`. Deferred rather than retried: Task 2's page is a throwaway specimen fully replaced in Task 7, and the reviewer independently confirmed the fonts reach `out/_next/static/media/`, the italic face is declared, and all tokens compile. The visual pass moves to Task 8, where there is a real page to look at. Cost if wrong: a font or token renders wrong and is caught two tasks later instead of now.

13. Next 16 generates and re-adds `AGENTS.md`'s `nextjs-agent-rules` block on every `next dev`, and generated a `CLAUDE.md` containing `@AGENTS.md`. Task 12 must not hand-author either — it appends its own sections below the END marker and commits both. Patched into the plan. This also explains why the STST template carried those markers: they were generated, not written. Cost if wrong: a churning uncommitted diff on every dev run.

14. repo is `sandupottery/lavori-in-corso`. The org carries the brand, so repeating it in the repo name buys nothing; `lavori-in-corso` says what the thing is, and archives legibly once the permanent site lands. Cloudflare Pages project stays `sandupottery-lavori-in-corso` — Pages projects are account-scoped and this is a personal account, so the prefix keeps it identifiable, and it leaves the bare `sandupottery` project name free for the permanent site. Cost if wrong: a rename, cheap before the first push.

15. `docs/fonti-cliente/IMG_20241023_165943.jpg` carried GPS EXIF (45.4769N, 9.1844E — central Milan, so a market pitch rather than her home, but precise coordinates attached to a dated photograph). Stripped in place by the controller rather than dispatched: it is pre-existing client material from the initial commit, not any task's code, and it blocks making the repo public. Also replaced `sips` with Pillow in Tasks 8 and 11 — `sips` preserves EXIF, so the image pipeline itself could have reintroduced location data into a served image — and added a verification step that fails if any generated photo carries EXIF. Cost if wrong: none; the photographs are unchanged visually.

16. minor 1 — `en-GB` weekday formatting is ICU-version dependent. The reviewer verified directly that Bun yields "Thursday 24 September" while Node yields "Thursday, 24 September" with a comma, so the English test passes only because the runtime is pinned to Bun. Parked rather than fixed: if a Bun upgrade changes the CLDR data the test FAILS, which is the alarm working correctly, and composing the label from formatToParts adds real complexity to defend against a cosmetic risk. Documented in AGENTS.md instead, with an explicit instruction never to "fix" it by loosening the assertion. Cost if wrong: a confusing red CI run after a Bun bump.

17. the CDN route is exhausted — no directory listing, UUID filenames, and Wayback holds three URLs with no product pages. Documented Instagram's data export as the complete free path for the permanent site. Cost if wrong: none.

18. this enters the fix loop rather than being parked. A test that passes on broken code is worse than no test: it advertises protection that does not exist. Fix round 1 dispatched to the original implementer — hostile fixture carrying a real `</script><script>`, assertions on both the absent raw `<` and the present escaped form, plus a round-trip parse proving the escape is reversible rather than lossy (a "fix" that stripped `<` would pass the first two checks and silently corrupt her data). Required to break the escaping, watch the test fail, restore. Plan patched so the defect does not survive in the record.

19. controller commits from here on use explicit paths — `git add docs/`, `git add .superpowers/` — never `-A`, and never while an implementer is live in the tree. The skill already forbids the controller fixing task code; this is the same hazard arriving through the staging area rather than the editor. Cost of the rule: nothing. Cost of not having it: a `docs:` commit that disables an XSS guard.

20. the Important — my "no leftover Italian" sentinel checks 2 of 20 keys — goes to the fix loop, not the parking lot. It is the identical failure mode to the

21. also correcting one English string. The reviewer flagged that `doveSottotitolo` renders "Se passi, ti riconosco" as "Say hello if you're passing" — a stock phrase any business could print, where the Italian says *I'll recognise you*, i.e. she remembers the people who stop. Changed to "Come by — I'll know you." My wording, my fix. The other flagged liberty ("Bergamo, Italy" for an English audience) is correct localisation and stays. Cost if wrong: one string.

22. the rule is not "do not set `hidden`". It is that the script may only ever touch `element.style` — never an attribute, never text content, never a class. Everything else belongs to React. CSS carries the default state; inline style carries the change; both labels are rendered and toggled by visibility. Recorded for AGENTS.md.

23. the blanket 44px tap-target rule was wrong for dense inline links

24. split the rule. - STANDALONE controls keep 44px: language switch, email, Instagram links, the "scarica tutte le date" download. - INLINE links inside calendar rows target 24px minimum via vertical padding, and rely on generous row spacing so a mis-tap is unlikely. Cost if wrong: a fiddly tap on a phone for the secondary actions, against a calendar that stays scannable. Documented in the spec so it reads as a decision, not an oversight.

25. REJECTED one finding. The reviewer flagged `public/foto/gatti-calico.jpg` as an unused asset. It is not — it is the hero photograph, used in `src/components/Apertura.tsx`. The reviewer's scope was the Task 10 diff, which does not include `Apertura`, so it could not see the reference. Correct process, wrong conclusion; no action. Worth recording because a later cleanup pass acting on that finding would delete the hero image.

26. acting on the OG-image minor. Rendered both candidates at real link-preview size and compared. `gatti-calico` is a portrait composition forced into 1200x630 and loses the cats' ears to the crop — careless-looking in a shared link. `mani-al-tornio` crops naturally and communicates "wheel-thrown by hand" to a stranger arriving from a market search, which is precisely that image's audience. Switching. Folded into Task 12 as item 12 with the regeneration command and an alt-text update. Cost if wrong: one image, trivially reverted.

27. parked the other two minors. The OG/Twitter duplication across two route files mirrors the existing `title`/`description`/`alternates` pattern and is only a drift risk if a third locale appears. `changeFrequency: "monthly"` is advisory and widely ignored by crawlers.

