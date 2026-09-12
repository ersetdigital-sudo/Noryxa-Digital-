"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/product": "Detail Produk",
  "/track": "Cek Transaksi",
  "/payment": "Pembayaran",
  "/dashboard": "My Dashboard",
  "/login": "Masuk / Daftar",
};

interface AppLayoutProps {
  children: React.ReactNode;
  searchRef?: React.RefObject<HTMLInputElement | null>;
  onSearch?: () => void;
}

export default function AppLayout({ children, searchRef, onSearch }: AppLayoutProps) {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "";
  const showHeader = pathname !== "/login";

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 min-w-0">
        {showHeader && <Header title={title} showSearch={pathname === "/"} showBack={pathname !== "/"} backHref="/" searchRef={searchRef} onSearch={onSearch} />}
        {children}
      </div>
    </div>
  );
}
