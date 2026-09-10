"use client";

import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/data";

export interface Denom {
  id: string;
  product_name: string;
  label: string;
  price: number;
  rank: number;
}

export interface Pay {
  id: string;
  label: string;
  kind: string;
  fee: number;
  rank: number;
}

export interface Promo {
  id: string;
  code: string;
  disc_pct: number;
  active: boolean;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("active", true)
    .order("rank", { ascending: true });
  if (error) {
    console.warn("[supabase] fetchProducts:", error.message);
    return [];
  }
  return (data || []).map((r) => ({
    name: r.name,
    category: r.category,
    price: r.price,
    img: r.img,
    rank: r.rank,
    tags: r.tags || [],
  }));
}

export async function fetchDenoms(productName: string): Promise<Denom[]> {
  const { data, error } = await supabase
    .from("denoms")
    .select("*")
    .eq("product_name", productName)
    .order("rank", { ascending: true });
  if (error) {
    console.warn("[supabase] fetchDenoms:", error.message);
    return [];
  }
  return data || [];
}

export async function fetchPays(): Promise<Pay[]> {
  const { data, error } = await supabase
    .from("pays")
    .select("*")
    .order("rank", { ascending: true });
  if (error) {
    console.warn("[supabase] fetchPays:", error.message);
    return [];
  }
  return data || [];
}

export async function checkPromo(code: string): Promise<number> {
  const { data, error } = await supabase
    .from("promos")
    .select("disc_pct")
    .eq("code", code.trim().toUpperCase())
    .eq("active", true)
    .limit(1);
  if (error || !data || data.length === 0) return 0;
  return Number(data[0].disc_pct) / 100;
}
