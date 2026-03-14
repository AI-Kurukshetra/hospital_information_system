## Supabase Setup

This app is already wired for Supabase Auth. To connect it to your own Supabase project:

1. Create a `.env.local` file in the project root.
2. Copy values from `.env.example`.
3. In Supabase dashboard, go to `Project Settings -> API` and copy:
   - `Project URL` into `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key into `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In Supabase dashboard, go to `Authentication -> URL Configuration` and set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
5. Restart your dev server.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), then use `/signup` and `/login`.
