
-- 1. user_business_type table
CREATE TABLE public.user_business_type (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_type text NOT NULL CHECK (business_type IN ('milling', 'shop')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_business_type ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own business type" ON public.user_business_type FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business type" ON public.user_business_type FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own business type" ON public.user_business_type FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 2. shop_products table
CREATE TABLE public.shop_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  buying_price numeric NOT NULL DEFAULT 0,
  selling_price numeric NOT NULL DEFAULT 0,
  stock_quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'piece',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own products" ON public.shop_products FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own products" ON public.shop_products FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own products" ON public.shop_products FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own products" ON public.shop_products FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_shop_products_updated_at BEFORE UPDATE ON public.shop_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. shop_daily_records table
CREATE TABLE public.shop_daily_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  total_sales numeric NOT NULL DEFAULT 0,
  total_cost_of_goods numeric NOT NULL DEFAULT 0,
  food_expense numeric NOT NULL DEFAULT 0,
  rent_expense numeric NOT NULL DEFAULT 0,
  other_expense numeric NOT NULL DEFAULT 0,
  debt numeric NOT NULL DEFAULT 0,
  profit numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.shop_daily_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own shop records" ON public.shop_daily_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shop records" ON public.shop_daily_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shop records" ON public.shop_daily_records FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shop records" ON public.shop_daily_records FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_shop_daily_records_updated_at BEFORE UPDATE ON public.shop_daily_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Profit trigger
CREATE OR REPLACE FUNCTION public.calculate_shop_profit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.profit := NEW.total_sales - NEW.total_cost_of_goods - NEW.food_expense - NEW.rent_expense - NEW.other_expense - NEW.debt;
  RETURN NEW;
END;
$$;

CREATE TRIGGER calculate_shop_profit_trigger BEFORE INSERT OR UPDATE ON public.shop_daily_records FOR EACH ROW EXECUTE FUNCTION public.calculate_shop_profit();

-- 4. shop_sales table
CREATE TABLE public.shop_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  product_id uuid REFERENCES public.shop_products(id) ON DELETE CASCADE NOT NULL,
  quantity_sold numeric NOT NULL DEFAULT 0,
  sale_price numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own shop sales" ON public.shop_sales FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own shop sales" ON public.shop_sales FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own shop sales" ON public.shop_sales FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own shop sales" ON public.shop_sales FOR DELETE TO authenticated USING (auth.uid() = user_id);
