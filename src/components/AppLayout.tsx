"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/": "Gaming Store Catalog",
  "/product": "Detail Produk",
  "/track": "Cek Transaksi",
  "/payment": "Pembayaran",
  "/dashboard": "My Dashboard",
  "/login": "Masuk / Daftar",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] || "Noryxa Digital";
  const showHeader = pathname !== "/login";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        {showHeader && <Header title={title} showSearch={pathname === "/"} showBack={pathname !== "/"} backHref="/" />}
        {children}
      </div>
    </div>
  );
}
