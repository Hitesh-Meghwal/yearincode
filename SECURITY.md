# Security policy

## Reporting a vulnerability

If you've found a security issue, **do not open a public GitHub issue**. Public issues = a window for attackers between disclosure and patch.

Email **security@yearincode.com** with:

- A description of the vulnerability and its impact
- Steps to reproduce (proof-of-concept code or URLs are great, but optional)
- Your name / handle if you'd like credit in the fix commit

You'll get an acknowledgement within a few days. If you don't, assume the email bounced and ping the maintainer ([@Hitesh-Meghwal](https://github.com/Hitesh-Meghwal)) via any reasonable channel — just don't put details in public.

## Supported versions

Only the **latest commit on `main`** is supported, which is what's deployed at <https://yearincode.com>. There are no LTS branches, no backports to older releases, no security patches for self-hosted forks running stale code. If you're running yearincode anywhere other than off `main`, you're on your own.

## Disclosure timeline

Standard responsible-disclosure: a **90-day embargo** from the date the report is acknowledged. If a fix ships sooner, the embargo ends with the fix. If 90 days pass and the issue is still unpatched, you're free to disclose publicly — fair's fair.

## Scope

In scope:
- The live site at `yearincode.com` and `*.yearincode.com`
- Source code in this repository

Out of scope:
- Vulnerabilities in third-party services we depend on (GitHub, Supabase, Vercel) — report those to the vendor directly
- Social engineering, physical attacks, denial-of-service against the free-tier hosting
- Issues that require an attacker to already have OAuth tokens or DB access
