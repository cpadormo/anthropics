# Academic Portfolio

A single-user portfolio site for an undergraduate building toward graduate school: coursework, research, writing, internships, awards, conferences, and reflection — all editable through a built-in admin panel, no code changes required.

## Stack

- Next.js 14 (App Router, server actions)
- TypeScript + Tailwind CSS
- Prisma + PostgreSQL (Neon, Supabase, or any Postgres)
- iron-session for admin auth

## Quick start (local)

You need a Postgres database URL. The fastest free option is [Neon](https://neon.tech) —
create a project and copy the connection string.

```bash
cp .env.example .env
# edit .env: paste your Postgres URL into DATABASE_URL and DIRECT_URL
npm install
npx prisma db push
npm run db:seed     # optional: populate realistic placeholder data
npm run dev
```

Visit http://localhost:3000.

## Deploying to Vercel

1. Create a Postgres database on [Neon](https://neon.tech) (free).
2. Import this repo in [Vercel](https://vercel.com/new).
3. In Vercel project settings → Environment Variables, add:
   - `DATABASE_URL` — Neon pooled connection string
   - `DIRECT_URL` — Neon direct connection string
   - `ADMIN_PASSWORD` — your edit password
   - `SESSION_SECRET` — 32+ character random string
4. Deploy. The build command applies the schema automatically.

Set `ADMIN_PASSWORD` in `.env` (default: `changeme`) and a 32+ character `SESSION_SECRET`, then sign in at `/admin/login`.

## Sections

- **Dashboard** — credits, GPA, course / hour / publication counts (LinkedIn-style stats)
- **Coursework** — expandable cards per course (topics, projects, papers, reflection, syllabus)
- **Research** — one profile per lab (questions, methods, skills, posters, papers, reflection)
- **Projects** — title, goal, method, outcome, skills, files
- **Writing** — papers grouped by type (research, legal analysis, lit review, essay, reflection, capstone)
- **Internships, Volunteer, Leadership** — full profiles with hours, reflections, reference letters
- **Certifications, Awards, Conferences** — categorized lists
- **Resume Center** — inline PDF preview + download
- **Skills, Reading Log, Goals, Gallery, Timeline, Contact, About**
- **Search** — global lookup across coursework, papers, projects, research, awards, conferences, books

## Admin

`/admin` exposes CRUD for every entity. Forms are generated from `lib/entities.ts` — adding a new field to the schema and the entity config makes it editable everywhere.

File uploads (resumes, syllabi, PDFs, photos) land in `public/uploads/`. In production, swap `lib/upload.ts` for an S3 / R2 backed implementation.

## Design

Clean white surfaces with navy accents and a dark-mode toggle. Components in `components/ui` and `components/layout`; per-page widgets in `components/widgets`. Tailwind handles responsive layout.

## Adding a new field

1. Add the column in `prisma/schema.prisma`.
2. Run `npx prisma db push`.
3. Add the matching field entry in `lib/entities.ts`.
4. Render it on the public page in `app/<section>/page.tsx`.
