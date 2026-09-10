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
  { name: "Mobile Legends: Bang Bang", category: "Mobile Games", price: 3500, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 1, tags: ["promo", "instant", "popular"] },
  { name: "Free Fire", category: "Mobile Games", price: 2900, img: "/images/a09b3b68-8024-4722-9d31-c44ffd9ee7af.png", rank: 2, tags: ["instant", "popular"] },
  { name: "PUBG Mobile", category: "Mobile Games", price: 5200, img: "/images/641926b3-2c8e-4806-9ac3-26c81d206731.png", rank: 3, tags: ["popular", "instant"] },
  { name: "Call of Duty Mobile", category: "Mobile Games", price: 6500, img: "/images/0a25e0d6-52f1-4fc9-8ba1-c3df7ae7ce17.png", rank: 4, tags: ["promo", "instant"] },
  { name: "Genshin Impact", category: "Mobile Games", price: 16000, img: "/images/bccf6356-a213-4b5f-ac73-02e53953ad2f.png", rank: 5, tags: ["promo"] },
  { name: "Valorant Points", category: "PC Games", price: 13500, img: "/images/6b333e93-ae86-41f8-b215-7742e330684a.png", rank: 6, tags: ["popular"] },
  { name: "Honkai: Star Rail", category: "Mobile Games", price: 16000, img: "/images/bccf6356-a213-4b5f-ac73-02e53953ad2f.png", rank: 7, tags: ["promo"] },
  { name: "Honor of Kings", category: "Mobile Games", price: 4100, img: "/images/6b333e93-ae86-41f8-b215-7742e330684a.png", rank: 8, tags: ["instant"] },
  { name: "Steam Wallet IDR", category: "Voucher", price: 12000, img: "/images/250230ff-4118-4372-b0c9-692d13258691.png", rank: 9, tags: ["popular"] },
  { name: "Roblox Robux", category: "PC Games", price: 11000, img: "/images/a09b3b68-8024-4722-9d31-c44ffd9ee7af.png", rank: 10, tags: ["instant"] },
  { name: "Google Play Voucher", category: "Voucher", price: 20000, img: "/images/250230ff-4118-4372-b0c9-692d13258691.png", rank: 11, tags: ["instant"] },
  { name: "Netflix Gift Card", category: "Entertainment", price: 25000, img: "/images/250230ff-4118-4372-b0c9-692d13258691.png", rank: 12, tags: ["popular"] },
  { name: "Spotify Premium", category: "Entertainment", price: 27000, img: "/images/250230ff-4118-4372-b0c9-692d13258691.png", rank: 13, tags: ["promo"] },
  { name: "Token PLN", category: "PPOB", price: 20000, img: "/images/82b83ed3-ad42-4189-b26a-32519969181d.png", rank: 14, tags: ["instant", "popular"] },
  { name: "Pulsa & Paket Data", category: "PPOB", price: 5000, img: "/images/82b83ed3-ad42-4189-b26a-32519969181d.png", rank: 15, tags: ["instant"] },
  { name: "Arena of Valor", category: "Mobile Games", price: 3900, img: "/images/6b333e93-ae86-41f8-b215-7742e330684a.png", rank: 16, tags: ["instant"] },
  { name: "Point Blank", category: "PC Games", price: 9500, img: "/images/a09b3b68-8024-4722-9d31-c44ffd9ee7af.png", rank: 17, tags: [] },
  { name: "Undawn", category: "Mobile Games", price: 8100, img: "/images/641926b3-2c8e-4806-9ac3-26c81d206731.png", rank: 18, tags: [] },
  { name: "Ragnarok M", category: "Mobile Games", price: 4800, img: "/images/bccf6356-a213-4b5f-ac73-02e53953ad2f.png", rank: 19, tags: ["promo"] },
  { name: "BPJS Kesehatan", category: "PPOB", price: 2500, img: "/images/82b83ed3-ad42-4189-b26a-32519969181d.png", rank: 20, tags: [] },
];

export const CATEGORIES = [
  "Semua",
  "Mobile Games",
  "PC Games",
  "Voucher",
  "PPOB",
  "Entertainment",
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
