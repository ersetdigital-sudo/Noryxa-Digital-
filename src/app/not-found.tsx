import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const POPULAR = [
  { href: "/", label: "Top Up Games", icon: <><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"></path></> },
  { href: "/track", label: "Cek Transaksi", icon: <><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></> },
  { href: "/", label: "Voucher", icon: <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"></path><path d="M14 6v12"></path></> },
  { href: "/track", label: "Lacak Invoice", icon: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path></> },
  { href: "/", label: "PPOB", icon: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path><path d="M9 7h6M9 11h6M9 15h4"></path></> },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header title="404 — Halaman Tidak Ditemukan" showSearch={false} showBack={true} backHref="/" backLabel="Beranda" />

        <main className="flex-1 w-full max-w-xl mx-auto px-4 sm:px-6 py-14 pb-16 text-center">
          <div className="w-20 h-20 rounded-full bg-[#fff1f4] border-2 border-[#ffd6de] grid place-items-center mx-auto mb-6">
            <svg className="ico w-9 h-9 text-[#ff385c]" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M8.5 9a3.5 3.5 0 0 1 7 0c0 3.5-3.5 3-3.5 5.5M12 18h.01" stroke-linecap="round"></path>
            </svg>
          </div>

          <h1 className="display text-6xl font-black tracking-tight mb-2">
            4<span className="text-[#ff385c]">0</span>4
          </h1>
          <h2 className="display text-xl font-bold mb-3">Halaman Tidak Ditemukan</h2>
          <p className="text-sm text-[#717171] max-w-sm mx-auto mb-8 leading-relaxed">
            Halaman yang kamu cari tidak ada atau sudah dipindahkan. Yuk balik ke jalur yang benar.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link
              href="/"
              className="bg-[#ff385c] hover:bg-[#e12b4d] transition text-white font-semibold py-3 px-6 rounded-full shadow-[0_10px_26px_rgba(255,56,92,.3)] text-sm flex items-center justify-center gap-2"
            >
              <svg className="ico w-4 h-4" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V21h-6v-6h-6v6H3V10.5Z"></path></svg>
              Kembali ke Beranda
            </Link>
            <Link
              href="/track"
              className="border-2 border-[#eee] bg-white hover:bg-[#f7f7f7] text-[#717171] font-semibold py-3 px-6 rounded-full transition text-sm flex items-center justify-center gap-2"
            >
              <svg className="ico w-4 h-4" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              Cek Transaksi
            </Link>
          </div>

          <p className="text-xs font-semibold text-[#9a9a9a] uppercase tracking-wider mb-3">Halaman Populer</p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR.map((p) => (
              <Link
                key={p.label}
                href={p.href}
                className="bg-white border-2 border-[#eee] rounded-full px-4 py-1.5 text-xs font-semibold text-[#717171] hover:border-[#111318] hover:text-[#ff385c] transition inline-flex items-center gap-1.5"
              >
                <svg className="ico w-3.5 h-3.5 text-[#ff385c]" viewBox="0 0 24 24">{p.icon}</svg>
                {p.label}
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
