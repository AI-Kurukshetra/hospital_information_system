# Healthland Centriq

Healthland Centriq is a cloud-native hospital information system MVP for critical access hospitals. The demo path is:

`Register -> Admit -> Treat -> Bill -> Discharge`

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- Supabase Realtime
- Vercel deployment target

## MVP Features

- Role-aware authentication and protected routes
- Patient registration and patient directory
- Live bed management board with admit and discharge workflow
- Patient chart with:
  - overview
  - vitals
  - diagnoses
  - orders
  - clinical notes
- Global active orders queue with status transitions
- Billing dashboard and billing detail editor
- Role-aware operational dashboard

## Demo Credentials

- `admin@demo.com / Demo1234!`
- `physician@demo.com / Demo1234!`
- `nurse@demo.com / Demo1234!`
- `billing@demo.com / Demo1234!`
- `receptionist@demo.com / Demo1234!`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example`.

3. Add these values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. In Supabase Auth URL settings, use:

- Site URL: `http://localhost:3000`
- Redirect URL: `http://localhost:3000/auth/callback`

5. Apply the schema and seed data in Supabase:

- Run `supabase/migrations/001_initial_schema.sql`
- Run `supabase/seed.sql`

6. Start the app:

```bash
npm run dev
```

## Key Routes

- `/dashboard`
- `/patients`
- `/patients/[id]`
- `/patients/[id]/chart`
- `/beds`
- `/orders`
- `/billing`
- `/admin`

## Build Verification

```bash
npm run lint
npx tsc --noEmit
npm run build -- --webpack
```

Note: lint still reports one existing TanStack Table React Compiler warning in `components/patients/patient-list.tsx`.

## Deployment

Deploy to Vercel with the environment variables from `.env.example`.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended deployment checks:

1. Verify demo users can sign in.
2. Confirm patient list and bed board render.
3. Admit a registered patient to a free bed.
4. Open the patient chart and confirm orders queue access.
5. Open billing and dashboard as admin.
