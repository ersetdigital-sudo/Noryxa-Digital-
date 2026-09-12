"use client";

import { useState, useEffect } from "react";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { rupiah, type Product } from "@/lib/data";
import { fetchDenoms, fetchPays, fetchProducts, checkPromo, type Denom, type Pay } from "@/lib/catalog";

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
        {/* HERO IMAGE */}
        <section className="relative">
          <div className="aspect-[16/10] w-full overflow-hidden bg-[#111318]">
            <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent pointer-events-none z-10" />
            {product?.img && (
              <img
                src={product.img}
                alt={gameName}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff385c] w-[18px]" />
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

        {/* TITLE + RATING */}
        <section className="px-4 pt-4">
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

        {/* STEP 1: USER ID */}
        <section className="px-4 mt-5">
          <div className="bg-white rounded-2xl border border-[#eee] p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-md bg-[#222] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">1</span>
              <h3 className="font-extrabold text-[#222] text-sm">Masukkan {idLabel}</h3>
            </div>
            {needsZone ? (
              <div className="grid grid-cols-[1fr_100px] gap-2">
                <input
                  type="text"
                  inputMode={isUsername ? "text" : "numeric"}
                  placeholder={isUsername ? "username_roblox" : "123456789"}
                  className="w-full border border-[#eee] rounded-xl px-3 py-3 text-sm"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Zone"
                  className="w-full border border-[#eee] rounded-xl px-3 py-3 text-sm"
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                />
              </div>
            ) : (
              <input
                type="text"
                inputMode={isUsername ? "text" : "numeric"}
                placeholder={isUsername ? "username_roblox" : "Masukkan ID Anda"}
                className="w-full border border-[#eee] rounded-xl px-3 py-3 text-sm"
                value={uid}
                onChange={(e) => setUid(e.target.value)}
              />
            )}
            <p className="text-[11px] text-[#717171] mt-2 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 shrink-0 text-[#bbb]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
              {isUsername
                ? "Buka Roblox → tap profil → salin Username."
                : needsZone
                ? "Buka game → tap avatar → menu Profil. ID seperti 123456789 (1234)."
                : "Buka game → tap avatar/profil → salin ID."}
            </p>
            {nickname && (
              <p className="text-xs mt-2 text-[#0a7d43] font-semibold">{nickname}</p>
            )}
          </div>
        </section>

        {/* STEP 2: DENOMINATION */}
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-[#eee] overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4">
              <span className="w-6 h-6 rounded-md bg-[#222] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">2</span>
              <h3 className="font-extrabold text-[#222] text-sm">Pilih Nominal</h3>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              {denoms.length === 0 ? (
                <p className="col-span-3 text-sm text-[#717171] p-3">Belum ada nominal tersedia.</p>
              ) : (
                denoms.map((dm, i) => (
                  <button
                    key={dm.id}
                    className={`rounded-xl p-3 text-left transition border ${selectedDenom === i ? "border-[#ff385c] bg-[#fff7f7]" : "border-[#eee] bg-white"}`}
                    onClick={() => setSelectedDenom(i)}
                  >
                    <p className="text-[11px] font-bold text-[#222] leading-tight">{dm.label}</p>
                    <p className="text-[10px] text-[#717171] mt-0.5">{rupiah(dm.price)}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </section>

        {/* STEP 3: PAYMENT */}
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-[#eee] overflow-hidden">
            <div className="flex items-center gap-2 px-4 pt-4">
              <span className="w-6 h-6 rounded-md bg-[#222] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0">3</span>
              <h3 className="font-extrabold text-[#222] text-sm">Metode Pembayaran</h3>
            </div>
            <div className="p-3 space-y-2">
              {pays.length === 0 ? (
                <p className="text-sm text-[#717171] p-3">Belum ada metode pembayaran tersedia.</p>
              ) : (
                pays.map((p, i) => (
                  <button
                    key={p.id}
                    className={`w-full rounded-xl p-3 flex items-center gap-3 text-left transition border ${selectedPay === i ? "border-[#ff385c] bg-[#fff7f7]" : "border-[#eee] bg-white"}`}
                    onClick={() => setSelectedPay(i)}
                  >
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
          </div>
        </section>

        {/* PROMO CODE */}
        <section className="px-4 mt-4">
          <div className="bg-white rounded-2xl border border-[#eee] p-4">
            <p className="text-xs font-extrabold text-[#222] mb-2">Kode Promo (opsional)</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="NORYXA10"
                className="flex-1 border border-[#eee] rounded-xl px-3 py-2.5 text-sm"
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
              />
              <button
                onClick={handlePromo}
                className="shrink-0 text-sm font-bold border-2 border-[#eee] rounded-xl px-4 hover:border-[#ff385c] hover:text-[#ff385c] transition"
              >
                Pakai
              </button>
            </div>
            {promoMsg && <p className={promoMsgClass}>{promoMsg}</p>}
          </div>
        </section>

        {/* DESCRIPTION */}
        <section className="px-4 mt-4 mb-6">
          <div className="bg-white rounded-2xl border border-[#eee] p-4">
            <p className="text-xs font-extrabold text-[#222] mb-2">Deskripsi</p>
            <p className="text-[13px] text-[#555] leading-relaxed">
              Top up {gameName} langsung ke {idLabel} tanpa login akun.
              Transaksi diproses otomatis 24 jam, rata-rata masuk dalam 3 detik setelah
              pembayaran terkonfirmasi. Jika saldo tidak masuk, dana dikembalikan 100%.
            </p>
          </div>
        </section>

        {/* DESKTOP SUMMARY (hidden on mobile) */}
        <div className="hidden lg:block px-4 sm:px-6">
          <div className="card p-5 lg:sticky lg:top-20 max-w-[480px] mx-auto">
            <h3 className="display text-base font-bold mb-4">Ringkasan Pesanan</h3>
            <dl className="text-sm flex flex-col gap-2.5">
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Produk</dt>
                <dd className="font-semibold text-right">{gameName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Nominal</dt>
                <dd className="font-semibold text-right">{denom ? denom.label : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">{idLabel}</dt>
                <dd className="font-semibold text-right">
                  {uid ? uid + (needsZone && zone ? " (" + zone + ")" : "") : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Pembayaran</dt>
                <dd className="font-semibold text-right">{pay ? pay.label : "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Biaya layanan</dt>
                <dd className="font-semibold text-right">{rupiah(fee)}</dd>
              </div>
              {d > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Diskon</dt>
                  <dd className="font-semibold text-right text-[#0a7d43]">-{rupiah(d)}</dd>
                </div>
              )}
            </dl>
            <div className="border-t-2 border-[#f2f2f2] mt-4 pt-4 flex items-end justify-between">
              <span className="text-xs text-[#717171]">Total bayar</span>
              <span className="display text-2xl font-bold text-[#ff385c]">{rupiah(total)}</span>
            </div>
            <button
              onClick={checkout}
              disabled={!ready}
              className="w-full mt-4 bg-[#ff385c] hover:bg-[#e12b4d] disabled:bg-[#e5e5e5] disabled:text-[#a5a5a5] disabled:shadow-none transition text-white text-sm font-semibold rounded-full py-3.5 shadow-[0_10px_26px_rgba(255,56,92,.3)]"
            >
              Beli Sekarang
            </button>
            <p className="text-[11px] text-[#717171] text-center mt-2.5">
              {ready
                ? "Pesanan siap diproses otomatis 24 jam."
                : `Lengkapi ${idLabel}${needsZone ? " + Zone ID" : ""}, nominal, dan metode bayar.`}
            </p>
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
          <button
            onClick={checkout}
            disabled={!ready}
            className="shrink-0 bg-[#ff385c] disabled:bg-[#e5e5e5] disabled:text-[#a5a5a5] text-white font-extrabold px-7 py-3.5 rounded-full transition shadow-[0_8px_20px_rgba(255,56,92,0.3)]"
          >
            Beli Sekarang
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
