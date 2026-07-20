# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Email
**security@YOURDOMAIN.com** with details and steps to reproduce. We aim to acknowledge within
72 hours and to provide a fix or mitigation timeline after triage.

## Scope & threat model

This is a **static, client-side application**. There is no backend, database, or server-side
processing of user files:

- Images are processed in the browser and are **never uploaded**.
- There are no accounts, sessions, or stored personal data.
- Therefore classic server-side classes (SQLi, CSRF, server RCE) are out of scope.

Relevant areas we **do** care about:

- **XSS** via filenames or DOM injection (mitigated: all user strings are HTML-escaped).
- **Supply chain**: third-party scripts (JSZip, heic2any, UTIF) are loaded from a CDN on
  demand with `crossorigin="anonymous"` and constrained by the Content-Security-Policy in
  `_headers` / `netlify.toml`. Pin versions and consider Subresource Integrity for hardening.
- **Clickjacking**: `X-Frame-Options: SAMEORIGIN`.
- **Header hardening**: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

## Supported versions

The latest `main` is supported. Fixes are applied there and deployed to the live site.
