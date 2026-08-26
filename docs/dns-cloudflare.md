# DNS cutover: Aruba → Cloudflare

Read this whole document before touching anything. It is written to be complete
on its own — if you are reading this at 11pm under pressure because something
about `sandupottery.com` or `info@sandupottery.com` is broken, you should not
need any other tab open except the Cloudflare dashboard and the Aruba panel.

## The one fact that matters most

**`info@sandupottery.com` is a live mailbox, hosted at Aruba, in the exact same
DNS zone that is being moved to Cloudflare.** It is the client's confirmed,
actively-used email address — also her Shopify account address. Every mail
record below must exist and resolve correctly at Cloudflare, and must be
**DNS-only (grey cloud), never proxied (orange cloud)**, before the nameservers
at Aruba are switched. Proxying a mail record does not error loudly — it just
routes mail traffic through Cloudflare's HTTP(S) proxy, which does not speak
SMTP/IMAP, and delivery fails silently. Nobody notices until someone complains
that their email bounced or never arrived, which could be hours or days later.

## Current status (as of Task 12, 2026-08-26)

Do not redo this work — it is already done. What remains is nameserver-level.

- [x] Cloudflare zone for `sandupottery.com` created, in the Cloudflare
  account that will also host the Pages project. Status: `pending` (this is
  normal and expected until nameservers are switched — it does not mean
  something is wrong).
- [x] All records from the Aruba zone (40 total) replicated into the
  Cloudflare zone, including every mail record below.
- [x] **31 mail records set to DNS-only (of 40 total in the zone), TTL 300**
  (short TTL is deliberate — it keeps rollback fast if something needs
  correcting right after cutover; raise it back to a normal TTL, e.g. 3600+,
  once the cutover has been stable for a few days). This is the canonical
  count for this document — later mentions of "the mail records" refer back
  to this line rather than restating a number.
- [ ] **Not yet done: nameservers at Aruba still point to the original Aruba
  nameservers.** Cloudflare's nameservers have not been activated. The domain
  is, right now, still fully served by Aruba — Cloudflare's copy of the zone
  is inert until the nameserver switch happens. This is deliberately not yet
  done — see the cutover order below.
- [ ] **Not yet done: Cloudflare Pages project `sandupottery-lavori-in-corso`
  not yet created**, and repo secrets `CLOUDFLARE_API_TOKEN` /
  `CLOUDFLARE_ACCOUNT_ID` not yet set on `sandupottery/lavori-in-corso`. The
  zone already exists in an account — the Pages project just needs creating
  in that same account, and the two secrets need setting. Neither is blocked
  on the client; both are outstanding work items, tracked in the "Blocked on
  the client" list in
  [`docs/superpowers/plans/2026-08-26-sandu-pottery-lavori-in-corso.md`](superpowers/plans/2026-08-26-sandu-pottery-lavori-in-corso.md)
  alongside the one item that genuinely is blocked (the nameserver switch,
  which needs the Aruba panel credentials below).

So: the destination zone is built and verified-replicable, but the switch has
not been thrown. This is the safe, correct state to be in before a deliberate,
verified cutover — do not rush the last step because the rest is done.

## Registrar and nameserver facts

| Fact | Value |
| --- | --- |
| Registrar | Tucows, **reseller Aruba S.p.A.** — the Aruba account controls it |
| Current nameservers | `dns.technorail.com`, `dns2.technorail.com`, `dns3.arubadns.net`, `dns4.arubadns.cz` |
| Domain locks | `clientTransferProhibited`, `clientUpdateProhibited` |
| Expiry | 2027-05-01 |

**A registrar transfer is not required.** Moving DNS to Cloudflare only needs a
nameserver change, made from inside the Aruba panel. No EPP code, no unlock, no
60-day lock. The domain locks above only block a registrar *transfer*; they do
not block a nameserver change, which is a normal DNS operation.

## The mail records that must survive the cutover

Every one of these must exist in the Cloudflare zone, DNS-only, verified
resolvable via Cloudflare's own nameservers, before the switch:

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

All of these — per the status section above — are already replicated at
DNS-only/TTL 300 in the Cloudflare zone. Before switching nameservers, spot-check
at minimum the `MX`, `A mx`, `A mail`, and `TXT @` (SPF) records directly against
Cloudflare's nameservers (see verification command below) — these four are the
ones that break mail delivery outright if missing or wrong, as opposed to
degrading it (autodiscover, DMARC).

## Cutover order

The zone-build and replication steps are done (see status above). What remains:

