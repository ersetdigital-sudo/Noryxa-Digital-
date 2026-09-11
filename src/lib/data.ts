export type ProductTag = "promo" | "instant" | "popular" | string;

export interface Product {
  name: string;
  category: string;
  price: number;
  img: string;
  rank: number;
  tags: ProductTag[];
}

export const PRODUCTS: Product[] = [
  { name: "Mobile Legends: Bang Bang", category: "Mobile Games", price: 3500, img: "https://img.lootbar.com/file/68a708c81db899dc74a8b2e2NUvhsc5103?fop=imageView/2/w/200/h/200/q/80", rank: 1, tags: ["promo", "instant", "popular"] },
  { name: "Free Fire", category: "Mobile Games", price: 2900, img: "https://img.lootbar.com/file/6a3e1af081e1baf5f45baa5eqShc5Vco03?fop=imageView/2/w/200/h/200/q/80", rank: 2, tags: ["instant", "popular"] },
  { name: "PUBG Mobile", category: "Mobile Games", price: 5200, img: "https://img.lootbar.com/file/68a7091567ccf0d6e888b4b83H7ls1QJ03?fop=imageView/2/w/200/h/200/q/80", rank: 3, tags: ["popular", "instant"] },
  { name: "Honor of Kings", category: "Mobile Games", price: 4100, img: "https://img.lootbar.com/file/66753e0b027d7e7a76622203iLFXBIgV03?fop=imageView/2/w/200/h/200/q/80", rank: 4, tags: ["instant"] },
  { name: "Roblox Robux", category: "Mobile Games", price: 11000, img: "https://img.lootbar.com/file/69dda42d9630195bcb523af1zpgEzZLe03?fop=imageView/2/w/200/h/200/q/80", rank: 5, tags: ["instant"] },
  { name: "Magic Chess: Go Go", category: "Mobile Games", price: 1900, img: "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789114696/noryxa/tog2ses6ra4kijgspgdv.jpg", rank: 6, tags: ["instant"] },
];

export const CATEGORIES = [
  "Semua",
  "Mobile Games",
  "Top Up Cepat",
];

export const DENOMS = [
  ["5 Diamonds", 1500],
  ["12 Diamonds", 3500],
  ["28 Diamonds", 7900],
  ["44 Diamonds", 12500],
  ["86 Diamonds", 23900],
  ["172 Diamonds", 47500],
  ["257 Diamonds", 70500],
  ["706 Diamonds", 189000],
  ["Weekly Diamond Pass", 27500],
] as const;

export const PAYS = [
  ["QRIS", "Semua e-wallet", 1000],
  ["DANA", "E-wallet", 0],
  ["GoPay", "E-wallet", 0],
  ["OVO", "E-wallet", 0],
  ["ShopeePay", "E-wallet", 0],
  ["BCA Virtual Account", "Transfer bank", 4000],
] as const;

export function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}
