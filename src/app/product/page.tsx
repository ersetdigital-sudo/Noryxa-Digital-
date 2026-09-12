"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { rupiah, type Product } from "@/lib/data";
import { fetchDenoms, fetchPays, fetchProducts, checkPromo, type Denom, type Pay } from "@/lib/catalog";

const HERO_IMAGES: Record<string, string> = {
  "Mobile Legends: Bang Bang": "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789177908/hhjuudelwtasw4ffkw0n.jpg",
  "Free Fire": "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789177987/p8w1wa05kqz0ykvtbmvy.jpg",
  "PUBG Mobile": "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789178318/cx0fedlibrajippie7uz.jpg",
  "Honor of Kings": "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789178391/tdtryaddoumqccrluqag.png",
  "Magic Chess": "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789178449/siazsguakmkktit7tjap.jpg",
};

export default function ProductPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f7f7] grid place-items-center text-sm text-[#717171]">Memuat...</div>}>
      <ProductContent />
    </Suspense>
  );
}

function ProductContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameName = searchParams.get("game") || "";

  const [selectedDenom, setSelectedDenom] = useState<number | null>(null);
  const [selectedPay, setSelectedPay] = useState<number | null>(null);
  const [uid, setUid] = useState("");
  const [zone, setZone] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoMsgClass, setPromoMsgClass] = useState("text-xs mt-1.5 text-[#717171]");
  const [disc, setDisc] = useState(0);
  const [denoms, setDenoms] = useState<Denom[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!gameName) return;
    fetchProducts().then((all) => {
      const found = all.find((p) => p.name === gameName);
      if (found) setProduct(found);
    });
    fetchDenoms(gameName).then(setDenoms);
    fetchPays().then(setPays);
  }, [gameName]);

  useEffect(() => {
    setSelectedDenom(null);
    setSelectedPay(null);
  }, [gameName]);

  const denom = selectedDenom !== null ? denoms[selectedDenom] : null;
  const pay = selectedPay !== null ? pays[selectedPay] : null;

  const tags = product?.tags || [];
  const needsZone = tags.includes("zone");
  const isUsername = tags.includes("username");
  const idLabel = isUsername ? "Username" : "User ID";
  const heroImg = HERO_IMAGES[gameName] || product?.img || "";

  const fee = pay ? pay.fee : 0;
  const base = denom ? denom.price : 0;
  const d = Math.round(base * disc);
  const total = base ? base + fee - d : 0;
  const idValid = isUsername ? uid.length >= 3 : uid.length >= 6;
  const ready = !!(denom && pay && idValid && (!needsZone || zone.length >= 4));

  const nickname = idValid ? (isUsername ? `Akun ditemukan: ${uid}` : "Akun ditemukan: Player" + uid.slice(-4)) : null;

  const handlePromo = async () => {
    const v = promo.trim().toUpperCase();
    if (!v) {
      setDisc(0);
      setPromoMsg("Masukkan kode promo dulu.");
      setPromoMsgClass("text-xs mt-1.5 text-[#ff385c]");
      return;
    }
    const pct = await checkPromo(v);
    if (pct > 0) {
      setDisc(pct);
      setPromoMsg(`Kode berhasil dipakai — diskon ${Math.round(pct * 100)}%.`);
      setPromoMsgClass("text-xs mt-1.5 text-[#0a7d43] font-semibold");
    } else {
      setDisc(0);
      setPromoMsg("Kode promo tidak ditemukan.");
      setPromoMsgClass("text-xs mt-1.5 text-[#ff385c]");
    }
  };

  const checkout = () => {
    if (!denom || !pay || !gameName) return;
    const order = {
      product: gameName,
      denom: denom.label,
      uid: uid + (zone ? " (" + zone + ")" : ""),
      pay: pay.label,
      base: denom.price,
      fee: pay.fee,
      disc: Math.round(denom.price * disc),
    };
    try {
      sessionStorage.setItem("noryxaOrder", JSON.stringify(order));
    } catch {}
    router.push("/payment");
  };

  if (!gameName) {
    return (
      <AppLayout>
        <main className="px-4 sm:px-6 pb-28 lg:pb-16">
          <div className="card p-10 text-center mt-5">
            <p className="text-sm text-[#717171]">Game tidak ditemukan. <a href="/" className="text-[#ff385c] font-semibold hover:underline">Kembali ke beranda</a></p>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="pb-28 lg:pb-16">

        {/* ═══════════════════════════════════════════════════════════
            MOBILE: Hero + Title (hidden on lg)
           ═══════════════════════════════════════════════════════════ */}
        <section className="relative lg:hidden">
          <div className="aspect-[16/10] w-full overflow-hidden bg-[#111318]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none z-10" />
            {heroImg && (
              <img src={heroImg} alt={gameName} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            <span className="w-[18px] h-1.5 rounded-full bg-[#ff385c]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
          {tags.includes("instant") && (
            <span className="absolute top-3 left-3 text-[10px] font-extrabold bg-[#ff385c] text-white px-2.5 py-1 rounded-full shadow-md z-10">
              <svg className="inline w-3 h-3 mr-0.5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z" /></svg>
              Instan
            </span>
          )}
        </section>

        <section className="px-4 pt-4 lg:hidden">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="display text-lg font-extrabold text-[#222] leading-tight">{gameName}</h2>
              <p className="text-xs text-[#717171] mt-0.5">Top up {gameName} resmi</p>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-[#ff385c] text-xs font-bold">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                4.9
              </div>
              <p className="text-[10px] text-[#717171] mt-0.5">12.4rb terjual</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-none -mx-4 px-4">
            {tags.includes("instant") && (
              <span className="flex-shrink-0 text-[10px] font-extrabold bg-[#fff7f7] text-[#ff385c] border border-[#ff385c]/30 px-2.5 py-1 rounded-full">Proses instan</span>
            )}
            <span className="flex-shrink-0 text-[10px] font-extrabold bg-[#f7f7f7] text-[#222] px-2.5 py-1 rounded-full">Buka 24/7</span>
            <span className="flex-shrink-0 text-[10px] font-extrabold bg-[#f7f7f7] text-[#222] px-2.5 py-1 rounded-full">Garansi saldo masuk</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            DESKTOP: Breadcrumb (hidden on mobile)
           ═══════════════════════════════════════════════════════════ */}
        <div className="hidden lg:block px-6 pt-6 max-w-[1180px] mx-auto">
          <nav className="flex items-center gap-2 text-xs text-[#717171]">
            <a href="/" className="hover:text-[#ff385c] transition flex items-center gap-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
              Home
            </a>
            <svg className="w-2.5 h-2.5 text-[#ccc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <a href="/" className="hover:text-[#ff385c] transition">Top Up</a>
            <svg className="w-2.5 h-2.5 text-[#ccc]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <span className="text-[#222] font-medium">{gameName}</span>
          </nav>
        </div>

        {/* ═══════════════════════════════════════════════════════════
            MAIN CONTENT: Two-column on desktop
           ═══════════════════════════════════════════════════════════ */}
        <div className="px-4 sm:px-6 max-w-[1180px] mx-auto lg:flex lg:gap-6 lg:py-6">

          {/* ─── LEFT COLUMN: Steps ─── */}
          <div className="flex-1 flex flex-col gap-4 lg:gap-5">

            {/* STEP 1: USER ID */}
            <section className="bg-white rounded-2xl lg:rounded-[20px] border border-[#eee] lg:border lg:border-[rgba(0,0,0,0.08)] lg:shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] overflow-hidden">
              {/* Mobile header */}
              <div className="flex items-center gap-2 px-4 pt-4 lg:hidden">
                <span className="w-6 h-6 rounded-md bg-[#222] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">1</span>
                <h3 className="font-extrabold text-[#222] text-sm">Masukkan {idLabel}</h3>
              </div>
              {/* Desktop header */}
              <div className="hidden lg:flex items-center border-b border-[#ddd] px-5 py-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <svg className="w-16 h-16 text-[#222] transform rotate-12 -translate-y-2 translate-x-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3V4h18v2zm-4 6H3v-2h14v2zm-6 6H3v-2h8v2z" /></svg>
                </div>
                <span className="bg-[#222] text-white w-7 h-7 rounded-[8px] flex items-center justify-center font-bold mr-3 z-10 shrink-0">1</span>
                <h2 className="text-[#222] font-bold tracking-wide z-10 text-sm uppercase">Masukkan {idLabel}</h2>
              </div>
              <div className="p-4 lg:p-5 md:p-6">
                <div className="w-full md:w-1/2">
                  {needsZone ? (
                    <div className="grid grid-cols-[1fr_100px] gap-2">
                      <input type="text" inputMode={isUsername ? "text" : "numeric"} placeholder={isUsername ? "username_roblox" : "123456789"} className="w-full border border-[#eee] lg:border-[#ddd] rounded-xl lg:rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#222] focus:border-[#222] transition" value={uid} onChange={(e) => setUid(e.target.value)} />
                      <input type="text" inputMode="numeric" placeholder="Zone" className="w-full border border-[#eee] lg:border-[#ddd] rounded-xl lg:rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#222] focus:border-[#222] transition" value={zone} onChange={(e) => setZone(e.target.value)} />
                    </div>
                  ) : (
                    <input type="text" inputMode={isUsername ? "text" : "numeric"} placeholder={isUsername ? "username_roblox" : "Masukkan ID Anda"} className="w-full border border-[#eee] lg:border-[#ddd] rounded-xl lg:rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#222] focus:border-[#222] transition" value={uid} onChange={(e) => setUid(e.target.value)} />
                  )}
                </div>
                <p className="text-[11px] text-[#717171] mt-3 flex items-center gap-1">
                  {isUsername
                    ? "Buka Roblox → tap profil → salin Username."
                    : needsZone
                    ? "Buka game → tap avatar → menu Profil. ID seperti 123456789 (1234)."
                    : "Buka game → tap avatar/profil → salin ID."}
                </p>
                {nickname && <p className="text-xs mt-2 text-[#0a7d43] font-semibold">{nickname}</p>}
              </div>
            </section>

            {/* STEP 2: DENOMINATION */}
            <section className="bg-white rounded-2xl lg:rounded-[20px] border border-[#eee] lg:border lg:border-[rgba(0,0,0,0.08)] lg:shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] overflow-hidden">
              {/* Mobile header */}
              <div className="flex items-center gap-2 px-4 pt-4 lg:hidden">
                <span className="w-6 h-6 rounded-md bg-[#222] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">2</span>
                <h3 className="font-extrabold text-[#222] text-sm">Pilih Nominal</h3>
              </div>
              {/* Desktop header */}
              <div className="hidden lg:flex items-center border-b border-[#ddd] px-5 py-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <svg className="w-16 h-16 text-[#222] transform rotate-12 -translate-y-2 translate-x-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></svg>
                </div>
                <span className="bg-[#222] text-white w-7 h-7 rounded-[8px] flex items-center justify-center font-bold mr-3 z-10 shrink-0">2</span>
                <h2 className="text-[#222] font-bold tracking-wide z-10 text-sm uppercase">Pilih Nominal</h2>
              </div>
              <div className="p-3 lg:p-5 md:p-6 grid grid-cols-3 sm:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-4">
                {denoms.length === 0 ? (
                  <p className="col-span-3 text-sm text-[#717171] p-3">Belum ada nominal tersedia.</p>
                ) : (
                  denoms.map((dm, i) => (
                    <button
                      key={dm.id}
                      className={`rounded-xl lg:rounded-[12px] p-3 lg:p-4 text-left transition border relative overflow-hidden flex flex-col justify-between lg:h-24 ${selectedDenom === i ? "border-[#ff385c] lg:border-[#ff385c] bg-[#fff7f7] lg:bg-[#fff7ed]" : "border-[#eee] lg:border-[rgba(0,0,0,0.08)] bg-white"}`}
                      style={selectedDenom === i ? { boxShadow: "2px 2px 0px 0px #ff385c" } : undefined}
                      onClick={() => setSelectedDenom(i)}
                    >
                      <p className="text-[11px] lg:text-sm font-bold text-[#222] leading-tight">{dm.label}</p>
                      <div className="flex justify-between items-end mt-2">
                        <svg className="w-3.5 h-3.5 text-[#ddd] hidden lg:block" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z" /></svg>
                        <span className="text-[10px] lg:text-sm font-bold text-[#ff385c]">{rupiah(dm.price)}</span>
                      </div>
                      {selectedDenom === i && (
                        <svg className="w-4 h-4 text-[#222] absolute top-2 right-2 hidden lg:block" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* STEP 3: PAYMENT */}
            <section className="bg-white rounded-2xl lg:rounded-[20px] border border-[#eee] lg:border lg:border-[rgba(0,0,0,0.08)] lg:shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] overflow-hidden">
              {/* Mobile header */}
              <div className="flex items-center gap-2 px-4 pt-4 lg:hidden">
                <span className="w-6 h-6 rounded-md bg-[#222] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">3</span>
                <h3 className="font-extrabold text-[#222] text-sm">Metode Pembayaran</h3>
              </div>
              {/* Desktop header */}
              <div className="hidden lg:flex items-center border-b border-[#ddd] px-5 py-4 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10">
                  <svg className="w-16 h-16 text-[#222] transform rotate-12 -translate-y-2 translate-x-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
                </div>
                <span className="bg-[#222] text-white w-7 h-7 rounded-[8px] flex items-center justify-center font-bold mr-3 z-10 shrink-0">3</span>
                <h2 className="text-[#222] font-bold tracking-wide z-10 text-sm uppercase">Metode Pembayaran</h2>
              </div>
              {/* Mobile: stacked list */}
              <div className="p-3 space-y-2 lg:hidden">
                {pays.length === 0 ? (
                  <p className="text-sm text-[#717171] p-3">Belum ada metode pembayaran tersedia.</p>
                ) : (
                  pays.map((p, i) => (
                    <button key={p.id} className={`w-full rounded-xl p-3 flex items-center gap-3 text-left transition border ${selectedPay === i ? "border-[#ff385c] bg-[#fff7f7]" : "border-[#eee] bg-white"}`} onClick={() => setSelectedPay(i)}>
                      <div className="w-10 h-8 rounded-md bg-[#f7f7f7] flex items-center justify-center shrink-0">
                        {p.kind.toLowerCase().includes("qr") ? (
                          <svg className="w-5 h-5 text-[#ff385c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3h-3" /><path d="M14 20h3" /></svg>
                        ) : p.kind.toLowerCase().includes("wallet") || p.kind.toLowerCase().includes("ewallet") ? (
                          <svg className="w-5 h-5 text-[#717171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-[#717171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#222]">{p.label}</p>
                        <p className="text-[10px] text-[#717171]">{p.kind}{p.fee ? " · +" + rupiah(p.fee) : " · gratis"}</p>
                      </div>
                      {selectedPay === i ? (
                        <svg className="w-5 h-5 text-[#ff385c] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                      ) : (
                        <svg className="w-5 h-5 text-[#ddd] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                      )}
                    </button>
                  ))
                )}
              </div>
              {/* Desktop: accordion-style grouped list */}
              <div className="hidden lg:block p-5 md:p-6 space-y-4">
                {pays.length === 0 ? (
                  <p className="text-sm text-[#717171]">Belum ada metode pembayaran tersedia.</p>
                ) : (
                  pays.map((p, i) => (
                    <button key={p.id} className={`w-full border rounded-[12px] overflow-hidden transition ${selectedPay === i ? "border-[#222] bg-[#f7f7f7]" : "border-[#ddd] bg-white"}`} onClick={() => setSelectedPay(i)}>
                      <div className={`p-4 flex items-center gap-3 ${selectedPay === i ? "bg-[#f7f7f7]" : ""}`}>
                        <div className="w-10 h-8 rounded-md bg-white border border-[#eee] flex items-center justify-center shrink-0">
                          {p.kind.toLowerCase().includes("qr") ? (
                            <svg className="w-5 h-5 text-[#ff385c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><path d="M14 14h3v3h-3z" /><path d="M20 14v3h-3" /><path d="M14 20h3" /></svg>
                          ) : p.kind.toLowerCase().includes("wallet") || p.kind.toLowerCase().includes("ewallet") ? (
                            <svg className="w-5 h-5 text-[#717171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
                          ) : (
                            <svg className="w-5 h-5 text-[#717171]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></svg>
                          )}
                        </div>
                        <span className="font-bold text-[#222] text-sm flex-1 text-left">{p.label}</span>
                        <span className="text-xs text-[#717171]">{p.kind}{p.fee ? " · +" + rupiah(p.fee) : " · gratis"}</span>
                        {selectedPay === i ? (
                          <svg className="w-5 h-5 text-[#222] shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                        ) : (
                          <svg className="w-5 h-5 text-[#ddd] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* PROMO CODE */}
            <section className="bg-white rounded-2xl lg:rounded-[20px] border border-[#eee] lg:border lg:border-[rgba(0,0,0,0.08)] lg:shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] p-4 lg:p-5">
              <p className="text-xs font-extrabold text-[#222] mb-2">Kode Promo (opsional)</p>
              <div className="flex gap-2">
                <input type="text" placeholder="NORYXA10" className="flex-1 border border-[#eee] lg:border-[#ddd] rounded-xl lg:rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#222] focus:border-[#222] transition" value={promo} onChange={(e) => setPromo(e.target.value)} />
                <button onClick={handlePromo} className="shrink-0 text-sm font-bold border-2 border-[#eee] lg:border-[#ddd] rounded-xl lg:rounded-lg px-4 hover:border-[#ff385c] hover:text-[#ff385c] transition">Pakai</button>
              </div>
              {promoMsg && <p className={promoMsgClass}>{promoMsg}</p>}
            </section>

            {/* DESCRIPTION */}
            <section className="bg-white rounded-2xl lg:rounded-[20px] border border-[#eee] lg:border lg:border-[rgba(0,0,0,0.08)] lg:shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] p-4 lg:p-5 mb-4 lg:mb-0">
              <p className="text-xs font-extrabold text-[#222] mb-2">Deskripsi</p>
              <p className="text-[13px] text-[#555] leading-relaxed">
                Top up {gameName} langsung ke {idLabel} tanpa login akun.
                Transaksi diproses otomatis 24 jam, rata-rata masuk dalam 3 detik setelah
                pembayaran terkonfirmasi. Jika saldo tidak masuk, dana dikembalikan 100%.
              </p>
            </section>
          </div>

          {/* ─── RIGHT COLUMN: Sidebar (desktop only) ─── */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 flex flex-col gap-4">
              {/* Game Info Card */}
              <div className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.08)] shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] overflow-hidden">
                {heroImg && (
                  <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${heroImg})` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3 -mt-10 relative z-10">
                    {heroImg && (
                      <img src={heroImg} alt={gameName} className="w-14 h-14 rounded-[12px] object-cover shadow-md border-2 border-white" />
                    )}
                    <div>
                      <h3 className="font-bold text-[#222] leading-tight">{gameName}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-[#717171] leading-relaxed mb-4">Top up {gameName} resmi 100%. Transaksi otomatis 24 jam, saldo masuk dalam 3 detik.</p>
                  <div className="flex items-center gap-3 border-t border-[rgba(0,0,0,0.08)] pt-4">
                    <svg className="w-7 h-7 text-[#ff385c] fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                    <div>
                      <p className="text-lg font-black text-[#222] leading-none">4.9<span className="text-sm text-[#717171] font-medium">/5.0</span></p>
                      <p className="text-[11px] text-[#717171]">12.4rb+ transaksi sukses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.08)] shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] overflow-hidden">
                <div className="bg-[#f7f7f7] px-5 py-3 border-b border-[#ddd]">
                  <h3 className="font-bold text-[#222] text-sm flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                    RINGKASAN PESANAN
                  </h3>
                </div>
                <div className="p-5 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#717171]">Produk</span><span className="font-semibold text-[#222]">{gameName}</span></div>
                  <div className="flex justify-between"><span className="text-[#717171]">Nominal</span><span className="font-semibold text-[#222]">{denom ? denom.label : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#717171]">{idLabel}</span><span className="font-semibold text-[#222]">{uid ? uid + (needsZone && zone ? " (" + zone + ")" : "") : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#717171]">Pembayaran</span><span className="font-semibold text-[#222]">{pay ? pay.label : "—"}</span></div>
                  <div className="flex justify-between"><span className="text-[#717171]">Biaya layanan</span><span className="font-semibold text-[#222]">{rupiah(fee)}</span></div>
                  {d > 0 && <div className="flex justify-between"><span className="text-[#717171]">Diskon</span><span className="font-semibold text-[#0a7d43]">-{rupiah(d)}</span></div>}
                  <div className="border-t border-dashed border-[#ddd] my-2" />
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#222]">Total</span>
                    <span className="text-lg font-black text-[#ff385c]">{rupiah(total)}</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button onClick={checkout} disabled={!ready} className="w-full bg-[#ff385c] hover:bg-[#e31c5f] disabled:bg-[#e5e5e5] disabled:text-[#a5a5a5] text-white font-bold py-4 rounded-[12px] shadow-md transition text-lg">
                    Beli Sekarang
                  </button>
                  <p className="text-[11px] text-[#717171] text-center mt-2.5">
                    {ready ? "Pesanan siap diproses otomatis 24 jam." : `Lengkapi ${idLabel}${needsZone ? " + Zone ID" : ""}, nominal, dan metode bayar.`}
                  </p>
                </div>
              </div>

              {/* Report */}
              <div className="bg-white rounded-[20px] border border-[rgba(0,0,0,0.08)] shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.08)_0px_4px_8px] p-4 text-center">
                <p className="text-sm text-[#717171]">Ada masalah? <a href="#" className="text-[#ff385c] font-semibold hover:underline">Laporkan</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE FLOATING CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 w-[min(100%-24px,430px)] mx-auto mb-3">
        <div className="bg-white rounded-[24px] p-2.5 flex items-center gap-3 shadow-[0_16px_40px_rgba(0,0,0,0.14)] border border-[#eee]">
          <div className="flex-1 pl-2 min-w-0">
            <p className="text-[10px] font-bold text-[#717171] uppercase tracking-wide leading-none">Total</p>
            <p className="text-[18px] font-black text-[#ff385c] leading-none mt-1">{rupiah(total)}</p>
          </div>
          <button onClick={checkout} disabled={!ready} className="shrink-0 bg-[#ff385c] disabled:bg-[#e5e5e5] disabled:text-[#a5a5a5] text-white font-extrabold px-7 py-3.5 rounded-full transition shadow-[0_8px_20px_rgba(255,56,92,0.3)]">
            Beli Sekarang
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
