
ALTER TABLE public.daily_records ADD COLUMN electricity_units_bought NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.daily_records ADD COLUMN electricity_cost NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.daily_records DROP COLUMN profit;
ALTER TABLE public.daily_records ADD COLUMN profit NUMERIC GENERATED ALWAYS AS (money_earned - food_expense - repair_expense - other_expense - debt - electricity_cost) STORED;
