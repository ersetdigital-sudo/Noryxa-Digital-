import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Noryxa Digital — Top Up Game & Bayar Tagihan Instan",
  description:
    "Top up diamond, UC, dan voucher game favoritmu plus bayar tagihan PPOB. Proses otomatis 24 jam, harga termurah, dana kembali 100% jika gagal.",
  icons: {
    icon: "/images/02f95e73-2700-481c-ab2b-4f9fbd473da7.png",
    apple: "/images/02f95e73-2700-481c-ab2b-4f9fbd473da7.png",
  },
  openGraph: {
    type: "website",
    siteName: "Noryxa Digital",
    locale: "id_ID",
    title: "Noryxa Digital — Top Up Game & Bayar Tagihan Instan",
    description:
      "Top up diamond, UC, dan voucher game favoritmu plus bayar tagihan PPOB. Proses otomatis 24 jam, harga termurah, dana kembali 100% jika gagal.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Noryxa Digital — Top Up Game & Bayar Tagihan Instan",
    description:
      "Top up diamond, UC, dan voucher game favoritmu plus bayar tagihan PPOB. Proses otomatis 24 jam, harga termurah, dana kembali 100% jika gagal.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
