import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

export type ShopProduct = {
  id: string;
  user_id: string;
  name: string;
  buying_price: number;
  selling_price: number;
  stock_quantity: number;
  unit: string;
  created_at: string;
  updated_at: string;
};

export type ShopDailyRecord = {
  id: string;
  user_id: string;
  date: string;
  total_sales: number;
  total_cost_of_goods: number;
  food_expense: number;
  rent_expense: number;
  other_expense: number;
  debt: number;
  profit: number | null;
  created_at: string;
  updated_at: string;
};

export type ShopSale = {
  id: string;
  user_id: string;
  date: string;
  product_id: string;
  quantity_sold: number;
  sale_price: number;
  created_at: string;
};

const db = () => supabase as any;

// Products
export async function fetchProducts(): Promise<ShopProduct[]> {
  const { data, error } = await db().from("shop_products").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function upsertProduct(product: Partial<ShopProduct> & { name: string }): Promise<ShopProduct> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await db()
    .from("shop_products")
    .upsert({ ...product, user_id: user.id }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await db().from("shop_products").delete().eq("id", id);
  if (error) throw error;
}

// Daily Records
export async function fetchShopTodayRecord(): Promise<ShopDailyRecord | null> {
  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await db().from("shop_daily_records").select("*").eq("date", today).maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchShopMonthRecords(year: number, month: number): Promise<ShopDailyRecord[]> {
  const start = format(startOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date(year, month - 1)), "yyyy-MM-dd");
  const { data, error } = await db().from("shop_daily_records").select("*").gte("date", start).lte("date", end).order("date");
  if (error) throw error;
  return data || [];
}

export async function fetchShopYearRecords(year: number): Promise<ShopDailyRecord[]> {
  const start = format(startOfYear(new Date(year, 0)), "yyyy-MM-dd");
  const end = format(endOfYear(new Date(year, 0)), "yyyy-MM-dd");
  const { data, error } = await db().from("shop_daily_records").select("*").gte("date", start).lte("date", end).order("date");
  if (error) throw error;
  return data || [];
}

export type ShopRecordInput = {
  date: string;
  total_sales: number;
  total_cost_of_goods: number;
  food_expense: number;
  rent_expense: number;
  other_expense: number;
  debt: number;
};

export async function upsertShopRecord(input: ShopRecordInput): Promise<ShopDailyRecord> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await db()
    .from("shop_daily_records")
    .upsert({ ...input, user_id: user.id }, { onConflict: "user_id,date" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteShopRecord(id: string): Promise<void> {
  const { error } = await db().from("shop_daily_records").delete().eq("id", id);
  if (error) throw error;
}

// Sales
export async function recordSale(sale: { date: string; product_id: string; quantity_sold: number; sale_price: number }): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  
  // Insert sale
  const { error } = await db().from("shop_sales").insert({ ...sale, user_id: user.id });
  if (error) throw error;

  // Decrement stock
  const { data: product } = await db().from("shop_products").select("stock_quantity").eq("id", sale.product_id).single();
  if (product) {
    await db().from("shop_products").update({ stock_quantity: Math.max(0, product.stock_quantity - sale.quantity_sold) }).eq("id", sale.product_id);
  }
}

export async function fetchSalesByDate(date: string): Promise<(ShopSale & { product_name?: string })[]> {
  const { data, error } = await db().from("shop_sales").select("*, shop_products(name)").eq("date", date).order("created_at");
  if (error) throw error;
  return (data || []).map((s: any) => ({ ...s, product_name: s.shop_products?.name }));
}
