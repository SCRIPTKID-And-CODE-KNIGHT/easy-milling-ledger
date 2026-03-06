

## Landing Page for Biashara Bora System

### What will be built

A public landing page at `/` that visitors see before logging in. It will showcase the system's value proposition with:

1. **Hero section** — "Biashara Bora System" title, tagline describing the business management tool, and CTA buttons for "Sign In" and "Sign Up"
2. **Features section** — 3 cards highlighting key capabilities: Milling Machine tracking, Shop Inventory & Sales, and Reports & Analytics
3. **Footer** — Simple copyright line

### Routing changes

- `/` becomes the public landing page (new `LandingPage.tsx`)
- Milling dashboard moves to `/dashboard`
- When logged-in users visit `/`, redirect to `/dashboard` or `/shop` based on business type
- `ProtectedRoute` redirects unauthenticated users to `/` instead of `/auth`

### Files

| File | Action |
|------|--------|
| `src/pages/Landing.tsx` | Create — hero, features, CTA |
| `src/App.tsx` | Edit — add landing route at `/`, move milling dashboard to `/dashboard`, update redirects |
| `src/lib/i18n.ts` | Edit — add EN/SW translations for landing page text |
| `src/components/AppSidebar.tsx` | Edit — update dashboard link to `/dashboard` |

### i18n keys (sample)
- `landing_hero_title`: "Manage Your Business Smarter" / "Simamia Biashara Yako kwa Akili"
- `landing_hero_desc`: "Track earnings, expenses, inventory and sales — all in one place" / "Fuatilia mapato, matumizi, bidhaa na mauzo — yote sehemu moja"
- `landing_feature_milling`: "Milling Machine Management" / "Usimamizi wa Mashine ya Kusaga"
- `landing_feature_shop`: "Shop Business Management" / "Usimamizi wa Biashara ya Duka"
- `landing_feature_reports`: "Reports & Analytics" / "Ripoti na Uchambuzi"

