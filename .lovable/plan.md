

## 5-Feature Roadmap — Phase-by-Phase Plan

I will implement these features one at a time across 5 phases. Here is the full plan; after approval I will start with Phase 1.

---

### Phase 1: Low-Stock Alerts (configurable threshold)
- Add a `low_stock_threshold` column (default 5) to `shop_products` table
- Show alert banner on Shop Dashboard when any product is at/below threshold
- Allow users to set threshold per product in the product edit dialog
- Add i18n keys for alert messages

### Phase 2: Dark Mode Toggle
- Add dark mode CSS variables to `index.css` (already has light theme defined)
- Create a `useTheme` hook using `next-themes` (already installed)
- Add dark mode toggle button in AppSidebar footer and Landing page navbar
- Persist theme choice in localStorage

### Phase 3: Export to PDF/Excel
- Install `jspdf` + `jspdf-autotable` for PDF, use native CSV generation for Excel-compatible export
- Add export buttons on Reports pages (both Milling and Shop)
- Export current month/year records as PDF table or CSV file
- Add i18n keys for export labels

### Phase 4: Customer Management (CRM)
- **New database tables**: `customers` (name, phone, notes, user_id) and `customer_transactions` (customer_id, amount, type, date, description, user_id)
- **New pages**: `/shop/customers` (list/add/edit customers), customer detail page with transaction history
- Add sidebar navigation item for Customers
- Track debts per customer with balance calculation
- RLS policies for user isolation

### Phase 5: Multi-Business Support
- Change `user_business_type` to store an array or multiple rows (one per business type)
- Update `useBusinessType` hook to support multiple active businesses
- Update sidebar to show both Milling and Shop nav items when both are selected
- Update `SelectBusiness` page to allow toggling multiple business types
- Update routing logic so users can access both `/dashboard` and `/shop`

---

### Implementation Order
Each phase will be a separate message. After each phase, you can test before moving to the next.

**Starting with Phase 1: Low-Stock Alerts** — the simplest and most immediately useful feature.

