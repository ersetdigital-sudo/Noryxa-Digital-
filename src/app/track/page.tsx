"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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

export default function TrackPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [invoiceInput, setInvoiceInput] = useState("");
  const [error, setError] = useState("");
  const [resultOrder, setResultOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [nfWaLink, setNfWaLink] = useState("");
  const resultRef = useRef<HTMLElement | null>(null);
  const notFoundRef = useRef<HTMLElement | null>(null);

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

    // Supabase first, fallback ke localStorage
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
    <div className="bg-[#f7f7f7] min-h-screen no-hover">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-[#eee]">
        <div className="max-w-[820px] mx-auto flex items-center gap-3 px-4 sm:px-6 h-16">
          <Link
            href="/"
            className="text-sm text-[#717171] hover:text-[#ff385c] transition inline-flex items-center gap-1.5"
          >
            <svg className="ico" viewBox="0 0 24 24">
              <path d="M19 12H5M11 18l-6-6 6-6"></path>
            </svg>
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/images/02f95e73-2700-481c-ab2b-4f9fbd473da7.png"
              alt="Noryxa Digital"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg shrink-0"
            />
            <span className="display text-[16px] font-bold">
              Noryxa<span className="text-[#ff385c]"> Digital</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-[820px] mx-auto px-4 sm:px-6 py-8 pb-16">
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
              <p className="text-xs text-[#717171] mb-2">
                Invoice terakhir di perangkat ini
              </p>
              <div className="flex flex-wrap gap-2">
                {recentOrders.map((o) => (
                  <button
                    key={o.inv}
                    className="recent mono"
                    onClick={() => {
                      setInvoiceInput(o.inv);
                      lookup(o.inv);
                    }}
                  >
                    {o.inv}
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm text-[#ff385c] font-semibold mt-3">{error}</p>
          )}
        </section>

        {/* RESULT */}
        {resultOrder && (
          <section ref={resultRef} className="card p-5 sm:p-6 mt-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-xs text-[#717171] mb-1">Nomor invoice</p>
                <p className="display text-xl font-bold mono">{resultOrder.inv}</p>
                <p className="text-xs text-[#717171] mt-1">
                  {new Date(resultOrder.created).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <span className={getBadgeClass(resultOrder.status)}>
                {getBadgeText(resultOrder.status)}
              </span>
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
                <dd className="display text-lg font-bold text-[#ff385c] text-right">
                  {rupiah(resultOrder.total)}
                </dd>
              </div>
            </dl>

            <h2 className="display text-base font-bold mt-6 mb-4">Riwayat status</h2>
            <div className="tl">
              <div className="tl-i done">
                <p className="text-sm font-semibold">Pesanan dibuat</p>
                <p className="text-xs text-[#717171] mt-0.5">
                  {new Date(resultOrder.created).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div
                className={`tl-i ${
                  resultOrder.status === "Sedang diverifikasi" ||
                  resultOrder.status === "Selesai"
                    ? "done"
                    : ""
                }`}
              >
                <p className="text-sm font-semibold">Pembayaran diterima</p>
                <p className="text-xs text-[#717171] mt-0.5">
                  {resultOrder.status === "Sedang diverifikasi"
                    ? "Konfirmasi diterima, sedang dicek tim kami."
                    : resultOrder.status === "Selesai"
                    ? "Pembayaran terkonfirmasi."
                    : "Belum ada pembayaran masuk."}
                </p>
              </div>
              <div
                className={`tl-i ${
                  resultOrder.status === "Selesai" ? "done" : ""
                }`}
                style={{ paddingBottom: 0 }}
              >
                <p className="text-sm font-semibold">Diamond dikirim</p>
                <p className="text-xs text-[#717171] mt-0.5">
                  {resultOrder.status === "Selesai"
                    ? "Diamond sudah masuk ke User ID kamu."
                    : "Otomatis setelah pembayaran."}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 mt-6">
              {resultOrder.status !== "Sedang diverifikasi" &&
                resultOrder.status !== "Selesai" && (
                <Link
                  href="/payment"
                  className="flex-1 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full py-3.5 flex items-center justify-center"
                >
                  Lanjutkan pembayaran
                </Link>
              )}
              <a
                href={resultWaLink}
                className="flex-1 border-2 border-[#eee] hover:border-[#ff385c] hover:text-[#ff385c] transition text-sm font-semibold rounded-full py-3 flex items-center justify-center gap-2"
              >
                <svg className="ico" viewBox="0 0 24 24">
                  <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
                </svg>
                Tanya CS soal pesanan ini
              </a>
            </div>
          </section>
        )}

        {/* NOT FOUND */}
        {notFound && (
          <section ref={notFoundRef} className="card p-6 mt-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#fff5f7] text-[#ff385c] grid place-items-center mx-auto mb-3">
              <svg
                className="ico"
                style={{ width: 24, height: 24 }}
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-3.5-3.5"></path>
              </svg>
            </div>
            <h2 className="display text-lg font-bold">Invoice tidak ditemukan</h2>
            <p className="text-sm text-[#717171] mt-2 leading-relaxed max-w-[440px] mx-auto">
              Pastikan nomornya benar dan diketik lengkap (format{" "}
              <span className="mono font-semibold text-[#111]">NRX-000000</span>).
              Riwayat pesanan hanya tersimpan di perangkat tempat kamu checkout — kalau kamu
              ganti perangkat atau browser, hubungi CS dengan menyertakan nomor invoice.
            </p>
            <a
              href={nfWaLink}
              className="inline-flex items-center gap-2 mt-4 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-3 shadow-[0_10px_26px_rgba(255,56,92,.3)]"
            >
              <svg className="ico" viewBox="0 0 24 24">
                <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
              </svg>
              Hubungi CS
            </a>
          </section>
        )}

        <p className="text-xs text-[#9a9a9a] text-center mt-6 leading-relaxed">
          Butuh bantuan cepat? CS Noryxa aktif 24 jam lewat WhatsApp.
        </p>
      </main>
    </div>
  );
}
