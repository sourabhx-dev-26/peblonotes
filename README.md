# PebloNotes

PebloNotes is a secure note-taking web app built with **Next.js (App Router)**, **TypeScript**, **Prisma**, and **PostgreSQL**.  
It supports authentication, CRUD notes, tags, archiving, public share links, and AI-assisted note actions.

## Features

- Auth: sign up / log in / log out
- Notes: create, read, update, delete
- Tags: add and filter by tags
- Archive: archive / unarchive notes
- Sharing: generate a public share link and view note at `/share/[shareId]`
- AI: generate summary, action items, and suggested title for a note (Groq)



## Tech Stack

- Next.js + TypeScript
- Prisma ORM
- PostgreSQL
- Groq (OpenAI-compatible API)
- ESLint

## Architecture (High Level)
- Next.js App Router used for both UI pages and API route handlers.
- PostgreSQL is the primary database; Prisma ORM manages schema + queries.
- Auth uses JWT-based sessions (token stored client-side and validated in API routes).
- Notes, tags, sharing, and dashboard metrics are served via `/api/*` endpoints.
- AI actions are executed server-side via Groq API and returned as structured text to the UI.

## Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)

## Setup (Local)

### 1) Install dependencies
```bash
npm install
```

### 2) Environment variables
Copy `.env.example` to `.env.local` and fill values:

**Windows (CMD):**
```bat
copy .env.example .env.local
```

Update `.env.local` at minimum:
- `DATABASE_URL`
- `JWT_SECRET` (or your auth secret)
- `GROQ_API_KEY`

Example:
```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/peblonotes
JWT_SECRET=some_long_random_secret
GROQ_API_KEY=gsk_********************************
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Note: Groq API keys can expire (e.g., 7-day keys). If AI calls fail with 401, generate a new key and update `GROQ_API_KEY`.

### 3) Database migrations
```bash
npx prisma generate
npx prisma migrate dev
```

(Optional)
```bash
npx prisma studio
```

### 4) Start the dev server
```bash
npm run dev
```

App runs on: http://localhost:3000

## Main Routes

- Notes workspace: `/app`
- Note editor: `/app/note/[id]`
- Dashboard: `/app/dashboard`
- Public share page: `/share/[shareId]`

## API Routes (high level)

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

### Notes
- `GET  /api/notes`
- `POST /api/notes`
- `GET  /api/notes/[id]`
- `PATCH /api/notes/[id]`
- `DELETE /api/notes/[id]`

### Sharing
- `POST /api/notes/[id]/share`
- `GET  /api/share/[shareId]`

### AI (Groq)
- `POST /api/notes/[id]/ai`

## Submission Checklist

- [ ] `npm run build` passes
- [ ] `.env.local` is NOT committed (secrets safe)
- [ ] Share link works in an incognito window
- [ ] AI generate works with `GROQ_API_KEY`
- [ ] Dashboard shows real metrics

## Troubleshooting

- Prisma connection errors: verify Postgres is running and `DATABASE_URL` is correct.
- Auth errors: ensure `JWT_SECRET` is set in `.env.local`.
- AI errors: ensure `GROQ_API_KEY` is set and not expired.

## Sample Outputs
See `samples/` for:
- Example API responses
- AI-generated outputs (summary/action items)
- Screenshots
- Prisma schema (in `prisma/schema.prisma`)

## License

MIT
