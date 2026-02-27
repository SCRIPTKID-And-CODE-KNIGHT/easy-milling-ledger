

## Milling Machine Record System

### 1. Set Up Database
- Create tables: `daily_records` (date, money_earned, food_expense, repair_expense, other_expense, debt, electricity_used, electricity_remaining, profit — auto-calculated), and optionally a `settings` table for defaults
- Enable Row Level Security

### 2. Dashboard (Landing Page)
- Summary cards: Today's Earnings, Expenses, Profit, Electricity Remaining
- Quick action buttons: "Add Daily Record", "View Reports"
- Color-coded profit (green/red)
- Progress bar for electricity usage

### 3. Add/Edit Daily Record Page
- Date picker to select the record date
- Form fields: Money Earned, Food Expense, Repair Expense, Other Expense, Debt, Electricity Used, Electricity Remaining
- Auto-calculate profit (earnings − total expenses)
- Pre-fill electricity remaining from previous day's record
- Form validation (no negatives, required fields)
- Confirmation toast on save

### 4. Monthly & Yearly Reports Page
- Toggle between monthly and yearly views
- Table with all records: Date, Money Earned, Expenses, Debt, Profit, Electricity
- Color-coded profit column (green = profit, red = loss)
- Bar/line charts showing earnings, expenses, and profit trends using Recharts

### 5. Sidebar Navigation
- Dashboard, Add Record, Reports links
- Collapsible sidebar with icons
- Active route highlighting

### 6. Responsive Design & Polish
- Mobile-friendly layout with responsive tables
- Confirmation modals for delete/edit
- Tooltips on form fields
- Dark/light mode support

