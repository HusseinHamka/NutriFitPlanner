# NutriFit Pro

Private nutrition and fitness planning application for a single practitioner.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- TanStack Query + React Hook Form + Zod
- Supabase (PostgreSQL, Auth, Storage, RLS)

## Local Development

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Set values in `.env.local`:

```
VITE_SUPABASE_URL=https://qkgjgeygczeczvlssgsa.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

3. Install and run:

```bash
npm install
npm run dev
```

## Supabase Project

- Project: `nutrifit-pro`
- Region: `eu-central-1`
- Project ref: `qkgjgeygczeczvlssgsa`

Migrations are stored in `supabase/migrations/`.

## First-Time Setup

1. In Supabase Dashboard → Authentication → Users, create the practitioner account manually.
2. Disable public signups in Authentication settings.
3. Sign in through the app at `/login`.
4. Complete Business Settings before generating reports.

## Deployment (Vercel)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Set environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Add your Vercel URL to Supabase Auth redirect URLs.

## Architecture

- Feature-based folders under `src/features/`
- Repository abstractions in `src/services/abstractions/`
- Supabase implementations in `src/services/infrastructure/supabase/`
- Single report pipeline: Plan Revision → Report Model → Preview / PDF / DOCX
