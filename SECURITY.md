# Security Policy

## Reporting a Vulnerability

Do not open public issues for vulnerabilities, abuse paths, exposed secrets or privacy problems involving location data.

Send reports to:

```txt
suporte@eduardobertin.com.br
```

Include:

- short description;
- affected area;
- reproduction steps if safe to share;
- impact;
- screenshots or logs with secrets and personal data removed.

## Sensitive Areas

Pay special attention to:

- Supabase RPCs and Realtime policies;
- room codes, invite links and QR codes;
- temporary player sessions;
- location snapshots;
- radar/capture derivation;
- public legal pages;
- Vercel environment variables.

## Data Handling

Never include real GPS coordinates, addresses, access tokens, Supabase keys beyond public anon configuration, private URLs or personal data in public issues, screenshots, docs or pull requests.

## Supported Version

The MVP is under active development. Security fixes apply to the current `main` branch unless otherwise stated.
