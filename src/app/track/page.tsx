"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { rupiah } from "@/lib/data";
import { findOrderByInv, type Order } from "@/lib/orders";

const WA = "6281234567890";

function getOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem("noryxaOrders") || "[]");
  } catch {
    return [];
  }
}

const GAME_IMAGES: Record<string, string> = {
  "Mobile Legends": "https://img.lootbar.com/file/68a708c81db899dc74a8b2e2NUvhsc5103?fop=imageView/2/w/200/h/200/q/80",
  "PUBG Mobile": "https://img.lootbar.com/file/68a7091567ccf0d6e888b4b83H7ls1QJ03?fop=imageView/2/w/200/h/200/q/80",
  "Free Fire": "https://img.lootbar.com/file/6a3e1af081e1baf5f45baa5eqShc5Vco03?fop=imageView/2/w/200/h/200/q/80",
  "Honor of Kings": "https://img.lootbar.com/file/66753e0b027d7e7a76622203iLFXBIgV03?fop=imageView/2/w/200/h/200/q/80",
  "Roblox": "https://img.lootbar.com/file/69dda42d9630195bcb523af1zpgEzZLe03?fop=imageView/2/w/200/h/200/q/80",
  "Magic Chess": "https://res.cloudinary.com/dqjh7utdb/image/upload/v1789114696/noryxa/tog2ses6ra4kijgspgdv.jpg",
};

