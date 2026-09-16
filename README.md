# AI Language Coach for NT2 (TaalCozy)

TaalCozy is a Next.js-based language learning platform for NT2 (Dutch as a second language) students in Dutch MBO education. It combines a “cozy” editorial UI with structured lessons, practice exercises, gamification, and multilingual UI support.

## Tech Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Auth.js (NextAuth) for authentication
- Prisma + MySQL

## Key Features

- Lessons & lesson builder (teacher flow)
- Practice exercises (multiple choice, fill-in-the-blank)
- Gamification (XP, streak, levels)
- Multilingual UI:
  - Full, hand-crafted dictionaries for primary locales (NL/EN/TR/AR/PL/ES/DE)
  - Automatic translation for all other locales via the `/api/i18n` endpoint
  - Bilingual UI pattern where applicable (translated label + Dutch reference)

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create a local environment file and fill in values as needed:

```bash
cp .env.example .env.local
```

Important:
- Do not commit `.env.local` (it is ignored by git).
- The default setup expects a local MySQL server.

### 3) Database

Make sure MySQL is running and reachable (default: `127.0.0.1:3306`) and that `DATABASE_URL` points to the correct database.

Run migrations:

```bash
npx prisma migrate dev
```

Optionally seed data:

```bash
npx prisma db seed
```

### 4) Start the dev server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Translation & i18n Notes

- The UI translation system is powered by `/api/i18n`.
- Primary locales use complete dictionaries; all other locales dynamically receive translated templates.
- For large parts of UI and content, translated payloads are requested via POST to `/api/i18n`.

## Repo Workflow

- `main`: stable branch
- `development`: active development branch (open PRs from `development` → `main`)

## License

License information will be added later.
