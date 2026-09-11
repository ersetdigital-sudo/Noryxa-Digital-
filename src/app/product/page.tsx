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

  const fee = pay ? pay.fee : 0;
  const base = denom ? denom.price : 0;
  const d = Math.round(base * disc);
  const total = base ? base + fee - d : 0;
  const ready = !!(denom && pay && uid.length >= 6);

  const nickname = uid.length >= 6 ? "Akun ditemukan: Player" + uid.slice(-4) : null;

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
        <main className="px-4 sm:px-6 pb-28 lg:pb-16">
          {/* PRODUCT HEAD */}
          <section className="mt-5 rounded-[20px] overflow-hidden relative bg-[#111318]">
            <div className="hero-glow"></div>
            <div className="relative flex items-center gap-4 sm:gap-5 p-5 sm:p-7">
              {product?.img && (
                <img
                  src={product.img}
                  alt={gameName}
                  className="w-[86px] h-[86px] sm:w-[112px] sm:h-[112px] rounded-2xl object-cover border border-white/15 shadow-[0_14px_34px_rgba(0,0,0,.5)]"
                />
              )}
              <div className="min-w-0">
                <h2 className="display text-white text-xl sm:text-3xl font-bold leading-tight">
                  {gameName}
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  Top up {gameName} resmi
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                  <span className="bg-[#ff385c] text-white rounded-full px-2.5 py-1 font-semibold">
                    Proses instan
                  </span>
                </div>
              </div>
            </div>
          </section>

          <div className="grid lg:grid-cols-[1fr_340px] gap-4 mt-4 items-start">
            <div className="flex flex-col gap-4">
              {/* STEP 1 */}
              <section className="card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="step-no">1</span>
                  <h3 className="display text-base font-bold">Masukkan User ID</h3>
                </div>
                <div className="grid sm:grid-cols-[1fr_140px] gap-3">
                  <div>
                    <label className="text-xs text-[#717171] mb-1.5 block" htmlFor="uid">
                      User ID
                    </label>
                    <input
                      id="uid"
                      className="field"
                      inputMode="numeric"
                      placeholder="123456789"
                      value={uid}
                      onChange={(e) => setUid(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#717171] mb-1.5 block" htmlFor="zone">
                      Zone ID
                    </label>
                    <input
                      id="zone"
                      className="field"
                      inputMode="numeric"
                      placeholder="1234"
                      value={zone}
                      onChange={(e) => setZone(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-[#717171] mt-3 leading-relaxed">
                  Buka game → tap avatar di kiri atas → menu Profil. ID akan terlihat seperti{" "}
                  <b className="text-[#111]">123456789 (1234)</b>.
                </p>
                {nickname && (
                  <p className="text-xs mt-2 text-[#0a7d43] font-semibold">{nickname}</p>
                )}
              </section>

              {/* STEP 2 */}
              <section className="card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="step-no">2</span>
                  <h3 className="display text-base font-bold">Pilih Nominal</h3>
                </div>
                {denoms.length === 0 ? (
                  <p className="text-sm text-[#717171]">Belum ada nominal tersedia untuk game ini.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {denoms.map((d, i) => (
                      <button
                        key={d.id}
                        className="opt text-left border-2 border-[#eee] rounded-[16px] p-3 bg-white"
                        aria-pressed={selectedDenom === i}
                        onClick={() => setSelectedDenom(i)}
                      >
                        <span className="block text-[13px] font-semibold leading-tight">{d.label}</span>
                        <span className="opt-price block text-[13px] font-bold text-[#111] mt-1">
                          {rupiah(d.price)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* STEP 3 */}
              <section className="card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="step-no">3</span>
                  <h3 className="display text-base font-bold">Metode Pembayaran</h3>
                </div>
                {pays.length === 0 ? (
                  <p className="text-sm text-[#717171]">Belum ada metode pembayaran tersedia.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {pays.map((p, i) => (
                      <button
                        key={p.id}
                        className="opt text-left border-2 border-[#eee] rounded-[16px] p-3 bg-white"
                        aria-pressed={selectedPay === i}
                        onClick={() => setSelectedPay(i)}
                      >
                        <span className="block text-[13px] font-semibold leading-tight">{p.label}</span>
                        <span className="block text-[11px] text-[#717171] mt-1">
                          {p.kind}{p.fee ? " · +" + rupiah(p.fee) : " · gratis"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </section>

              {/* STEP 4 */}
              <section className="card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="step-no">4</span>
                  <h3 className="display text-base font-bold">Kontak &amp; Kode Promo</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#717171] mb-1.5 block" htmlFor="wa">
                      Nomor WhatsApp
                    </label>
                    <input id="wa" className="field" inputMode="tel" placeholder="08123456789" />
                  </div>
                  <div>
                    <label className="text-xs text-[#717171] mb-1.5 block" htmlFor="promo">
                      Kode promo (opsional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="promo"
                        className="field"
                        placeholder="NORYXA10"
                        value={promo}
                        onChange={(e) => setPromo(e.target.value)}
                      />
                      <button
                        onClick={handlePromo}
                        className="shrink-0 text-sm font-semibold border-2 border-[#eee] rounded-[14px] px-4 hover:border-[#ff385c] hover:text-[#ff385c] transition"
                      >
                        Pakai
                      </button>
                    </div>
                    {promoMsg && <p className={promoMsgClass}>{promoMsg}</p>}
                  </div>
                </div>
              </section>

              <section className="card p-5">
                <h3 className="display text-base font-bold mb-2">Deskripsi</h3>
                <p className="text-sm text-[#4a4a4a] leading-relaxed">
                  Top up {gameName} langsung ke User ID tanpa login akun.
                  Transaksi diproses otomatis 24 jam, rata-rata masuk dalam 3 detik setelah
                  pembayaran terkonfirmasi. Jika saldo tidak masuk, dana dikembalikan 100%.
                </p>
              </section>
            </div>

            {/* SUMMARY */}
            <aside className="card p-5 lg:sticky lg:top-20">
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
                  <dt className="text-[#717171]">User ID</dt>
                  <dd className="font-semibold text-right">
                    {uid ? uid + (zone ? " (" + zone + ")" : "") : "—"}
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
                  : "Lengkapi User ID, nominal, dan metode bayar."}
              </p>
            </aside>
          </div>
        </main>

      {/* MOBILE BUY BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-[#eee] px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[#717171]">Total bayar</p>
          <p className="display text-lg font-bold text-[#ff385c] leading-none">{rupiah(total)}</p>
        </div>
        <button
          onClick={checkout}
          disabled={!ready}
          className="ml-auto flex-1 max-w-[190px] bg-[#ff385c] disabled:bg-[#e5e5e5] disabled:text-[#a5a5a5] text-white text-sm font-semibold rounded-full py-3"
        >
          Beli Sekarang
        </button>
      </div>
    </AppLayout>
  );
}