function getGameImage(product: string): string {
  for (const [key, url] of Object.entries(GAME_IMAGES)) {
    if (product.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png";
}

export default function TrackPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [invoiceInput, setInvoiceInput] = useState("");
  const [error, setError] = useState("");
  const [resultOrder, setResultOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [nfWaLink, setNfWaLink] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);
  const notFoundRef = useRef<HTMLDivElement | null>(null);

  const lookup = useCallback(async (raw: string) => {
    const v = (raw || "").trim().toUpperCase();
    if (!v) {
      setError("Masukkan nomor invoice dulu ya.");
      return;
    }
    if (!/^NRX-\d{4,8}$/.test(v)) {
      setError("Format invoice tidak valid. Contoh: NRX-482913.");
      return;
    }
    setError("");

    const remote = await findOrderByInv(v);
    if (remote) {
      setResultOrder(remote);
      setNotFound(false);
      return;
    }

    const local = getOrders().find((x) => x.inv === v);
    if (local) {
      setResultOrder(local);
      setNotFound(false);
    } else {
      setResultOrder(null);
      setNotFound(true);
      setNfWaLink(
        `https://wa.me/${WA}?text=${encodeURIComponent(
          "Halo Noryxa Digital, saya mau cek pesanan dengan invoice " + v
        )}`
      );
    }
  }, []);

  useEffect(() => {
    const orders = getOrders();
    setRecentOrders(orders.slice(0, 4));

    const pre = new URLSearchParams(window.location.search).get("inv");
    if (pre) {
      setInvoiceInput(pre.toUpperCase());
      lookup(pre);
    }
  }, [lookup]);

  useEffect(() => {
    if (resultOrder && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else if (notFound && notFoundRef.current) {
      notFoundRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [resultOrder, notFound]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(invoiceInput);
  };

  const getBadgeClass = (status: string) => {
    if (status === "Sedang diverifikasi") return "badge b-check";
    if (status === "Selesai") return "badge b-done";
    return "badge b-wait";
  };

  const getBadgeText = (status: string) => {
    if (status === "Sedang diverifikasi") return "Sedang diverifikasi";
    if (status === "Selesai") return "Selesai";
    return "Menunggu pembayaran";
  };

  const resultWaLink = resultOrder
    ? `https://wa.me/${WA}?text=${encodeURIComponent(
        `Halo Noryxa Digital, saya mau tanya pesanan:\nInvoice: ${resultOrder.inv}\nProduk: ${resultOrder.product} — ${resultOrder.denom}\nUser ID: ${resultOrder.uid}\nStatus: ${resultOrder.status}`
      )}`
    : "";

  return (
    <AppLayout>
      {/* ============ MOBILE (original, untouched) ============ */}
      <main className="lg:hidden px-4 sm:px-6 py-8 pb-16">
        <div className="text-center mb-6">
          <p className="eyebrow mb-2">Cek Transaksi</p>
          <h1 className="display text-2xl sm:text-3xl font-bold">Lacak pesanan kamu</h1>
          <p className="text-sm text-[#717171] mt-2">
            Masukkan nomor invoice yang kamu terima saat checkout, contoh{" "}
            <span className="mono font-semibold text-[#111]">NRX-482913</span>.
          </p>
        </div>

        <section className="card p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              className="field mono uppercase"
              placeholder="NRX-000000"
              autoComplete="off"
              value={invoiceInput}
              onChange={(e) => setInvoiceInput(e.target.value)}
            />
            <button className="shrink-0 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-7 py-3.5 shadow-[0_10px_26px_rgba(255,56,92,.3)]">
              Lacak
            </button>
          </form>

          {recentOrders.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-[#717171] mb-2">Invoice terakhir di perangkat ini</p>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((o) => (
                  <button
                    key={o.inv}
                    className="recent mono"
                    onClick={() => { setInvoiceInput(o.inv); lookup(o.inv); }}
                  >
                    {o.inv}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && <p className="text-sm text-[#ff385c] font-semibold mt-3">{error}</p>}
        </section>

        {resultOrder && (
          <section ref={resultRef} className="card p-5 sm:p-6 mt-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs text-[#717171] mb-1">Nomor invoice</p>
                <p className="display text-xl font-bold mono">{resultOrder.inv}</p>
                <p className="text-xs text-[#717171] mt-1">
                  {new Date(resultOrder.created).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <span className={getBadgeClass(resultOrder.status)}>{getBadgeText(resultOrder.status)}</span>
            </div>
            <dl className="text-sm grid sm:grid-cols-2 gap-x-6 gap-y-2.5 border-t-2 border-[#f2f2f2] pt-4">
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Produk</dt>
                <dd className="font-semibold text-right">{resultOrder.product}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Nominal</dt>
                <dd className="font-semibold text-right">{resultOrder.denom}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">User ID</dt>
                <dd className="font-semibold text-right">{resultOrder.uid}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Pembayaran</dt>
                <dd className="font-semibold text-right">{resultOrder.pay}</dd>
              </div>
              <div className="flex justify-between gap-3 sm:col-span-2 border-t-2 border-[#f2f2f2] pt-3 mt-1">
                <dt className="text-[#717171]">Total bayar</dt>
                <dd className="display text-lg font-bold text-[#ff385c] text-right">{rupiah(resultOrder.total)}</dd>
              </div>
            </dl>
            <h2 className="display text-base font-bold mt-6 mb-4">Riwayat status</h2>
            <div className="tl">
              <div className="tl-i done">
                <p className="text-sm font-semibold">Pesanan dibuat</p>
                <p className="text-xs text-[#717171] mt-0.5">
                  {new Date(resultOrder.created).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className={`tl-i ${resultOrder.status === "Sedang diverifikasi" || resultOrder.status === "Selesai" ? "done" : ""}`}>
                <p className="text-sm font-semibold">Pembayaran diterima</p>
                <p className="text-xs text-[#717171] mt-0.5">
                  {resultOrder.status === "Sedang diverifikasi" ? "Konfirmasi diterima, sedang dicek tim kami."
                    : resultOrder.status === "Selesai" ? "Pembayaran terkonfirmasi."
                    : "Belum ada pembayaran masuk."}
                </p>
              </div>
              <div className={`tl-i ${resultOrder.status === "Selesai" ? "done" : ""}`} style={{ paddingBottom: 0 }}>
                <p className="text-sm font-semibold">Diamond dikirim</p>
                <p className="text-xs text-[#717171] mt-0.5">
                  {resultOrder.status === "Selesai" ? "Diamond sudah masuk ke User ID kamu." : "Otomatis setelah pembayaran."}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              {resultOrder.status !== "Sedang diverifikasi" && resultOrder.status !== "Selesai" && (
                <Link href="/payment" className="flex-1 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full py-3.5 flex items-center justify-center">
                  Lanjutkan pembayaran
                </Link>
              )}
              <a href={resultWaLink} className="flex-1 border-2 border-[#eee] hover:border-[#ff385c] hover:text-[#ff385c] transition text-sm font-semibold rounded-full py-3 flex items-center justify-center gap-2">
                <svg className="ico" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path></svg>
                Tanya CS soal pesanan ini
              </a>
            </div>
          </section>
        )}

        {notFound && (
          <section ref={notFoundRef} className="card p-6 mt-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fff5f7] text-[#ff385c] grid place-items-center mx-auto mb-3">
              <svg className="ico" style={{ width: 24, height: 24 }} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
              </svg>
            </div>
            <h2 className="display text-lg font-bold">Invoice tidak ditemukan</h2>
            <p className="text-sm text-[#717171] mt-2 leading-relaxed max-w-[440px] mx-auto">
              Pastikan nomornya benar dan diketik lengkap (format <span className="mono font-semibold text-[#111]">NRX-000000</span>).
              Riwayat pesanan hanya tersimpan di perangkat tempat kamu checkout.
            </p>
            <a href={nfWaLink} className="inline-flex items-center gap-2 mt-4 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-3 shadow-[0_10px_26px_rgba(255,56,92,.3)]">
              <svg className="ico" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path></svg>
              Hubungi CS
            </a>
          </section>
        )}

        <p className="text-xs text-[#9a9a9a] text-center mt-6 leading-relaxed">
          Butuh bantuan cepat? CS Noryxa aktif 24 jam lewat WhatsApp.
        </p>
      </main>

      {/* ============ DESKTOP (wireframe style) ============ */}
      <main className="hidden lg:block flex-1 w-full max-w-3xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <p className="eyebrow mb-2">Cek Transaksi</p>
          <h1 className="display text-3xl font-bold">Check Transaction</h1>
          <p className="text-sm text-[#717171] mt-2">
            Masukkan nomor invoice, email, atau nomor WhatsApp kamu.
          </p>
        </div>

        {/* Search Form */}
        <div className="card overflow-hidden">
          <div className="bg-[#f7f7f7] border-b-2 border-[#eee] px-6 py-4 flex items-center relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10">
              <svg className="ico w-16 h-16 text-[#717171] transform rotate-12 -translate-y-2 translate-x-4" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path>
              </svg>
            </div>
            <div className="bg-[#111318] text-white w-7 h-7 rounded-[8px] grid place-items-center mr-3 z-10">
              <svg className="ico w-3.5 h-3.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            </div>
            <h2 className="text-[#111318] font-bold tracking-wide z-10 text-sm">FIND YOUR ORDER</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#717171]" viewBox="0 0 24 24">
                  <path d="M4 7h16M4 12h16M4 17h10"></path>
                </svg>
                <input
                  className="w-full border-2 border-[#eee] rounded-[12px] pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#111318] focus:border-[#111318] transition mono uppercase"
                  placeholder="e.g. NRX-482913"
                  autoComplete="off"
                  value={invoiceInput}
                  onChange={(e) => setInvoiceInput(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-[#ff385c] hover:bg-[#e12b4d] text-white font-bold py-3 px-6 rounded-[12px] shadow-[0_4px_12px_rgba(255,56,92,.2)] transition text-sm flex items-center justify-center gap-2">
                <svg className="ico w-4 h-4" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                Check
              </button>
            </form>
            {error && <p className="text-sm text-[#ff385c] font-semibold mt-3">{error}</p>}
            {recentOrders.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-[#717171] mb-2">Invoice terakhir di perangkat ini</p>
                <div className="flex flex-wrap gap-2">
                  {recentOrders.map((o) => (
                    <button key={o.inv} className="recent mono" onClick={() => { setInvoiceInput(o.inv); lookup(o.inv); }}>
                      {o.inv}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-[#9a9a9a] mt-3">Data kamu privasi dan hanya digunakan untuk mengecek status transaksi.</p>
          </div>
        </div>

        {/* FOUND */}
        {resultOrder && (
          <div ref={resultRef} className="card mt-6 overflow-hidden">
            <div className="px-6 py-3 bg-green-50 border-b border-green-200 flex items-center gap-2">
              <svg className="ico w-4 h-4 text-green-500" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"></path></svg>
              <span className="text-sm font-bold text-green-600">Transaction Found</span>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <img src={getGameImage(resultOrder.product)} alt={resultOrder.product} className="w-14 h-14 rounded-[14px] object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#111318] truncate">{resultOrder.product}</p>
                  <p className="text-xs text-[#717171] font-mono">{resultOrder.inv}</p>
                  <p className="text-xs text-[#717171]">
                    {new Date(resultOrder.created).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-[#ff385c]">{rupiah(resultOrder.total)}</p>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${
                    resultOrder.status === "Selesai" ? "bg-green-50 text-green-600 border-green-200"
                    : resultOrder.status === "Sedang diverifikasi" ? "bg-blue-50 text-blue-600 border-blue-200"
                    : "bg-yellow-50 text-yellow-600 border-yellow-200"
                  }`}>
                    {getBadgeText(resultOrder.status).toUpperCase()}
                  </span>
                </div>
              </div>

              <dl className="text-sm grid grid-cols-2 gap-x-6 gap-y-2.5 mt-5 pt-5 border-t-2 border-[#f2f2f2]">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Produk</dt>
                  <dd className="font-semibold text-right">{resultOrder.product}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Nominal</dt>
                  <dd className="font-semibold text-right">{resultOrder.denom}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">User ID</dt>
                  <dd className="font-semibold text-right font-mono">{resultOrder.uid}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Pembayaran</dt>
                  <dd className="font-semibold text-right">{resultOrder.pay}</dd>
                </div>
              </dl>

              <h3 className="display text-sm font-bold mt-6 mb-3">Riwayat Status</h3>
              <div className="tl">
                <div className="tl-i done">
                  <p className="text-sm font-semibold">Pesanan dibuat</p>
                  <p className="text-xs text-[#717171] mt-0.5">
                    {new Date(resultOrder.created).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className={`tl-i ${resultOrder.status === "Sedang diverifikasi" || resultOrder.status === "Selesai" ? "done" : ""}`}>
                  <p className="text-sm font-semibold">Pembayaran diterima</p>
                  <p className="text-xs text-[#717171] mt-0.5">
                    {resultOrder.status === "Sedang diverifikasi" ? "Konfirmasi diterima, sedang dicek tim kami."
                      : resultOrder.status === "Selesai" ? "Pembayaran terkonfirmasi."
                      : "Belum ada pembayaran masuk."}
                  </p>
                </div>
                <div className={`tl-i ${resultOrder.status === "Selesai" ? "done" : ""}`} style={{ paddingBottom: 0 }}>
                  <p className="text-sm font-semibold">Diamond dikirim</p>
                  <p className="text-xs text-[#717171] mt-0.5">
                    {resultOrder.status === "Selesai" ? "Diamond sudah masuk ke User ID kamu." : "Otomatis setelah pembayaran."}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                {resultOrder.status !== "Sedang diverifikasi" && resultOrder.status !== "Selesai" && (
                  <Link href="/payment" className="flex-1 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-bold py-3 rounded-[12px] flex items-center justify-center gap-2">
                    Lanjutkan Pembayaran
                  </Link>
                )}
                <a href={resultWaLink} className="flex-1 border-2 border-[#eee] hover:border-[#ff385c] hover:text-[#ff385c] transition text-sm font-bold py-3 rounded-[12px] flex items-center justify-center gap-2">
                  <svg className="ico w-4 h-4" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path></svg>
                  Tanya CS
                </a>
              </div>
            </div>
          </div>
        )}

        {/* NOT FOUND */}
        {notFound && (
          <div ref={notFoundRef} className="card mt-6 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-[#f7f7f7] grid place-items-center mx-auto mb-4">
              <svg className="ico w-6 h-6 text-[#ccc]" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
            </div>
            <h3 className="font-bold text-[#111318] mb-1">No Transaction Found</h3>
            <p className="text-xs text-[#717171] max-w-xs mx-auto">
              Invoice tidak ditemukan. Pastikan nomor sudah benar (format <span className="mono font-semibold">NRX-000000</span>).
            </p>
            <a href={nfWaLink} className="inline-flex items-center gap-2 mt-4 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-3">
              <svg className="ico" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path></svg>
              Hubungi CS
            </a>
          </div>
        )}

        {/* Info Cards */}
        {!resultOrder && !notFound && (
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="card p-5 text-center">
              <svg className="ico w-6 h-6 text-[#ff385c] mx-auto mb-2" viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"></path></svg>
              <h3 className="text-sm font-bold text-[#111318] mb-1">Instant Results</h3>
              <p className="text-xs text-[#717171]">Status update real-time dari sistem pembayaran.</p>
            </div>
            <div className="card p-5 text-center">
              <svg className="ico w-6 h-6 text-[#ff385c] mx-auto mb-2" viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path></svg>
              <h3 className="text-sm font-bold text-[#111318] mb-1">Data Privacy</h3>
              <p className="text-xs text-[#717171]">Data pencarian tidak disimpan atau dibagikan.</p>
            </div>
            <div className="card p-5 text-center">
              <svg className="ico w-6 h-6 text-[#ff385c] mx-auto mb-2" viewBox="0 0 24 24"><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path></svg>
              <h3 className="text-sm font-bold text-[#111318] mb-1">Need Help?</h3>
              <p className="text-xs text-[#717171]">CS 24 jam via WhatsApp siap bantu.</p>
            </div>
          </div>
        )}
      </main>
    </AppLayout>
  );
}
