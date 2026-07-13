# Security Policy

## Supported versions

Security fixes are applied to the latest `main` branch.

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub private vulnerability reporting for this repository or contact the maintainer privately. Include reproduction steps, impact, and a proposed mitigation if available.

## Security model

Images are intentionally processed in the browser. The app restricts inputs by MIME type, size, and count, generates download names from a sanitized filename, avoids HTML injection for filenames, and ships CSP/header templates. Hosting administrators must enable HTTPS and retain security headers.
