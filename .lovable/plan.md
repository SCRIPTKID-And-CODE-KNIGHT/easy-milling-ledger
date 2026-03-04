

## Biashara Bora System — Business Type Selection + Shop Module

### Overview
Rename the system to "Biashara Bora System", add a business type selector after login, and build a full Shop Business module with inventory and sales tracking.

### Database Changes

**New tables:**

1. **`user_business_type`** — stores each user's selected business type
   - `id` (uuid, PK), `user_id` (uuid, references auth.users, unique), `business_type` (text: `'milling'` | `'shop'`), `created_at`

2. **`shop_products`** — product inventory
   - `id` (uuid, PK), `user_id` (uuid), `name` (text), `buying_price` (numeric), `selling_price` (numeric), `stock_quantity` (numeric), `unit` (text, e.g. "kg", "piece"), `created_at`, `updated_at`

3. **`shop_daily_records`** — daily shop sales/expense tracking
   - `id` (uuid, PK), `user_id` (uuid), `date` (date), `total_sales` (numeric), `total_cost_of_goods` (numeric), `food_expense` (numeric), `rent_expense` (numeric), `other_expense` (numeric), `debt` (numeric), `profit` (numeric, computed trigger), `created_at`, `updated_at`

4. **`shop_sales`** — individual product sales per day
   - `id` (uuid, PK), `user_id` (uuid), `date` (date), `product_id` (uuid, FK to shop_products), `quantity_sold` (numeric), `sale_price` (numeric), `created_at`

All tables get RLS policies scoped to `auth.uid() = user_id`.

### Application Changes

1. **Rename system** — Update `mill_manager` and `milling_records` i18n keys to "Biashara Bora System" / "Mfumo wa Biashara Bora". Update page title in `index.html`.

2. **Business type selection page** (`src/pages/SelectBusiness.tsx`)
   - Shown after login if user has no business type stored
   - Two cards: "Milling Machine" and "Shop Business" with icons
   - Saves choice to `user_business_type` table
   - Route: `/select-business`, protected

3. **Routing logic** — After login, check `user_business_type`:
   - No record → redirect to `/select-business`
   - `milling` → current dashboard/routes
   - `shop` → shop dashboard/routes

4. **Shop pages:**
   - **Shop Dashboard** (`/shop`) — today's sales summary, stock alerts, quick actions
   - **Products** (`/shop/products`) — add/edit/delete products with stock levels
   - **Add Shop Record** (`/shop/add-record`) — record daily sales (pick products, quantities), expenses
   - **Shop Reports** (`/shop/reports`) — monthly/yearly sales, profit charts, inventory reports

5. **Sidebar updates** — Show different nav items based on business type. Add option to switch business type in sidebar footer.

6. **i18n updates** — Add Swahili translations for all new shop-related strings (e.g., "Bidhaa" for Products, "Mauzo" for Sales, "Hifadhi" for Stock).

### File Structure
```text
src/pages/SelectBusiness.tsx    — business type picker
src/pages/shop/ShopDashboard.tsx
src/pages/shop/ShopProducts.tsx
src/pages/shop/ShopAddRecord.tsx
src/pages/shop/ShopReports.tsx
src/lib/shopQueries.ts          — shop CRUD functions
src/hooks/useBusinessType.tsx   — context for business type
```

### Technical Notes
- The existing milling module stays untouched; shop is a parallel module
- Business type is stored per-user in the database, not localStorage
- Stock quantities auto-decrement when sales are recorded (via application logic or trigger)
- Profit trigger on `shop_daily_records`: `profit = total_sales - total_cost_of_goods - food_expense - rent_expense - other_expense - debt`

