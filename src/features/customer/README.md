# customer

Customer ordering experience: discovery, menu, cart, checkout, orders, and profile.

## Structure

- `api/` — query keys + service re-exports
- `services/` — Supabase data access
- `hooks/` — TanStack Query hooks
- `components/` — feature UI (cards, filters, timeline, etc.)
- `types/` — customer domain types
- `utils/` — formatting, totals, schemas
- Feature folders (`home`, `restaurants`, `cart`, …) hold pages

Cart state lives in `@/store/cart.store` (Zustand + persist). Saved addresses use `@/store/address.store`.
