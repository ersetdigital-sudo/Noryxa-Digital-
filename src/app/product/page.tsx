"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { DENOMS, PAYS, rupiah } from "@/lib/data";

export default function ProductPage() {
  const router = useRouter();
  const [selectedDenom, setSelectedDenom] = useState<number | null>(null);
  const [selectedPay, setSelectedPay] = useState<number | null>(null);
  const [uid, setUid] = useState("");
  const [zone, setZone] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState("");
  const [promoMsgClass, setPromoMsgClass] = useState("text-xs mt-1.5 text-[#717171]");
  const [disc, setDisc] = useState(0);

  const denom = selectedDenom !== null ? DENOMS[selectedDenom] : null;
  const pay = selectedPay !== null ? PAYS[selectedPay] : null;

  const fee = pay ? pay[2] : 0;
  const base = denom ? denom[1] : 0;
  const d = Math.round(base * disc);
  const total = base ? base + fee - d : 0;
  const ready = !!(denom && pay && uid.length >= 6);

  const nickname = uid.length >= 6 ? "Akun ditemukan: Player" + uid.slice(-4) : null;

  const handlePromo = () => {
    const v = promo.trim().toUpperCase();
    if (v === "NORYXA10") {
      setDisc(0.1);
      setPromoMsg("Kode berhasil dipakai — diskon 10%.");
      setPromoMsgClass("text-xs mt-1.5 text-[#0a7d43] font-semibold");
    } else {
      setDisc(0);
      setPromoMsg(v ? "Kode promo tidak ditemukan." : "Masukkan kode promo dulu.");
      setPromoMsgClass("text-xs mt-1.5 text-[#ff385c]");
    }
  };

  const checkout = () => {
    if (!denom || !pay) return;
    const order = {
      product: "Mobile Legends",
      denom: denom[0],
      uid: uid + (zone ? " (" + zone + ")" : ""),
      pay: pay[0],
      base: denom[1],
      fee: pay[2],
      disc: Math.round(denom[1] * disc),
    };
    try {
      sessionStorage.setItem("noryxaOrder", JSON.stringify(order));
    } catch {}
    router.push("/payment");
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header
          title="Mobile Legends: Bang Bang"
          showSearch={false}
          showBack={true}
          backHref="/"
          backLabel="Katalog"
        />

        <main className="px-4 sm:px-6 pb-28 lg:pb-16">
          {/* PRODUCT HEAD */}
          <section className="mt-5 rounded-[20px] overflow-hidden relative bg-[#111318]">
            <div className="hero-glow"></div>
            <div className="relative flex items-center gap-4 sm:gap-5 p-5 sm:p-7">
              <img
                src="/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png"
                alt="Mobile Legends"
                className="w-[86px] h-[86px] sm:w-[112px] sm:h-[112px] rounded-2xl object-cover border border-white/15 shadow-[0_14px_34px_rgba(0,0,0,.5)]"
              />
              <div className="min-w-0">
                <h2 className="display text-white text-xl sm:text-3xl font-bold leading-tight">
                  Mobile Legends: Bang Bang
                </h2>
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  Moonton · Top up diamond resmi
                </p>
                <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
                  <span className="bg-white/10 text-white rounded-full px-2.5 py-1">
                    ⭐ 4.9 / 12.480 ulasan
                  </span>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {DENOMS.map((d, i) => (
                    <button
                      key={d[0]}
                      className="opt text-left border-2 border-[#eee] rounded-[16px] p-3 bg-white"
                      aria-pressed={selectedDenom === i}
                      onClick={() => setSelectedDenom(i)}
                    >
                      <span className="block text-[13px] font-semibold leading-tight">{d[0]}</span>
                      <span className="opt-price block text-[13px] font-bold text-[#111] mt-1">
                        {rupiah(d[1])}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* STEP 3 */}
              <section className="card p-5">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="step-no">3</span>
                  <h3 className="display text-base font-bold">Metode Pembayaran</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PAYS.map((p, i) => (
                    <button
                      key={p[0]}
                      className="opt text-left border-2 border-[#eee] rounded-[16px] p-3 bg-white"
                      aria-pressed={selectedPay === i}
                      onClick={() => setSelectedPay(i)}
                    >
                      <span className="block text-[13px] font-semibold leading-tight">{p[0]}</span>
                      <span className="block text-[11px] text-[#717171] mt-1">
                        {p[1]}{p[2] ? " · +" + rupiah(p[2]) : " · gratis"}
                      </span>
                    </button>
                  ))}
                </div>
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
                  Top up Diamond Mobile Legends: Bang Bang langsung ke User ID tanpa login akun.
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
                  <dd className="font-semibold text-right">Mobile Legends</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Nominal</dt>
                  <dd className="font-semibold text-right">{denom ? denom[0] : "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">User ID</dt>
                  <dd className="font-semibold text-right">
                    {uid ? uid + (zone ? " (" + zone + ")" : "") : "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Pembayaran</dt>
                  <dd className="font-semibold text-right">{pay ? pay[0] : "—"}</dd>
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
      </div>

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
    </div>
  );
}
