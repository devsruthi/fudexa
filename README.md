# OrderFlow

Real-time restaurant operations platform for customers and merchants.

## Stack

- React 19 · TypeScript · Vite
- React Router v7 · TanStack Query · Zustand (UI only)
- Tailwind CSS · Framer Motion · Lucide React · Sonner
- React Hook Form · Zod · Supabase Auth

## Getting started

```bash
cp .env.example .env
# Fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
# Run supabase/migrations/001_profiles.sql in the Supabase SQL Editor
# Add redirect URLs in Supabase Auth: /login and /reset-password
npm install
npm run dev
```

## Auth

| Route | Purpose |
| --- | --- |
| `/login` | Email/password sign in |
| `/register` | Sign up with customer or restaurant role |
| `/forgot-password` | Request reset email |
| `/reset-password` | Set new password from email link |

After login: **customer** → `/customer/home`, **restaurant** → `/restaurant/dashboard`.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript project references check |
