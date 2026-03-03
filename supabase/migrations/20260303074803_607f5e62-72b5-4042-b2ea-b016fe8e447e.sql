
-- Add user_id column to daily_records
ALTER TABLE public.daily_records ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can delete daily_records" ON public.daily_records;
DROP POLICY IF EXISTS "Anyone can insert daily_records" ON public.daily_records;
DROP POLICY IF EXISTS "Anyone can read daily_records" ON public.daily_records;
DROP POLICY IF EXISTS "Anyone can update daily_records" ON public.daily_records;

-- Create user-scoped RLS policies
CREATE POLICY "Users can read own records" ON public.daily_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own records" ON public.daily_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own records" ON public.daily_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own records" ON public.daily_records FOR DELETE USING (auth.uid() = user_id);
