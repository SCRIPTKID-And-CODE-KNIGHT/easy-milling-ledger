

## Language Switcher: English ↔ Swahili

### Approach
Create a simple i18n system using React Context — no heavy library needed for just 2 languages.

### What will be built

1. **Translation file** (`src/lib/i18n.ts`) — a dictionary object mapping keys to English and Swahili strings for all UI text (dashboard labels, form fields, sidebar items, reports headings, months, etc.)

2. **Language Context** (`src/hooks/useLanguage.tsx`) — React context that stores the selected language (`en` | `sw`) in `localStorage` so it persists across sessions. Exposes a `t(key)` translation function and a `toggleLanguage()` method.

3. **Language toggle button** — added to the sidebar footer (above Sign Out), showing "SW" or "EN" to switch languages.

4. **Update all pages** — replace hardcoded English strings with `t("key")` calls:
   - `AppLayout.tsx` — header title
   - `AppSidebar.tsx` — menu items, sign out
   - `Index.tsx` — dashboard cards, buttons
   - `AddRecord.tsx` — form labels, tooltips, button text
   - `Reports.tsx` — tab labels, table headers, chart labels, electricity summary
   - `Auth.tsx` — login/signup text

### Swahili translations (sample)
| Key | English | Swahili |
|-----|---------|---------|
| dashboard | Dashboard | Dashibodi |
| earnings | Earnings | Mapato |
| expenses | Expenses | Matumizi |
| profit | Profit | Faida |
| electricity | Electricity | Umeme |
| add_record | Add Daily Record | Ongeza Rekodi |
| reports | Reports | Ripoti |
| sign_out | Sign Out | Ondoka |
| sign_in | Sign In | Ingia |

