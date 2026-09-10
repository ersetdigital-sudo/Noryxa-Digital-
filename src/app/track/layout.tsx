import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lacak Pesanan — Noryxa Digital",
  description:
    "Cek status pesanan top up kamu pakai nomor invoice. Lihat detail transaksi dan riwayat statusnya secara real-time.",
};

export default function TrackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
