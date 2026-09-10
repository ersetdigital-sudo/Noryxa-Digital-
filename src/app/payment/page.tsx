"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { rupiah } from "@/lib/data";

const FAQ = [
  ["Berapa lama pesanan diproses?", "Rata-rata 3 detik setelah pembayaran terkonfirmasi. Saat jam sibuk maksimal 5 menit."],
  ["Diamond belum masuk, harus bagaimana?", "Tunggu 5 menit, lalu hubungi CS lewat WhatsApp dengan menyertakan nomor invoice kamu."],
  ["Bisa refund?", "Bisa. Jika pesanan gagal diproses, dana dikembalikan 100% ke metode pembayaran kamu maksimal 1x24 jam."],
  ["Apakah aman untuk akun saya?", "Aman. Top up dilakukan langsung ke User ID tanpa perlu login atau memberikan password akun."],
];

export default function PaymentPage() {
  const [product, setProduct] = useState("Mobile Legends");
  const [denom, setDenom] = useState("86 Diamonds");
  const [uid, setUid] = useState("—");
  const [pay, setPay] = useState("QRIS");
  const [base, setBase] = useState(23900);
  const [fee, setFee] = useState(1000);
  const [disc, setDisc] = useState(0);
  const [total, setTotal] = useState(24900);
  const [inv, setInv] = useState("NRX-000000");
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerExpired, setTimerExpired] = useState(false);
  const [created, setCreated] = useState("");
  const [paidStatus, setPaidStatus] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copyLabel, setCopyLabel] = useState<Record<string, string>>({});

  useEffect(() => {
    let stored: Record<string, unknown> = {};
    try {
      stored = JSON.parse(sessionStorage.getItem("noryxaOrder") || "{}") || {};
    } catch {}

    const q = new URLSearchParams(window.location.search);
    const get = (k: string, d: string) =>
      q.get(k) != null ? q.get(k)! : String(stored[k] ?? d);
    const getNum = (k: string, d: number) => {
      const v = q.get(k);
      return v != null ? Number(v) : Number(stored[k] ?? d);
    };

    const p = get("pay", "QRIS");
    const b = getNum("base", 23900);
    const f = getNum("fee", 1000);
    const dc = getNum("disc", 0);
    const t = Math.max(0, b + f - dc);
    const i = "NRX-" + String(Date.now()).slice(-6);

    setProduct(get("product", "Mobile Legends"));
    setDenom(get("denom", "86 Diamonds"));
    setUid(get("uid", "—"));
    setPay(p);
    setBase(b);
    setFee(f);
    setDisc(dc);
    setTotal(t);
    setInv(i);
    setCreated(new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }));

    try {
      const all = JSON.parse(localStorage.getItem("noryxaOrders") || "[]");
      const rec = { inv: i, product: get("product", "Mobile Legends"), denom: get("denom", "86 Diamonds"), uid: get("uid", "—"), pay: p, base: b, fee: f, disc: dc, total: t, status: "Menunggu pembayaran", created: Date.now() };
      all.unshift(rec);
      localStorage.setItem("noryxaOrders", JSON.stringify(all.slice(0, 30)));
    } catch {}
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimerExpired(true);
      return;
    }
    const tick = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          setTimerExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []);

  const isQris = /qris/i.test(pay);
  const isVA = /virtual|bank|va|bca|bni|bri|mandiri|permata/i.test(pay);

  const timerStr =
    String(Math.floor(timeLeft / 60)).padStart(2, "0") +
    ":" +
    String(timeLeft % 60).padStart(2, "0");

  const barPct = (timeLeft / (15 * 60)) * 100;

  const waMsg = encodeURIComponent(
    `Halo Noryxa Digital, saya sudah bayar:\nInvoice: ${inv}\nProduk: ${product}\nNominal: ${denom}\nUser ID: ${uid}\nPembayaran: ${pay}\nTotal: ${rupiah(total)}`
  );

  const handleCopy = useCallback(async (id: string, text: string) => {
    const clean = text.replace(/\s|Rp/g, "");
    try {
      await navigator.clipboard.writeText(clean);
    } catch {}
    setCopyLabel((prev) => ({ ...prev, [id]: "Tersalin" }));
    setTimeout(() => setCopyLabel((prev) => ({ ...prev, [id]: "" })), 1400);
  }, []);

  const confirmPaid = () => {
    setPaidStatus(true);
    try {
      const all = JSON.parse(localStorage.getItem("noryxaOrders") || "[]");
      const i = all.findIndex((o: { inv: string }) => o.inv === inv);
      if (i >= 0) {
        all[i].status = "Sedang diverifikasi";
        localStorage.setItem("noryxaOrders", JSON.stringify(all.slice(0, 30)));
      }
    } catch {}
    window.open("https://wa.me/6281234567890?text=" + waMsg, "_blank");
  };

  const faq1Text = isVA
    ? `Buka m-banking ${pay}, pilih menu Transfer → Virtual Account.`
    : isQris
    ? "Buka aplikasi e-wallet atau m-banking kamu, lalu pilih menu Scan QRIS."
    : `Buka aplikasi ${pay} dan pilih menu Kirim / Transfer.`;

  const faq2Html = isVA
    ? `Masukkan nomor VA di atas, pastikan nama penerima <b class='text-[#111]'>NORYXA DIGITAL</b> dan nominalnya sesuai.`
    : isQris
    ? 'Scan kode di atas dan pastikan nama merchant <b class="text-[#111]">NORYXA DIGITAL</b> serta nominalnya sesuai.'
    : `Kirim ke nomor di atas atas nama <b class='text-[#111]'>NORYXA DIGITAL</b> sesuai nominal total.`;

  const vaLabel = isVA
    ? `Nomor Virtual Account · ${pay}`
    : isQris
    ? ""
    : `Nomor tujuan ${pay}`;

  const vaNum = isVA ? "8808 0812 3456 7890" : "0812 3456 7890";

  return (
    <div className="bg-[#f7f7f7] min-h-screen no-hover">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-[#eee]">
        <div className="max-w-[1080px] mx-auto flex items-center gap-3 px-4 sm:px-6 h-16">
          <Link
            href="/product"
            className="text-sm text-[#717171] hover:text-[#ff385c] transition inline-flex items-center gap-1.5"
          >
            <svg className="ico" viewBox="0 0 24 24">
              <path d="M19 12H5M11 18l-6-6 6-6"></path>
            </svg>
            <span className="hidden sm:inline">Kembali</span>
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
          <span className="ml-auto text-[11px] font-semibold text-[#0a7d43] bg-[#e8f7ef] rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
            <svg className="ico" style={{ width: 14, height: 14 }} viewBox="0 0 24 24">
              <path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6l7-3Z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            Transaksi aman
          </span>
        </div>
      </header>

      <main className="max-w-[1080px] mx-auto px-4 sm:px-6 py-6 pb-28 lg:pb-12">
        {/* STATUS BAR */}
        <section className="card p-5 sm:p-6 mb-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div>
              <p className="eyebrow mb-1.5">Menunggu pembayaran</p>
              <h1 className="display text-xl sm:text-2xl font-bold">
                Selesaikan pembayaran kamu
              </h1>
              <p className="text-sm text-[#717171] mt-1">
                Invoice <span className="mono font-semibold text-[#111]">{inv}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#717171] mb-1">Bayar sebelum</p>
              <p
                className={`display text-2xl sm:text-3xl font-bold leading-none ${
                  timerExpired ? "text-[#717171]" : "text-[#ff385c]"
                }`}
              >
                {timerExpired ? "00:00" : timerStr}
              </p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-[#f0f0f0] mt-4 overflow-hidden">
            <div
              className="h-full bg-[#ff385c] transition-[width] duration-500"
              style={{ width: `${timerExpired ? 0 : barPct}%` }}
            ></div>
          </div>
        </section>

        <div className="grid lg:grid-cols-[1fr_360px] gap-4 items-start">
          <div className="flex flex-col gap-4">
            {/* PAYMENT INSTRUCTION */}
            <section className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="display text-base font-bold">Metode pembayaran</h2>
                <span className="text-[11px] font-bold bg-[#111] text-white rounded-full px-3 py-1.5">
                  {pay}
                </span>
              </div>

              {/* QRIS */}
              {isQris && (
                <div className="text-center">
                  <div className="qr">
                    <svg viewBox="0 0 33 33" width="176" height="176" shapeRendering="crispEdges" aria-label="Kode QRIS">
                      <rect width="33" height="33" fill="#fff"></rect>
                      <g fill="#111">
                        <rect x="1" y="1" width="7" height="7"></rect>
                        <rect x="2" y="2" width="5" height="5" fill="#fff"></rect>
                        <rect x="3" y="3" width="3" height="3"></rect>
                        <rect x="25" y="1" width="7" height="7"></rect>
                        <rect x="26" y="2" width="5" height="5" fill="#fff"></rect>
                        <rect x="27" y="3" width="3" height="3"></rect>
                        <rect x="1" y="25" width="7" height="7"></rect>
                        <rect x="2" y="26" width="5" height="5" fill="#fff"></rect>
                        <rect x="3" y="27" width="3" height="3"></rect>
                        <rect x="10" y="1" width="1" height="1"></rect>
                        <rect x="12" y="1" width="1" height="1"></rect>
                        <rect x="14" y="2" width="1" height="1"></rect>
                        <rect x="11" y="3" width="1" height="1"></rect>
                        <rect x="13" y="4" width="1" height="1"></rect>
                        <rect x="10" y="5" width="1" height="1"></rect>
                        <rect x="15" y="5" width="1" height="1"></rect>
                        <rect x="12" y="6" width="1" height="1"></rect>
                        <rect x="9" y="9" width="1" height="1"></rect>
                        <rect x="11" y="9" width="1" height="1"></rect>
                        <rect x="13" y="9" width="1" height="1"></rect>
                        <rect x="16" y="9" width="1" height="1"></rect>
                        <rect x="19" y="9" width="1" height="1"></rect>
                        <rect x="22" y="9" width="1" height="1"></rect>
                        <rect x="25" y="9" width="1" height="1"></rect>
                        <rect x="28" y="9" width="1" height="1"></rect>
                        <rect x="30" y="9" width="1" height="1"></rect>
                        <rect x="10" y="11" width="1" height="1"></rect>
                        <rect x="14" y="11" width="1" height="1"></rect>
                        <rect x="17" y="11" width="1" height="1"></rect>
                        <rect x="20" y="11" width="1" height="1"></rect>
                        <rect x="24" y="11" width="1" height="1"></rect>
                        <rect x="27" y="11" width="1" height="1"></rect>
                        <rect x="31" y="11" width="1" height="1"></rect>
                        <rect x="9" y="13" width="1" height="1"></rect>
                        <rect x="12" y="13" width="1" height="1"></rect>
                        <rect x="15" y="13" width="1" height="1"></rect>
                        <rect x="18" y="13" width="1" height="1"></rect>
                        <rect x="21" y="13" width="1" height="1"></rect>
                        <rect x="23" y="13" width="1" height="1"></rect>
                        <rect x="26" y="13" width="1" height="1"></rect>
                        <rect x="29" y="13" width="1" height="1"></rect>
                        <rect x="1" y="10" width="1" height="1"></rect>
                        <rect x="3" y="10" width="1" height="1"></rect>
                        <rect x="5" y="10" width="1" height="1"></rect>
                        <rect x="7" y="10" width="1" height="1"></rect>
                        <rect x="1" y="12" width="1" height="1"></rect>
                        <rect x="4" y="12" width="1" height="1"></rect>
                        <rect x="6" y="12" width="1" height="1"></rect>
                        <rect x="1" y="14" width="1" height="1"></rect>
                        <rect x="3" y="14" width="1" height="1"></rect>
                        <rect x="5" y="14" width="1" height="1"></rect>
                        <rect x="7" y="14" width="1" height="1"></rect>
                        <rect x="2" y="16" width="1" height="1"></rect>
                        <rect x="4" y="16" width="1" height="1"></rect>
                        <rect x="6" y="16" width="1" height="1"></rect>
                        <rect x="1" y="18" width="1" height="1"></rect>
                        <rect x="3" y="18" width="1" height="1"></rect>
                        <rect x="5" y="18" width="1" height="1"></rect>
                        <rect x="7" y="18" width="1" height="1"></rect>
                        <rect x="1" y="20" width="1" height="1"></rect>
                        <rect x="4" y="20" width="1" height="1"></rect>
                        <rect x="6" y="20" width="1" height="1"></rect>
                        <rect x="1" y="22" width="1" height="1"></rect>
                        <rect x="3" y="22" width="1" height="1"></rect>
                        <rect x="5" y="22" width="1" height="1"></rect>
                        <rect x="7" y="22" width="1" height="1"></rect>
                        <rect x="10" y="17" width="1" height="1"></rect>
                        <rect x="12" y="17" width="1" height="1"></rect>
                        <rect x="14" y="17" width="1" height="1"></rect>
                        <rect x="16" y="17" width="1" height="1"></rect>
                        <rect x="19" y="17" width="1" height="1"></rect>
                        <rect x="21" y="17" width="1" height="1"></rect>
                        <rect x="24" y="17" width="1" height="1"></rect>
                        <rect x="27" y="17" width="1" height="1"></rect>
                        <rect x="30" y="17" width="1" height="1"></rect>
                        <rect x="10" y="19" width="1" height="1"></rect>
                        <rect x="13" y="19" width="1" height="1"></rect>
                        <rect x="15" y="19" width="1" height="1"></rect>
                        <rect x="18" y="19" width="1" height="1"></rect>
                        <rect x="20" y="19" width="1" height="1"></rect>
                        <rect x="23" y="19" width="1" height="1"></rect>
                        <rect x="26" y="19" width="1" height="1"></rect>
                        <rect x="29" y="19" width="1" height="1"></rect>
                        <rect x="10" y="21" width="1" height="1"></rect>
                        <rect x="12" y="21" width="1" height="1"></rect>
                        <rect x="15" y="21" width="1" height="1"></rect>
                        <rect x="17" y="21" width="1" height="1"></rect>
                        <rect x="20" y="21" width="1" height="1"></rect>
                        <rect x="22" y="21" width="1" height="1"></rect>
                        <rect x="25" y="21" width="1" height="1"></rect>
                        <rect x="28" y="21" width="1" height="1"></rect>
                        <rect x="10" y="23" width="1" height="1"></rect>
                        <rect x="13" y="23" width="1" height="1"></rect>
                        <rect x="16" y="23" width="1" height="1"></rect>
                        <rect x="18" y="23" width="1" height="1"></rect>
                        <rect x="21" y="23" width="1" height="1"></rect>
                        <rect x="24" y="23" width="1" height="1"></rect>
                        <rect x="26" y="23" width="1" height="1"></rect>
                        <rect x="30" y="23" width="1" height="1"></rect>
                        <rect x="10" y="25" width="1" height="1"></rect>
                        <rect x="12" y="25" width="1" height="1"></rect>
                        <rect x="15" y="25" width="1" height="1"></rect>
                        <rect x="17" y="25" width="1" height="1"></rect>
                        <rect x="19" y="25" width="1" height="1"></rect>
                        <rect x="22" y="25" width="1" height="1"></rect>
                        <rect x="25" y="25" width="1" height="1"></rect>
                        <rect x="28" y="25" width="1" height="1"></rect>
                        <rect x="10" y="27" width="1" height="1"></rect>
                        <rect x="14" y="27" width="1" height="1"></rect>
                        <rect x="16" y="27" width="1" height="1"></rect>
                        <rect x="19" y="27" width="1" height="1"></rect>
                        <rect x="21" y="27" width="1" height="1"></rect>
                        <rect x="24" y="27" width="1" height="1"></rect>
                        <rect x="27" y="27" width="1" height="1"></rect>
                        <rect x="29" y="27" width="1" height="1"></rect>
                        <rect x="10" y="29" width="1" height="1"></rect>
                        <rect x="12" y="29" width="1" height="1"></rect>
                        <rect x="14" y="29" width="1" height="1"></rect>
                        <rect x="17" y="29" width="1" height="1"></rect>
                        <rect x="20" y="29" width="1" height="1"></rect>
                        <rect x="23" y="29" width="1" height="1"></rect>
                        <rect x="26" y="29" width="1" height="1"></rect>
                        <rect x="28" y="29" width="1" height="1"></rect>
                        <rect x="10" y="31" width="1" height="1"></rect>
                        <rect x="13" y="31" width="1" height="1"></rect>
                        <rect x="15" y="31" width="1" height="1"></rect>
                        <rect x="18" y="31" width="1" height="1"></rect>
                        <rect x="20" y="31" width="1" height="1"></rect>
                        <rect x="22" y="31" width="1" height="1"></rect>
                        <rect x="25" y="31" width="1" height="1"></rect>
                        <rect x="30" y="31" width="1" height="1"></rect>
                        <rect x="11" y="10" width="1" height="1"></rect>
                        <rect x="13" y="10" width="1" height="1"></rect>
                        <rect x="15" y="10" width="1" height="1"></rect>
                        <rect x="18" y="10" width="1" height="1"></rect>
                        <rect x="21" y="10" width="1" height="1"></rect>
                        <rect x="23" y="10" width="1" height="1"></rect>
                        <rect x="26" y="10" width="1" height="1"></rect>
                        <rect x="29" y="10" width="1" height="1"></rect>
                      </g>
                    </svg>
                  </div>
                  <p className="text-sm text-[#717171] mt-3">
                    Scan pakai GoPay, DANA, OVO, ShopeePay, atau m-banking apa pun.
                  </p>
                  <p className="text-xs text-[#9a9a9a] mt-1">
                    Nominal otomatis terisi sesuai total pesanan.
                  </p>
                </div>
              )}

              {/* VA / EWALLET */}
              {!isQris && (
                <div>
                  <p className="text-xs text-[#717171] mb-1.5">{vaLabel}</p>
                  <div className="flex items-center gap-3 border-2 border-[#eee] rounded-[16px] p-4">
                    <span className="mono text-lg sm:text-xl font-bold flex-1 break-all">
                      {vaNum}
                    </span>
                    <button
                      className="copybtn"
                      onClick={() => handleCopy("va", vaNum)}
                    >
                      {copyLabel["va"] || "Salin"}
                    </button>
                  </div>
                  <p className="text-xs text-[#717171] mt-3">
                    Transfer tepat sampai digit terakhir agar pesanan terverifikasi otomatis.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 border-2 border-[#eee] rounded-[16px] p-4 mt-4">
                <div className="min-w-0">
                  <p className="text-xs text-[#717171]">Jumlah yang harus dibayar</p>
                  <p className="display text-xl font-bold text-[#ff385c] leading-tight mt-0.5">
                    {rupiah(total)}
                  </p>
                </div>
                <button
                  className="copybtn ml-auto shrink-0"
                  onClick={() => handleCopy("amt", rupiah(total))}
                >
                  {copyLabel["amt"] || "Salin"}
                </button>
              </div>
            </section>

            {/* HOW TO */}
            <section className="card p-5 sm:p-6">
              <h2 className="display text-base font-bold mb-4">Cara bayar</h2>
              <ol className="flex flex-col gap-3">
                <li className="flex gap-3">
                  <span className="stepdot">1</span>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">{faq1Text}</p>
                </li>
                <li className="flex gap-3">
                  <span className="stepdot">2</span>
                  <p
                    className="text-sm text-[#4a4a4a] leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: faq2Html }}
                  />
                </li>
                <li className="flex gap-3">
                  <span className="stepdot">3</span>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">
                    Konfirmasi pembayaran dan tunggu di halaman ini. Status berubah otomatis.
                  </p>
                </li>
                <li className="flex gap-3">
                  <span className="stepdot">4</span>
                  <p className="text-sm text-[#4a4a4a] leading-relaxed">
                    Diamond masuk ke User ID kamu rata-rata dalam 3 detik setelah pembayaran
                    terkonfirmasi.
                  </p>
                </li>
              </ol>
            </section>

            {/* STATUS TIMELINE */}
            <section className="card p-5 sm:p-6">
              <h2 className="display text-base font-bold mb-4">Status pesanan</h2>
              <div className="tl">
                <div className="tl-i done">
                  <p className="text-sm font-semibold">Pesanan dibuat</p>
                  <p className="text-xs text-[#717171] mt-0.5">{created}</p>
                </div>
                <div className={`tl-i ${paidStatus ? "done" : ""}`}>
                  <p className="text-sm font-semibold">Pembayaran diterima</p>
                  <p className="text-xs text-[#717171] mt-0.5">
                    {paidStatus
                      ? "Sedang diverifikasi — jangan tutup halaman ini."
                      : "Menunggu pembayaran kamu"}
                  </p>
                </div>
                <div className="tl-i" style={{ paddingBottom: 0 }}>
                  <p className="text-sm font-semibold">Diamond dikirim</p>
                  <p className="text-xs text-[#717171] mt-0.5">
                    Otomatis setelah pembayaran
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="card p-5 sm:p-6">
              <h2 className="display text-base font-bold mb-2">Pertanyaan umum</h2>
              <div className="divide-y-2 divide-[#f2f2f2]">
                {FAQ.map(([q, a], i) => (
                  <div key={i} className="py-3">
                    <button
                      className="w-full flex items-center gap-3 text-left"
                      aria-expanded={openFaq === i}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-sm font-semibold flex-1">{q}</span>
                      <svg
                        className={`ico chev transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <p className="text-sm text-[#717171] leading-relaxed mt-2">{a}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="card p-5 lg:sticky lg:top-20">
            <h2 className="display text-base font-bold mb-4">Ringkasan Pesanan</h2>
            <dl className="text-sm flex flex-col gap-2.5">
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Produk</dt>
                <dd className="font-semibold text-right">{product}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Nominal</dt>
                <dd className="font-semibold text-right">{denom}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">User ID</dt>
                <dd className="font-semibold text-right">{uid}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Pembayaran</dt>
                <dd className="font-semibold text-right">{pay}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Harga</dt>
                <dd className="font-semibold text-right">{rupiah(base)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#717171]">Biaya layanan</dt>
                <dd className="font-semibold text-right">{rupiah(fee)}</dd>
              </div>
              {disc > 0 && (
                <div className="flex justify-between gap-3">
                  <dt className="text-[#717171]">Diskon</dt>
                  <dd className="font-semibold text-right text-[#0a7d43]">
                    -{rupiah(disc)}
                  </dd>
                </div>
              )}
            </dl>
            <div className="border-t-2 border-[#f2f2f2] mt-4 pt-4 flex items-end justify-between">
              <span className="text-xs text-[#717171]">Total bayar</span>
              <span className="display text-2xl font-bold text-[#ff385c]">
                {rupiah(total)}
              </span>
            </div>
            <button
              onClick={confirmPaid}
              className="w-full mt-4 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full py-3.5 shadow-[0_10px_26px_rgba(255,56,92,.3)]"
            >
              Saya sudah bayar
            </button>
            <a
              href={`https://wa.me/6281234567890?text=${waMsg}`}
              className="w-full mt-2.5 border-2 border-[#eee] hover:border-[#ff385c] hover:text-[#ff385c] transition text-sm font-semibold rounded-full py-3 flex items-center justify-center gap-2"
            >
              <svg className="ico" viewBox="0 0 24 24">
                <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
              </svg>
              Konfirmasi via WhatsApp
            </a>
            <p className="text-[11px] text-[#717171] text-center mt-3 leading-relaxed">
              Dana kembali 100% jika pesanan gagal diproses.
            </p>
          </aside>
        </div>
      </main>

      {/* MOBILE BAR */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t-2 border-[#eee] px-4 py-3 flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-[#717171]">Total bayar</p>
          <p className="display text-lg font-bold text-[#ff385c] leading-none">
            {rupiah(total)}
          </p>
        </div>
        <button
          onClick={confirmPaid}
          className="ml-auto flex-1 max-w-[190px] bg-[#ff385c] text-white text-sm font-semibold rounded-full py-3"
        >
          Saya sudah bayar
        </button>
      </div>
    </div>
  );
}