1. **Re-verify the mail records** by querying Cloudflare's nameservers
   directly, not the live (Aruba-served) domain — see the command below. Do
   this even though it was done once already; DNS records at Cloudflare can be
   edited by anyone with dashboard access, and a stale verification is worse
   than no verification.
2. **Only then**, change the nameservers at the Aruba panel to Cloudflare's
   assigned pair (shown in the Cloudflare dashboard for this zone once you're
   in it — they are account-specific, not the generic `*.cloudflare.com`
   pattern, so read them from the dashboard rather than assuming a value).
3. **Wait for propagation.** Nameserver changes are not instant; expect
   anywhere from minutes to ~24–48 hours depending on the resolver, though in
   practice most resolvers pick it up within a couple of hours. The Cloudflare
   dashboard will show the zone status flip from `pending` to `active` once
   Cloudflare detects the nameservers pointing at it.
4. **Confirm mail delivery end-to-end**, specifically to
   `info@sandupottery.com` — send a test message from an external account (not
   webmail-to-webmail on the same server, which can succeed even if inbound
   MX resolution is broken) and confirm it arrives. Do this before telling the
   client it's done, and ideally before doing anything else with the zone.
5. **Only after mail is confirmed working**, connect the Cloudflare Pages
   project `sandupottery-lavori-in-corso` to serve the apex and `www` for this
   site. Do not do this before step 4 — if something in the mail cutover needs
   fixing, you want the smallest possible set of things that changed at once.
6. **After a few days of stable operation**, consider raising the TTL on the
   mail records from 300 back to something normal (3600+), to reduce query
   load. Not urgent, not blocking.

## Verification command

Query Cloudflare's nameservers directly for a record, bypassing whatever the
domain currently resolves to:

```bash
dig @<cloudflare-nameserver-for-this-zone> MX sandupottery.com
dig @<cloudflare-nameserver-for-this-zone> A mx.sandupottery.com
dig @<cloudflare-nameserver-for-this-zone> TXT sandupottery.com
```

Find the actual per-zone nameserver names in the Cloudflare dashboard for this
zone (they are assigned per-account, not a fixed pair) — do not guess a
`*.ns.cloudflare.com` name.

## Credentials required from the client

Blocking for the nameserver switch itself: Aruba panel login (username /
customer code + password), and which phone or email receives any 2FA code the
panel requires. The exact list of live `@sandupottery.com` mailboxes, so none
are broken by an oversight in the record replication (the mail records
identified and replicated are listed in the status section above; there is no
guarantee that is the complete list of every mailbox ever created). Her
mailbox password is **not** needed for any of this.

Non-blocking but time-sensitive: the Shopify admin login. Even on the cancelled
plan, the admin still allows a product CSV and image export — this is the
complete-catalogue source for the eventual permanent site. The CDN currently
still serves her old product images directly, which is how several photographs
already in this repo's `public/foto/` were recovered without paying for
reactivation — but that access is not guaranteed to last, and is a separate,
lower-urgency task from the DNS cutover.

## If something breaks after the switch

1. Do not panic-revert the nameservers first — check whether the Cloudflare
   zone actually has the record that's failing, and whether it is
   accidentally proxied (orange cloud) when it should be DNS-only (grey
   cloud). This is the single most likely failure mode and is fixable in
   Cloudflare without touching Aruba at all.
2. If the fix genuinely requires reverting, changing the nameservers at Aruba
   back to the original four (`dns.technorail.com`, `dns2.technorail.com`,
   `dns3.arubadns.net`, `dns4.arubadns.cz`) restores the previous
   Aruba-served state. Aruba's zone was not deleted or modified during this
   process, only copied — so the original zone is still authoritative the
   moment the nameservers point back at it.
3. Either way, re-confirm mail delivery to `info@sandupottery.com` afterward,
   the same way as step 4 of the cutover order above. A rollback is not
   verified done until mail is confirmed working again, exactly like the
   forward cutover isn't.

## Related facts, not blocking DNS but relevant to this same domain

- Repo: `github.com/sandupottery/lavori-in-corso`, public. The GitHub org
  `sandupottery` did not exist as of Task 12 (`gh api orgs/sandupottery`
  returned 404) — creating it and pushing the repo there is a separate,
  tracked handoff, not part of the DNS work.
- Cloudflare Pages project name is `sandupottery-lavori-in-corso` (account-
  scoped, not domain-scoped) — chosen to leave the bare `sandupottery` Pages
  project name free for the eventual permanent site.
- The client publishes no P.IVA and no company name on this site by her own
  request — this is unrelated to DNS but is documented here because it is the
  kind of fact someone reconstructing "why does this look incomplete" at 11pm
  might otherwise assume was an oversight. It is not.
