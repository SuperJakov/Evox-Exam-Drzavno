# Evox Exam

Evox Exam is a site which allows to host exams in your school.

## Technologies

- Convex
- Next.js
- TypeScript (tsgo)
- Biome
- Cypress
- Better Auth

## Build

Dev server:

```bash
bun run dev
```

Build:

```bash
bun run build
```

Production installation (for server):

```bash
bun install --frozen-lockfile
```

Installation for development:

```bash
bun install
```

## Tests

Run unit tests:

```bash
bun run test:unit
```

Open Cypress UI:

```bash
bun run cypress:open
```

## Generating schema for auth

Since we are using [local install](https://labs.convex.dev/better-auth/features/local-install), we need to run this command in `\convex\better-auth` directory if we make changes in schema for auth.

```bash
bun x @better-auth/cli generate -y
```