import { supabase } from "@/lib/supabase";

export interface Order {
  inv: string;
  product: string;
  denom: string;
  uid: string;
  pay: string;
  total: number;
  status: string;
  created: number | string;
  base?: number;
  fee?: number;
  disc?: number;
  email?: string | null;
}

const toLocalOrder = (row: Record<string, unknown>): Order => ({
  inv: String(row.inv),
  product: String(row.product),
  denom: String(row.denom),
  uid: String(row.uid ?? "—"),
  pay: String(row.pay ?? "QRIS"),
  total: Number(row.total ?? 0),
  status: String(row.status ?? "Menunggu pembayaran"),
  created: row.created_at ? new Date(row.created_at as string).getTime() : Date.now(),
  base: Number(row.base ?? 0),
  fee: Number(row.fee ?? 0),
  disc: Number(row.disc ?? 0),
  email: (row.email as string) ?? null,
});

export async function saveOrder(order: {
  inv: string;
  product: string;
  denom: string;
  uid: string;
  pay: string;
  base: number;
  fee: number;
  disc: number;
  total: number;
  email?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("orders").insert({
    inv: order.inv,
    product: order.product,
    denom: order.denom,
    uid: order.uid,
    pay: order.pay,
    base: order.base,
    fee: order.fee,
    disc: order.disc,
    total: order.total,
    status: "Menunggu pembayaran",
    email: order.email ?? null,
  });
  if (error) console.warn("[supabase] saveOrder:", error.message);
}

export async function findOrderByInv(inv: string): Promise<Order | null> {
  const { data, error } = await supabase.rpc("get_order_by_inv", { p_inv: inv });
  if (error) {
    console.warn("[supabase] findOrderByInv:", error.message);
    return null;
  }
  return data && data.length > 0 ? toLocalOrder(data[0]) : null;
}

export async function findOrdersByEmail(email: string, limit = 4): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[supabase] findOrdersByEmail:", error.message);
    return [];
  }
  return (data || []).map(toLocalOrder);
}

export async function updateOrderStatus(inv: string, status: string): Promise<void> {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .ilike("inv", inv);
  if (error) console.warn("[supabase] updateOrderStatus:", error.message);
}
