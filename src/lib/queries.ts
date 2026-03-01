import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export type DailyRecord = {
  id: string;
  date: string;
  money_earned: number;
  food_expense: number;
  repair_expense: number;
  other_expense: number;
  debt: number;
  electricity_used: number;
  electricity_remaining: number;
  electricity_units_bought: number;
  electricity_cost: number;
  profit: number;
  created_at: string;
  updated_at: string;
};

export async function fetchTodayRecord(): Promise<DailyRecord | null> {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("date", today)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchRecordByDate(date: string): Promise<DailyRecord | null> {
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .eq("date", date)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchMonthRecords(year: number, month: number): Promise<DailyRecord[]> {
  const start = format(startOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchYearRecords(year: number): Promise<DailyRecord[]> {
  const start = format(startOfYear(new Date(year, 0)), "yyyy-MM-dd");
  const end = format(endOfYear(new Date(year, 0)), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchLatestRecord(): Promise<DailyRecord | null> {
  const { data, error } = await supabase
    .from("daily_records")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type RecordInput = {
  date: string;
  money_earned: number;
  food_expense: number;
  repair_expense: number;
  other_expense: number;
  debt: number;
  electricity_used: number;
  electricity_remaining: number;
  electricity_units_bought: number;
  electricity_cost: number;
};

export async function upsertRecord(input: RecordInput): Promise<DailyRecord> {
  const { data, error } = await supabase
    .from("daily_records")
    .upsert(input, { onConflict: "date" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase
    .from("daily_records")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
