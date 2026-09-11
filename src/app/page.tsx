"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, type Product } from "@/lib/data";
import { fetchProducts } from "@/lib/catalog";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState("pop");
  const [searchQuery, setSearchQuery] = useState("");
  const [shownCount, setShownCount] = useState(10);
  const [products, setProducts] = useState<Product[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts().then(setProducts);
  }, []);

  const toggleFilter = useCallback((filter: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filter)) {
        next.delete(filter);
      } else {
        next.add(filter);
      }
      return next;
    });
    setShownCount(10);
  }, []);

  const handleSearch = useCallback(() => {
    setSearchQuery(searchRef.current?.value?.trim().toLowerCase() || "");
    setShownCount(10);
  }, []);

  useEffect(() => {
    const el = searchRef.current;
    if (!el) return;
    const handler = () => handleSearch();
    el.addEventListener("input", handler);
    return () => el.removeEventListener("input", handler);
  }, [handleSearch]);

  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === "Semua" ||
      p.category === activeCategory ||
      (activeCategory === "Top Up Cepat" && p.tags.includes("instant"));
    const matchSearch =
      !searchQuery || p.name.toLowerCase().includes(searchQuery);
    const matchFilters = [...activeFilters].every((f) => p.tags.includes(f));
    return matchCategory && matchSearch && matchFilters;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "low") return a.price - b.price;
    if (sortBy === "high") return b.price - a.price;
    if (sortBy === "az") return a.name.localeCompare(b.name);
    return a.rank - b.rank;
  });

  const pageProducts = sortedProducts.slice(0, shownCount);
  const hasMore = shownCount < sortedProducts.length;

  return (
    <AppLayout searchRef={searchRef} onSearch={handleSearch}>
      <main className="px-4 sm:px-6 pb-16">
          {/* HERO */}
          <section className="hero mt-5 rounded-[20px] overflow-hidden relative bg-[#111318] shadow-[0_18px_44px_rgba(17,17,17,.18)]">
            <div className="hero-glow"></div>
            <div className="hero-grid"></div>
            <div className="hero-covers hidden md:flex">
              <img src="/images/0a25e0d6-52f1-4fc9-8ba1-c3df7ae7ce17.png" alt="" />
              <img src="/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png" alt="" />
              <img src="/images/a09b3b68-8024-4722-9d31-c44ffd9ee7af.png" alt="" />
            </div>
            <div className="relative px-5 sm:px-12 py-6 sm:py-14 max-w-[640px]">
              <div className="hero-covers-m flex md:hidden">
                <img src="/images/0a25e0d6-52f1-4fc9-8ba1-c3df7ae7ce17.png" alt="" />
                <img src="/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png" alt="" />
                <img src="/images/a09b3b68-8024-4722-9d31-c44ffd9ee7af.png" alt="" />
              </div>
              <h2 className="display text-white text-[26px] sm:text-[46px] leading-[1.08] sm:leading-[1.03] font-bold mt-1">
                Top Up Lebih Hemat,
                <br />
                <span className="text-[#ff385c]">Masuk 3 Detik.</span>
              </h2>
              <p className="text-white/65 text-[13px] sm:text-base mt-2.5 sm:mt-4 max-w-[430px] leading-relaxed">
                Diamond, UC, dan voucher game 100% resmi. Buka 24 jam, harga termurah se-Indonesia, garansi saldo masuk.
              </p>
              <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-4 sm:mt-7">
                <a
                  href="#grid"
                  className="inline-flex items-center gap-2 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-[13px] sm:text-sm font-semibold rounded-full px-5 sm:px-6 py-2.5 sm:py-3 shadow-[0_10px_26px_rgba(255,56,92,.35)]"
                >
                  Top Up Sekarang
                  <svg className="ico" viewBox="0 0 24 24">
                    <path d="M5 12h14M13 6l6 6-6 6"></path>
                  </svg>
                </a>
                <a
                  href="#grid"
                  className="border-2 border-white/20 text-white text-[13px] sm:text-sm font-semibold rounded-full px-5 sm:px-6 py-2.5 sm:py-3 hover:bg-white/10 transition"
                >
                  Lihat Katalog
                </a>
              </div>
              <div className="hidden sm:flex flex-wrap gap-x-7 gap-y-2 mt-8 text-white/60 text-[13px]">
                <span className="inline-flex items-center gap-2">
                  <svg className="ico text-[#ff385c]" viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  Proses otomatis 24 jam
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg className="ico text-[#ff385c]" viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  1.2 juta transaksi sukses
                </span>
                <span className="inline-flex items-center gap-2">
                  <svg className="ico text-[#ff385c]" viewBox="0 0 24 24">
                    <path d="M20 6 9 17l-5-5"></path>
                  </svg>
                  QRIS, E-Wallet &amp; VA
                </span>
              </div>
            </div>
          </section>

          {/* TRUST STRIP */}
          <section className="scroll-x flex lg:grid lg:grid-cols-4 gap-2.5 lg:gap-3 mt-3 sm:mt-4 pt-1 pb-1 lg:pt-2 lg:pb-2 lg:!overflow-visible">
            {[
              { icon: <svg className="ico w-5 h-5" viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"></path></svg>, title: "Instan", desc: "Rata-rata 3 detik" },
              { icon: <svg className="ico w-5 h-5" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path></svg>, title: "Aman", desc: "Distributor resmi" },
              { icon: <svg className="ico w-5 h-5" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"></rect><path d="M2 10h20"></path></svg>, title: "Bayar Fleksibel", desc: "QRIS & e-wallet" },
              { icon: <svg className="ico w-5 h-5" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path></svg>, title: "CS 24 Jam", desc: "Live chat WhatsApp" },
            ].map((item) => (
              <div key={item.title} className="card p-3 lg:p-4 flex items-center gap-2.5 lg:gap-3 shrink-0 lg:shrink">
                <span className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#fff1f4] text-[#ff385c] grid place-items-center shrink-0">
                  {item.icon}
                </span>
                <span>
                  <b className="text-[13px] lg:text-sm block whitespace-nowrap">{item.title}</b>
                  <span className="text-[11px] lg:text-xs text-[#717171] whitespace-nowrap">{item.desc}</span>
                </span>
              </div>
            ))}
          </section>

          {/* CATEGORY RIBBON */}
          <div className="sticky top-16 z-20 bg-white pt-4 pb-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b-2 border-[#f2f2f2]">
            <div className="scroll-x flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className="pill shrink-0"
                  aria-pressed={activeCategory === cat}
                  onClick={() => {
                    setActiveCategory(cat);
                    setShownCount(10);
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FILTER + SORT STRIP */}
          <div className="flex items-center gap-2 mt-4 bg-[#f7f7f7] rounded-[16px] px-2.5 sm:px-4 py-2.5">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 overflow-hidden">
              <span className="hidden sm:inline text-xs font-bold text-[#717171] uppercase tracking-wider mr-1">
                Filter
              </span>
              {["promo", "instant", "popular"].map((f) => (
                <button
                  key={f}
                  className="pill chip shrink-0 px-2.5 sm:px-4 py-1.5 text-[12px] sm:text-[13px]"
                  aria-pressed={activeFilters.has(f)}
                  onClick={() => toggleFilter(f)}
                >
                  {f === "promo" ? "Promo" : f === "instant" ? "Instan" : "Terlaris"}
                </button>
              ))}
            </div>
            <div className="sortwrap flex items-center gap-2 shrink-0 relative">
              <span className="sorticon sm:hidden w-9 h-9 rounded-full border-2 border-[#eee] bg-white grid place-items-center text-[#717171]">
                <svg className="ico" viewBox="0 0 24 24">
                  <path d="M4 7h16M7 12h10M10 17h4"></path>
                </svg>
              </span>
              <select
                aria-label="Urutkan"
                className="shrink-0 text-[13px] rounded-full border-2 border-[#eee] bg-white pl-3 pr-7 py-1.5 outline-none focus:border-[#ff385c] sm:w-auto appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23717171%22 stroke-width=%222%22 stroke-linecap=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')] bg-no-repeat bg-[right_8px_center] bg-[length:14px]"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="pop">Populer</option>
                <option value="low">Termurah</option>
                <option value="high">Termahal</option>
                <option value="az">Nama A–Z</option>
              </select>
            </div>
          </div>

          {/* GRID */}
          <section
            id="grid"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 mt-5"
          >
            {pageProducts.map((p) => (
              <ProductCard key={p.name} product={p} />
            ))}
          </section>

          {sortedProducts.length === 0 && (
            <p className="text-center text-[#717171] text-sm py-16">
              Tidak ada produk yang cocok dengan pencarian kamu.
            </p>
          )}

          <div className="flex justify-center mt-8">
            {hasMore && (
              <button
                onClick={() => setShownCount((c) => c + 10)}
                className="border-2 border-[#eee] hover:border-[#ff385c] hover:text-[#ff385c] transition text-sm font-semibold rounded-full px-8 py-3"
              >
                Muat Lebih Banyak
              </button>
            )}
          </div>

          <footer className="mt-14 pt-6 border-t-2 border-[#f2f2f2] text-xs text-[#717171] flex flex-wrap gap-x-6 gap-y-2 justify-between">
            <span>© 2026 Noryxa Digital — Nexus Gaming Store</span>
            <span>Layanan 24 jam · Pembayaran QRIS, E-Wallet, VA Bank</span>
          </footer>
        </main>
    </AppLayout>
  );
}
