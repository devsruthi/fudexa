# OrderFlow

Real-time restaurant operations platform for customers and merchants.

## Stack

- React 19 · TypeScript · Vite
- React Router v7 · TanStack Query · Zustand (UI only)
- Tailwind CSS · Framer Motion · Lucide React
- React Hook Form · Zod · Supabase

## Getting started

```bash
cp .env.example .env
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |
| `npm run typecheck` | TypeScript project references check |

## Architecture

Feature-based layout under `src/`. Routing is role-based via `ProtectedRoute` + `RoleGuard` and a central `ROLE_HOME_PATHS` map — extendable for driver, kitchen, and admin without hardcoding redirects in UI.

Demo sign-in on `/auth/login` simulates customer and restaurant sessions for exploring the scaffold.
