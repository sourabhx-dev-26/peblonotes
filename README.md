# PebloNotes

PebloNotes is a secure note‑taking web app built with **Next.js (App Router)**, **TypeScript**, **Prisma**, and **PostgreSQL**.  
It supports **JWT authentication**, CRUD notes, **tags**, **archiving**, **shareable links**, and **AI-assisted note actions**.

## Features

- Auth: Sign up, log in, log out, "me" endpoint (JWT/session based)
- Notes: Create, read, update, delete
- Tags: Add/manage tags for notes
- Archive: Archive/unarchive notes
- Sharing: Generate a share link and access a shared note by `shareId`
- AI: AI helper endpoint for a note (requires OpenAI key if enabled)

## Tech Stack

- Next.js + TypeScript
- Prisma ORM
- PostgreSQL
- ESLint

## Prerequisites

- Node.js 18+ (recommended)
- PostgreSQL running locally

## Setup (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Create environment file

Copy `.env.example` to `.env.local` and fill in values:

```bash
# (Linux/macOS)
cp .env.example .env.local
```

On Windows (CMD):

```bat
copy .env.example .env.local
```

Edit `.env.local` and set:

- `DATABASE_URL` (your local Postgres connection)
- `JWT_SECRET` (any long random string)
- `OPENAI_API_KEY` (optional; only needed for AI endpoint)

Example:

```env
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@localhost:5432/peblonotes
JWT_SECRET=some_long_random_secret
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3) Run database migrations

```bash
npx prisma generate
npx prisma migrate deploy
```

(Optional, if you use Prisma Studio)
```bash
npx prisma studio
```

### 4) Start the dev server

```bash
npm run dev
```

App runs on: http://localhost:3000

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
- `GET  /api/shared/[shareId]`

### AI
- `POST /api/notes/[id]/ai`

> Note: AI route requires `OPENAI_API_KEY` if you want real OpenAI calls.

## Common Troubleshooting

- If Prisma fails to connect: confirm Postgres is running and `DATABASE_URL` is correct.
- If auth fails: ensure `JWT_SECRET` is set in `.env.local`.

## License

MIT (or update as needed).