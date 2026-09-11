export type ProductTag = "promo" | "instant" | "popular" | string;

export interface Product {
  name: string;
  category: string;
  price: number;
  img: string;
  rank: number;
  tags: ProductTag[];
}

export const CATEGORIES = [
  "Semua",
  "Mobile Games",
  "Top Up Cepat",
];

export function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}
