-- Create daily_records table
CREATE TABLE public.daily_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  money_earned NUMERIC NOT NULL DEFAULT 0,
  food_expense NUMERIC NOT NULL DEFAULT 0,
  repair_expense NUMERIC NOT NULL DEFAULT 0,
  other_expense NUMERIC NOT NULL DEFAULT 0,
  debt NUMERIC NOT NULL DEFAULT 0,
  electricity_used NUMERIC NOT NULL DEFAULT 0,
  electricity_remaining NUMERIC NOT NULL DEFAULT 0,
  profit NUMERIC GENERATED ALWAYS AS (money_earned - food_expense - repair_expense - other_expense - debt) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_records ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth for this simple record system)
CREATE POLICY "Anyone can read daily_records" ON public.daily_records FOR SELECT USING (true);
CREATE POLICY "Anyone can insert daily_records" ON public.daily_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update daily_records" ON public.daily_records FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete daily_records" ON public.daily_records FOR DELETE USING (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_daily_records_updated_at
  BEFORE UPDATE ON public.daily_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();