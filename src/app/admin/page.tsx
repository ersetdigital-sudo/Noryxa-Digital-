"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/data";
import type { Denom, Pay, Promo } from "@/lib/catalog";

type Tab = "orders" | "products" | "denoms" | "pays" | "promos";

interface OrderRow {
  id: string;
  inv: string;
  product: string;
  denom: string;
  uid: string;
  pay: string;
  total: number;
  status: string;
  email: string | null;
  created_at: string;
}

interface ProductRow {
  id: string;
  name: string;
  category: string;
  price: number;
  img: string;
  rank: number;
  tags: string[];
  active: boolean;
}

const ADMIN_PASS = "noryxa-admin-2026";
const CATEGORIES = [
  "Mobile Games",
  "PC Games",
  "Voucher",
  "PPOB",
  "Entertainment",
  "Top Up Cepat",
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<Tab>("orders");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [denoms, setDenoms] = useState<Denom[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0, revenue: 0 });
  const [msg, setMsg] = useState("");

  const [np, setNp] = useState({ name: "", category: "Mobile Games", price: 0, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 99, tags: "" });
  const [nd, setNd] = useState({ product_name: "Mobile Legends", label: "", price: 0, rank: 99 });
  const [npay, setNpay] = useState({ label: "", kind: "E-wallet", fee: 0, rank: 99 });
  const [npr, setNpr] = useState({ code: "", disc_pct: 10 });

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2000);
  };

  const loadAll = useCallback(async () => {
    const o = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);
    setOrders(o.data || []);
    const rev = (o.data || []).filter((x: OrderRow) => x.status === "Selesai").reduce((s: number, x: OrderRow) => s + x.total, 0);
    setStats({
      total: o.data?.length || 0,
      pending: (o.data || []).filter((x: OrderRow) => x.status === "Menunggu pembayaran").length,
      done: (o.data || []).filter((x: OrderRow) => x.status === "Selesai").length,
      revenue: rev,
    });

    const p = await supabase.from("products").select("*").order("rank");
    setProducts(p.data || []);
    const d = await supabase.from("denoms").select("*").order("rank");
    setDenoms(d.data || []);
    const y = await supabase.from("pays").select("*").order("rank");
    setPays(y.data || []);
    const m = await supabase.from("promos").select("*").order("created_at");
    setPromos(m.data || []);
  }, []);

  useEffect(() => {
    if (authed) loadAll();
  }, [authed, loadAll]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] grid place-items-center px-4">
        <div className="card p-8 w-full max-w-sm">
          <p className="eyebrow mb-2">Admin</p>
          <h1 className="display text-xl font-bold mb-4">Dashboard Noryxa</h1>
          <input
            type="password"
            placeholder="Password admin"
            className="field mb-3"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && pass === ADMIN_PASS && setAuthed(true)}
          />
          <button
            onClick={() => pass === ADMIN_PASS ? setAuthed(true) : flash("Password salah")}
            className="w-full bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full py-3"
          >
            Masuk
          </button>
          {msg && <p className="text-sm text-[#ff385c] font-semibold mt-3 text-center">{msg}</p>}
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "orders", label: "Orders" },
    { id: "products", label: "Produk" },
    { id: "denoms", label: "Nominal" },
    { id: "pays", label: "Pembayaran" },
    { id: "promos", label: "Promo" },
  ];

  const th = "text-left text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wider px-3 py-2";
  const td = "px-3 py-2.5 text-sm";

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-[#eee]">
        <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 sm:px-6 h-16">
          <h1 className="display text-lg font-bold">Admin — Noryxa Digital</h1>
          <span className="ml-auto text-xs text-[#717171]">{stats.total} order</span>
          <button onClick={() => setAuthed(false)} className="text-xs font-semibold text-[#ff385c] hover:underline">
            Keluar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16">
        {/* STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Order", value: String(stats.total) },
            { label: "Menunggu Bayar", value: String(stats.pending) },
            { label: "Selesai", value: String(stats.done) },
            { label: "Revenue (Selesai)", value: rupiah(stats.revenue) },
          ].map((s) => (
            <div key={s.label} className="card p-4">
              <p className="text-[11px] text-[#717171] uppercase tracking-wider font-bold">{s.label}</p>
              <p className="display text-xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* TABS */}
        <div className="scroll-x flex gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
                tab === t.id ? "bg-[#111318] text-white border-[#111318]" : "border-[#eee] text-[#717171] hover:border-[#111]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {msg && <p className="text-sm text-[#0a7d43] font-semibold mb-3">{msg}</p>}

        {/* ORDERS */}
        {tab === "orders" && (
          <section className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                  <tr>
                    <th className={th}>Invoice</th>
                    <th className={th}>Produk</th>
                    <th className={th}>User ID</th>
                    <th className={th}>Total</th>
                    <th className={th}>Status</th>
                    <th className={th}>Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-[#f2f2f2]">
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td className={td + " mono font-semibold"}>{o.inv}</td>
                      <td className={td}>
                        <p className="font-semibold">{o.product}</p>
                        <p className="text-xs text-[#717171]">{o.denom}</p>
                      </td>
                      <td className={td + " mono text-xs"}>{o.uid}</td>
                      <td className={td + " font-semibold"}>{rupiah(o.total)}</td>
                      <td className={td}>
                        <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${
                          o.status === "Selesai" ? "bg-[#e8f7ef] text-[#0a7d43]"
                          : o.status === "Sedang diverifikasi" ? "bg-[#eef2ff] text-[#3730a3]"
                          : "bg-[#fff5e8] text-[#a05a00]"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className={td}>
                        <div className="flex gap-1.5">
                          {o.status !== "Selesai" && (
                            <button
                              onClick={async () => {
                                await supabase.from("orders").update({ status: "Selesai" }).eq("id", o.id);
                                flash("Order diselesaikan");
                                loadAll();
                              }}
                              className="text-xs font-semibold text-[#0a7d43] hover:underline"
                            >
                              Selesaikan
                            </button>
                          )}
                          <button
                            onClick={async () => {
                              await supabase.from("orders").delete().eq("id", o.id);
                              flash("Order dihapus");
                              loadAll();
                            }}
                            className="text-xs font-semibold text-[#ff385c] hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan={6} className={td + " text-center text-[#717171] py-8"}>Belum ada order</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <>
            <section className="card p-4 mb-4">
              <p className="eyebrow mb-3">Tambah Produk</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <input className="field" placeholder="Nama produk" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
                <select className="field" value={np.category} onChange={(e) => setNp({ ...np, category: e.target.value })}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input className="field" type="number" placeholder="Harga mulai" value={np.price || ""} onChange={(e) => setNp({ ...np, price: Number(e.target.value) })} />
                <input className="field" placeholder="Path gambar (/images/...)" value={np.img} onChange={(e) => setNp({ ...np, img: e.target.value })} />
                <input className="field" type="number" placeholder="Rank" value={np.rank} onChange={(e) => setNp({ ...np, rank: Number(e.target.value) })} />
                <input className="field" placeholder="Tags (promo,instant,popular)" value={np.tags} onChange={(e) => setNp({ ...np, tags: e.target.value })} />
              </div>
              <button
                onClick={async () => {
                  if (!np.name) return;
                  const tags = np.tags.split(",").map((t) => t.trim()).filter(Boolean);
                  await supabase.from("products").insert({ ...np, tags });
                  setNp({ name: "", category: "Mobile Games", price: 0, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 99, tags: "" });
                  flash("Produk ditambahkan");
                  loadAll();
                }}
                className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
              >
                Tambah
              </button>
            </section>

            <section className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                    <tr>
                      <th className={th}>Produk</th>
                      <th className={th}>Kategori</th>
                      <th className={th}>Harga</th>
                      <th className={th}>Rank</th>
                      <th className={th}>Status</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#f2f2f2]">
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className={td}>
                          <div className="flex items-center gap-2">
                            <img src={p.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <span className="font-semibold">{p.name}</span>
                          </div>
                        </td>
                        <td className={td + " text-xs"}>{p.category}</td>
                        <td className={td + " font-semibold"}>{rupiah(p.price)}</td>
                        <td className={td}>{p.rank}</td>
                        <td className={td}>
                          <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${p.active ? "bg-[#e8f7ef] text-[#0a7d43]" : "bg-[#f0f0f0] text-[#717171]"}`}>
                            {p.active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className={td}>
                          <div className="flex gap-2 text-xs font-semibold">
                            <button
                              onClick={async () => {
                                await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
                                loadAll();
                              }}
                              className={p.active ? "text-[#a05a00] hover:underline" : "text-[#0a7d43] hover:underline"}
                            >
                              {p.active ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                            <button
                              onClick={async () => {
                                await supabase.from("products").delete().eq("id", p.id);
                                flash("Produk dihapus");
                                loadAll();
                              }}
                              className="text-[#ff385c] hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* DENOMS */}
        {tab === "denoms" && (
          <>
            <section className="card p-4 mb-4">
              <p className="eyebrow mb-3">Tambah Nominal</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input className="field" placeholder="Nama produk (harus sama)" value={nd.product_name} onChange={(e) => setNd({ ...nd, product_name: e.target.value })} />
                <input className="field" placeholder="Label (mis. 86 Diamonds)" value={nd.label} onChange={(e) => setNd({ ...nd, label: e.target.value })} />
                <input className="field" type="number" placeholder="Harga" value={nd.price || ""} onChange={(e) => setNd({ ...nd, price: Number(e.target.value) })} />
                <input className="field" type="number" placeholder="Rank" value={nd.rank} onChange={(e) => setNd({ ...nd, rank: Number(e.target.value) })} />
              </div>
              <button
                onClick={async () => {
                  if (!nd.label || !nd.product_name) return;
                  await supabase.from("denoms").insert(nd);
                  setNd({ product_name: nd.product_name, label: "", price: 0, rank: 99 });
                  flash("Nominal ditambahkan");
                  loadAll();
                }}
                className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
              >
                Tambah
              </button>
            </section>

            <section className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px]">
                  <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                    <tr>
                      <th className={th}>Produk</th>
                      <th className={th}>Label</th>
                      <th className={th}>Harga</th>
                      <th className={th}>Rank</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#f2f2f2]">
                    {denoms.map((d) => (
                      <tr key={d.id}>
                        <td className={td + " text-xs"}>{d.product_name}</td>
                        <td className={td + " font-semibold"}>{d.label}</td>
                        <td className={td}>{rupiah(d.price)}</td>
                        <td className={td}>{d.rank}</td>
                        <td className={td}>
                          <button
                            onClick={async () => {
                              await supabase.from("denoms").delete().eq("id", d.id);
                              flash("Nominal dihapus");
                              loadAll();
                            }}
                            className="text-xs font-semibold text-[#ff385c] hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* PAYS */}
        {tab === "pays" && (
          <>
            <section className="card p-4 mb-4">
              <p className="eyebrow mb-3">Tambah Metode</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <input className="field" placeholder="Label (mis. DANA)" value={npay.label} onChange={(e) => setNpay({ ...npay, label: e.target.value })} />
                <input className="field" placeholder="Jenis (E-wallet, dll)" value={npay.kind} onChange={(e) => setNpay({ ...npay, kind: e.target.value })} />
                <input className="field" type="number" placeholder="Biaya" value={npay.fee} onChange={(e) => setNpay({ ...npay, fee: Number(e.target.value) })} />
                <input className="field" type="number" placeholder="Rank" value={npay.rank} onChange={(e) => setNpay({ ...npay, rank: Number(e.target.value) })} />
              </div>
              <button
                onClick={async () => {
                  if (!npay.label) return;
                  await supabase.from("pays").insert(npay);
                  setNpay({ label: "", kind: "E-wallet", fee: 0, rank: 99 });
                  flash("Metode ditambahkan");
                  loadAll();
                }}
                className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
              >
                Tambah
              </button>
            </section>

            <section className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
                  <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                    <tr>
                      <th className={th}>Metode</th>
                      <th className={th}>Jenis</th>
                      <th className={th}>Biaya</th>
                      <th className={th}>Rank</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#f2f2f2]">
                    {pays.map((y) => (
                      <tr key={y.id}>
                        <td className={td + " font-semibold"}>{y.label}</td>
                        <td className={td + " text-xs"}>{y.kind}</td>
                        <td className={td}>{y.fee ? rupiah(y.fee) : "Gratis"}</td>
                        <td className={td}>{y.rank}</td>
                        <td className={td}>
                          <button
                            onClick={async () => {
                              await supabase.from("pays").delete().eq("id", y.id);
                              flash("Metode dihapus");
                              loadAll();
                            }}
                            className="text-xs font-semibold text-[#ff385c] hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* PROMOS */}
        {tab === "promos" && (
          <>
            <section className="card p-4 mb-4">
              <p className="eyebrow mb-3">Tambah Promo</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                <input className="field mono uppercase" placeholder="Kode (mis. NORYXA10)" value={npr.code} onChange={(e) => setNpr({ ...npr, code: e.target.value.toUpperCase() })} />
                <input className="field" type="number" placeholder="Diskon %" value={npr.disc_pct} onChange={(e) => setNpr({ ...npr, disc_pct: Number(e.target.value) })} />
              </div>
              <button
                onClick={async () => {
                  if (!npr.code) return;
                  await supabase.from("promos").insert(npr);
                  setNpr({ code: "", disc_pct: 10 });
                  flash("Promo ditambahkan");
                  loadAll();
                }}
                className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
              >
                Tambah
              </button>
            </section>

            <section className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                    <tr>
                      <th className={th}>Kode</th>
                      <th className={th}>Diskon</th>
                      <th className={th}>Status</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#f2f2f2]">
                    {promos.map((m) => (
                      <tr key={m.id}>
                        <td className={td + " mono font-bold"}>{m.code}</td>
                        <td className={td}>{m.disc_pct}%</td>
                        <td className={td}>
                          <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${m.active ? "bg-[#e8f7ef] text-[#0a7d43]" : "bg-[#f0f0f0] text-[#717171]"}`}>
                            {m.active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className={td}>
                          <div className="flex gap-2 text-xs font-semibold">
                            <button
                              onClick={async () => {
                                await supabase.from("promos").update({ active: !m.active }).eq("id", m.id);
                                loadAll();
                              }}
                              className={m.active ? "text-[#a05a00] hover:underline" : "text-[#0a7d43] hover:underline"}
                            >
                              {m.active ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                            <button
                              onClick={async () => {
                                await supabase.from("promos").delete().eq("id", m.id);
                                flash("Promo dihapus");
                                loadAll();
                              }}
                              className="text-[#ff385c] hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
