# Academic Portfolio

A single-user portfolio site for an undergraduate building toward graduate school: coursework, research, writing, internships, awards, conferences, and reflection — all editable through a built-in admin panel, no code changes required.

## Stack

- Next.js 14 (App Router, server actions)
- TypeScript + Tailwind CSS
- Prisma + SQLite (file-based, zero config)
- iron-session for admin auth

## Quick start

```bash
cp .env.example .env
npm install
npx prisma db push
npm run db:seed     # optional: populate realistic placeholder data
npm run dev
```

Visit http://localhost:3000.

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
