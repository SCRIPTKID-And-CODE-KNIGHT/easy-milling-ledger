import { supabase } from "@/integrations/supabase/client";

export type Customer = {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CustomerTransaction = {
  id: string;
  user_id: string;
  customer_id: string;
  amount: number;
  type: string; // 'debt' | 'payment'
  description: string;
  date: string;
  created_at: string;
};

const db = () => supabase as any;

export async function fetchCustomers(): Promise<Customer[]> {
  const { data, error } = await db().from("customers").select("*").order("name");
  if (error) throw error;
  return data || [];
}

export async function upsertCustomer(customer: Partial<Customer> & { name: string }): Promise<Customer> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await db()
    .from("customers")
    .upsert({ ...customer, user_id: user.id }, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await db().from("customers").delete().eq("id", id);
  if (error) throw error;
}

export async function fetchCustomerTransactions(customerId: string): Promise<CustomerTransaction[]> {
  const { data, error } = await db()
    .from("customer_transactions")
    .select("*")
    .eq("customer_id", customerId)
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addCustomerTransaction(tx: {
  customer_id: string;
  amount: number;
  type: string;
  description: string;
  date: string;
}): Promise<CustomerTransaction> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await db()
    .from("customer_transactions")
    .insert({ ...tx, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCustomerTransaction(id: string): Promise<void> {
  const { error } = await db().from("customer_transactions").delete().eq("id", id);
  if (error) throw error;
}

export function calculateBalance(transactions: CustomerTransaction[]): number {
  return transactions.reduce((bal, tx) => {
    return tx.type === "debt" ? bal + tx.amount : bal - tx.amount;
  }, 0);
}
