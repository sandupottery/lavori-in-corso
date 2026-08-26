# Security Policy

This is a small, static, no-backend marketing site — there is no database, no
authentication, no user-submitted data, and no server-side code running in
production (`output: "export"`, served as static files from Cloudflare Pages).
The realistic attack surface is narrow: the build pipeline, the DNS zone
(see `docs/dns-cloudflare.md`), and third-party dependencies.

## Reporting a vulnerability

If you find a security issue — anything from a dependency vulnerability to a
DNS or deployment misconfiguration — please report it privately rather than
opening a public issue.

**Email:** info@sandupottery.com

That inbox is the potter's public customer address; reports sent there are
forwarded to the maintainer. If you'd rather reach the maintainer directly,
see the repository's commit history or GitHub profile for contact details.

Include, as far as you can:

- What you found and where (file, URL, or DNS record)
- The potential impact
- Steps to reproduce, if applicable

We'll acknowledge reports as promptly as we can. There is no bug bounty — this
is a temporary site for a small independent artisan business — but real
findings are taken seriously and will be fixed.

## Scope

In scope: this repository's code, its build and deploy pipeline
(`.github/workflows/`), and the DNS configuration described in
`docs/dns-cloudflare.md`.

Out of scope: the client's Aruba mailbox contents, her Instagram accounts, and
any third-party service (Cloudflare, GitHub, Aruba) beyond how this project is
configured to use it — report those directly to the relevant provider.
