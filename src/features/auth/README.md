# auth

Supabase Authentication feature with role-based access control.

## Structure

- `api/` — thin re-exports of the auth service for feature consumers
- `services/` — `signIn`, `signUp`, `signOut`, `forgotPassword`, `resetPassword`, session helpers
- `schemas/` — Zod validation for auth forms
- `hooks/` — `useAuth`, `useAuthRole`
- `context/` — `AuthProvider` (session restore + `onAuthStateChange`)
- `components/` — `ProtectedRoute`, `RoleRoute`, `GuestRoute`
- `pages/` — Login, Register, Forgot Password, Reset Password, Landing
- `types/` — auth DTOs and mappers

## Setup

1. Copy `.env.example` → `.env` and set Supabase URL + anon key
2. Run `supabase/migrations/001_profiles.sql` in the Supabase SQL Editor
3. In Supabase Auth settings, add redirect URLs:
   - `http://localhost:5173/login`
   - `http://localhost:5173/reset-password`
4. Enable Email provider (confirmations optional for local testing)
