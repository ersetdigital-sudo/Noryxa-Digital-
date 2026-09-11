"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/data";
import { uploadImage } from "@/lib/cloudinary";
import { useSettings } from "@/lib/useSettings";
import type { Denom, Pay, Promo } from "@/lib/catalog";

type Tab = "orders" | "products" | "denoms" | "pays" | "promos" | "settings";

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
const CATEGORIES = ["Mobile Games"];

const shell = "card overflow-hidden";
const panelHead = "bg-[#f7f7f7] px-5 py-3 border-b-2 border-[#eee] flex items-center justify-between gap-3 flex-wrap";
const panelTitle = "text-sm font-bold flex items-center gap-2";
const iconBox = "w-10 h-10 rounded-xl bg-[#f7f7f7] grid place-items-center shrink-0";

export default function AdminPage() {
  const { settings, loaded, updateWhatsApp } = useSettings();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<Tab>("orders");
  const [waInput, setWaInput] = useState("");

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [denoms, setDenoms] = useState<Denom[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0, revenue: 0 });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState("");

  // edit states
  const [editOrder, setEditOrder] = useState<OrderRow | null>(null);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [editDenom, setEditDenom] = useState<Denom | null>(null);
  const [editPay, setEditPay] = useState<Pay | null>(null);
  const [editPromo, setEditPromo] = useState<Promo | null>(null);

  // add states
  const [np, setNp] = useState({ name: "", category: "Mobile Games", price: 0, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 99, tags: "" });
  const [nd, setNd] = useState({ product_name: "Mobile Legends", label: "", price: 0, rank: 99 });
  const [npay, setNpay] = useState({ label: "", kind: "E-wallet", fee: 0, rank: 99, img: "" });
  const [npr, setNpr] = useState({ code: "", disc_pct: 10 });
  const [uploading, setUploading] = useState("");
  const addPayImgRef = useRef<HTMLInputElement>(null);
  const editPayImgRef = useRef<HTMLInputElement>(null);

  const flash = (t: string) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 2500);
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

  useEffect(() => {
    if (loaded) setWaInput(settings.whatsapp);
  }, [loaded, settings.whatsapp]);

  const guard = async (id: string, fn: () => PromiseLike<unknown>, okMsg: string) => {
    setSaving(id);
    try {
      await fn();
      flash(okMsg);
      await loadAll();
    } catch {
      flash("Gagal menyimpan");
    }
    setSaving("");
  };

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
            onClick={() => (pass === ADMIN_PASS ? setAuthed(true) : flash("Password salah"))}
            className="w-full bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full py-3"
          >
            Masuk
          </button>
          {msg && <p className="text-sm text-[#ff385c] font-semibold mt-3 text-center">{msg}</p>}
        </div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "Orders", icon: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path><path d="M9 7h6M9 11h6M9 15h4"></path></> },
    { id: "products", label: "Produk", icon: <><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z"></path><path d="m3.3 7 8.7 5 8.7-5M12 22V12"></path></> },
    { id: "denoms", label: "Nominal", icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path> },
    { id: "pays", label: "Pembayaran", icon: <><rect x="2" y="5" width="20" height="14" rx="3"></rect><path d="M2 10h20"></path></> },
    { id: "promos", label: "Promo", icon: <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"></path><path d="M14 6v12"></path></> },
    { id: "settings", label: "Settings", icon: <><circle cx="12" cy="12" r="3"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></> },
  ];

  const th = "text-left text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wider px-3 py-2";
  const td = "px-3 py-2.5 text-sm";

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      {/* HEADER (wireframe style: avatar + user + logout) */}
      <header className="sticky top-0 z-30 bg-white border-b-2 border-[#eee]">
        <div className="max-w-[1180px] mx-auto h-16 flex items-center gap-3 px-4 sm:px-6">
          <div className="w-9 h-9 rounded-full bg-[#111318] grid place-items-center shrink-0">
            <svg className="ico w-4 h-4 text-white" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4"></circle>
              <path d="M4 21a8 8 0 0 1 16 0"></path>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">Admin Noryxa</p>
            <p className="text-[11px] text-[#717171] truncate">Kelola store & order</p>
          </div>
          <button
            onClick={() => setAuthed(false)}
            className="ml-auto text-sm font-bold text-[#ff385c] hover:bg-[#fff5f7] px-3 py-1.5 rounded-lg transition"
          >
            <span className="inline-flex items-center gap-1.5">
              <svg className="ico w-4 h-4" viewBox="0 0 24 24">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <path d="M10 17l5-5-5-5M15 12H3"></path>
              </svg>
              <span className="hidden sm:inline">Keluar</span>
            </span>
          </button>
        </div>

        {/* SECTION TABS (wireframe style: horizontal, border-b aktif) */}
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 border-t border-[#eee] flex gap-1 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm flex items-center gap-2 border-b-2 transition ${
                tab === t.id
                  ? "font-bold text-[#ff385c] border-[#111318]"
                  : "font-medium text-[#717171] border-transparent hover:text-[#ff385c]"
              }`}
            >
              <svg className="ico w-4 h-4" viewBox="0 0 24 24">{t.icon}</svg>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 pb-16">
        {/* OVERVIEW STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path><path d="M9 7h6M9 11h6M9 15h4"></path></>, label: "Total Order", value: String(stats.total) },
            { icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>, label: "Menunggu Bayar", value: String(stats.pending) },
            { icon: <path d="M20 6 9 17l-5-5"></path>, label: "Selesai", value: String(stats.done) },
            { icon: <><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"></path><path d="M14 6v12"></path></>, label: "Revenue (Selesai)", value: rupiah(stats.revenue) },
          ].map((s) => (
            <div key={s.label} className="card p-5">
              <div className={iconBox + " mb-3"}>
                <svg className="ico w-5 h-5 text-[#ff385c]" viewBox="0 0 24 24">{s.icon}</svg>
              </div>
              <p className="display text-2xl font-black">{s.value}</p>
              <p className="text-xs text-[#717171] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {msg && (
          <p className="text-sm text-[#0a7d43] font-semibold mb-4 bg-[#e8f7ef] rounded-xl px-4 py-2.5">{msg}</p>
        )}

        {/* ============ ORDERS ============ */}
        {tab === "orders" && (
          <section className={shell}>
            <div className={panelHead}>
              <h2 className={panelTitle}>
                <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path><path d="M9 7h6M9 11h6M9 15h4"></path></svg>
                SEMUA ORDER
              </h2>
              <span className="text-xs text-[#717171]">{orders.length} order</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
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
                    <tr key={o.id} className="hover:bg-[#fafafa] transition">
                      <td className={td + " mono font-semibold"}>{o.inv}</td>
                      <td className={td}>
                        {editOrder?.id === o.id ? (
                          <div className="flex flex-col gap-1.5 min-w-[180px]">
                            <input className="field !py-1.5 !px-2.5 text-xs" value={editOrder.product} onChange={(e) => setEditOrder({ ...editOrder, product: e.target.value })} />
                            <input className="field !py-1.5 !px-2.5 text-xs" value={editOrder.denom} onChange={(e) => setEditOrder({ ...editOrder, denom: e.target.value })} />
                          </div>
                        ) : (
                          <>
                            <p className="font-semibold">{o.product}</p>
                            <p className="text-xs text-[#717171]">{o.denom}</p>
                          </>
                        )}
                      </td>
                      <td className={td}>
                        {editOrder?.id === o.id ? (
                          <input className="field !py-1.5 !px-2.5 text-xs mono w-24" value={editOrder.uid} onChange={(e) => setEditOrder({ ...editOrder, uid: e.target.value })} />
                        ) : (
                          <span className="mono text-xs">{o.uid}</span>
                        )}
                      </td>
                      <td className={td}>
                        {editOrder?.id === o.id ? (
                          <input type="number" className="field !py-1.5 !px-2.5 text-xs w-24" value={editOrder.total} onChange={(e) => setEditOrder({ ...editOrder, total: Number(e.target.value) })} />
                        ) : (
                          <span className="font-semibold">{rupiah(o.total)}</span>
                        )}
                      </td>
                      <td className={td}>
                        {editOrder?.id === o.id ? (
                          <select className="field !py-1.5 !px-2.5 text-xs" value={editOrder.status} onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}>
                            <option>Menunggu pembayaran</option>
                            <option>Sedang diverifikasi</option>
                            <option>Selesai</option>
                          </select>
                        ) : (
                          <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${
                            o.status === "Selesai" ? "bg-[#e8f7ef] text-[#0a7d43]"
                            : o.status === "Sedang diverifikasi" ? "bg-[#eef2ff] text-[#3730a3]"
                            : "bg-[#fff5e8] text-[#a05a00]"
                          }`}>
                            {o.status}
                          </span>
                        )}
                      </td>
                      <td className={td}>
                        {editOrder?.id === o.id ? (
                          <div className="flex gap-1.5">
                            <button
                              disabled={saving === o.id}
                              onClick={() => guard(o.id, async () => {
                                const { id, inv, product, denom, uid, pay, total, status } = editOrder;
                                await supabase.from("orders").update({ inv, product, denom, uid, pay, total, status }).eq("id", id);
                                setEditOrder(null);
                              }, "Order diperbarui")}
                              className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-full px-3 py-1.5 transition"
                            >
                              Simpan
                            </button>
                            <button onClick={() => setEditOrder(null)} className="text-xs font-semibold text-[#717171] hover:text-[#111] px-2">
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 text-xs font-semibold">
                            <button onClick={() => setEditOrder(o)} className="text-[#3730a3] hover:underline">Edit</button>
                            {o.status !== "Selesai" && (
                              <button
                                onClick={() => guard(o.id, () => supabase.from("orders").update({ status: "Selesai" }).eq("id", o.id), "Order diselesaikan")}
                                className="text-[#0a7d43] hover:underline"
                              >
                                Selesaikan
                              </button>
                            )}
                            <button
                              onClick={() => guard(o.id, () => supabase.from("orders").delete().eq("id", o.id), "Order dihapus")}
                              className="text-[#ff385c] hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        )}
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

        {/* ============ PRODUK ============ */}
        {tab === "products" && (
          <>
            <section className={shell + " mb-4"}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                  TAMBAH PRODUK
                </h2>
              </div>
              <div className="p-5">
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
                  onClick={() => guard("add-product", async () => {
                    if (!np.name) throw new Error("nama kosong");
                    const tags = np.tags.split(",").map((t) => t.trim()).filter(Boolean);
                    await supabase.from("products").insert({ ...np, tags });
                    setNp({ name: "", category: "Mobile Games", price: 0, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 99, tags: "" });
                  }, "Produk ditambahkan")}
                  className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
                >
                  Tambah Produk
                </button>
              </div>
            </section>

            <section className={shell}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z"></path></svg>
                  SEMUA PRODUK ({products.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                    <tr>
                      <th className={th}>Produk</th>
                      <th className={th}>Kategori</th>
                      <th className={th}>Harga</th>
                      <th className={th}>Rank</th>
                      <th className={th}>Tags</th>
                      <th className={th}>Status</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#f2f2f2]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#fafafa] transition">
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <div className="flex items-center gap-2">
                              <img src={editProduct.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              <div className="flex flex-col gap-1.5 min-w-[160px]">
                                <input className="field !py-1.5 !px-2.5 text-xs" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
                                <input className="field !py-1.5 !px-2.5 text-xs" placeholder="/images/..." value={editProduct.img} onChange={(e) => setEditProduct({ ...editProduct, img: e.target.value })} />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <img src={p.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                              <span className="font-semibold">{p.name}</span>
                            </div>
                          )}
                        </td>
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <select className="field !py-1.5 !px-2.5 text-xs" value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                          ) : (
                            <span className="text-xs">{p.category}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-24" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} />
                          ) : (
                            <span className="font-semibold">{rupiah(p.price)}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-16" value={editProduct.rank} onChange={(e) => setEditProduct({ ...editProduct, rank: Number(e.target.value) })} />
                          ) : (
                            p.rank
                          )}
                        </td>
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <input className="field !py-1.5 !px-2.5 text-xs w-28" placeholder="promo,instant" value={editProduct.tags.join(",")} onChange={(e) => setEditProduct({ ...editProduct, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {p.tags?.map((t) => (
                                <span key={t} className="text-[10px] font-bold bg-[#f0f0f0] rounded-full px-2 py-0.5">{t}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                              <input type="checkbox" className="accent-[#ff385c] w-4 h-4" checked={editProduct.active} onChange={(e) => setEditProduct({ ...editProduct, active: e.target.checked })} />
                              Aktif
                            </label>
                          ) : (
                            <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${p.active ? "bg-[#e8f7ef] text-[#0a7d43]" : "bg-[#f0f0f0] text-[#717171]"}`}>
                              {p.active ? "Aktif" : "Nonaktif"}
                            </span>
                          )}
                        </td>
                        <td className={td}>
                          {editProduct?.id === p.id ? (
                            <div className="flex gap-1.5">
                              <button
                                disabled={saving === p.id}
                                onClick={() => guard(p.id, async () => {
                                  await supabase.from("products").update(editProduct).eq("id", p.id);
                                  setEditProduct(null);
                                }, "Produk diperbarui")}
                                className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-full px-3 py-1.5 transition"
                              >
                                Simpan
                              </button>
                              <button onClick={() => setEditProduct(null)} className="text-xs font-semibold text-[#717171] hover:text-[#111] px-2">Batal</button>
                            </div>
                          ) : (
                            <div className="flex gap-2 text-xs font-semibold">
                              <button onClick={() => setEditProduct(p)} className="text-[#3730a3] hover:underline">Edit</button>
                              <button
                                onClick={() => guard(p.id, () => supabase.from("products").update({ active: !p.active }).eq("id", p.id), p.active ? "Produk dinonaktifkan" : "Produk diaktifkan")}
                                className={p.active ? "text-[#a05a00] hover:underline" : "text-[#0a7d43] hover:underline"}
                              >
                                {p.active ? "Nonaktif" : "Aktifkan"}
                              </button>
                              <button
                                onClick={() => guard(p.id, () => supabase.from("products").delete().eq("id", p.id), "Produk dihapus")}
                                className="text-[#ff385c] hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ============ NOMINAL ============ */}
        {tab === "denoms" && (
          <>
            <section className={shell + " mb-4"}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                  TAMBAH NOMINAL
                </h2>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <input className="field" placeholder="Nama produk (key)" value={nd.product_name} onChange={(e) => setNd({ ...nd, product_name: e.target.value })} />
                  <input className="field" placeholder="Label (mis. 86 Diamonds)" value={nd.label} onChange={(e) => setNd({ ...nd, label: e.target.value })} />
                  <input className="field" type="number" placeholder="Harga" value={nd.price || ""} onChange={(e) => setNd({ ...nd, price: Number(e.target.value) })} />
                  <input className="field" type="number" placeholder="Rank" value={nd.rank} onChange={(e) => setNd({ ...nd, rank: Number(e.target.value) })} />
                </div>
                <button
                  onClick={() => guard("add-denom", async () => {
                    if (!nd.label || !nd.product_name) throw new Error("kosong");
                    await supabase.from("denoms").insert(nd);
                    setNd({ product_name: nd.product_name, label: "", price: 0, rank: 99 });
                  }, "Nominal ditambahkan")}
                  className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
                >
                  Tambah Nominal
                </button>
              </div>
            </section>

            <section className={shell}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  SEMUA NOMINAL ({denoms.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
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
                      <tr key={d.id} className="hover:bg-[#fafafa] transition">
                        <td className={td}>
                          {editDenom?.id === d.id ? (
                            <input className="field !py-1.5 !px-2.5 text-xs w-32" value={editDenom.product_name} onChange={(e) => setEditDenom({ ...editDenom, product_name: e.target.value })} />
                          ) : (
                            <span className="text-xs">{d.product_name}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editDenom?.id === d.id ? (
                            <input className="field !py-1.5 !px-2.5 text-xs w-36" value={editDenom.label} onChange={(e) => setEditDenom({ ...editDenom, label: e.target.value })} />
                          ) : (
                            <span className="font-semibold">{d.label}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editDenom?.id === d.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-24" value={editDenom.price} onChange={(e) => setEditDenom({ ...editDenom, price: Number(e.target.value) })} />
                          ) : (
                            rupiah(d.price)
                          )}
                        </td>
                        <td className={td}>
                          {editDenom?.id === d.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-16" value={editDenom.rank} onChange={(e) => setEditDenom({ ...editDenom, rank: Number(e.target.value) })} />
                          ) : (
                            d.rank
                          )}
                        </td>
                        <td className={td}>
                          {editDenom?.id === d.id ? (
                            <div className="flex gap-1.5">
                              <button
                                disabled={saving === d.id}
                                onClick={() => guard(d.id, async () => {
                                  await supabase.from("denoms").update(editDenom).eq("id", d.id);
                                  setEditDenom(null);
                                }, "Nominal diperbarui")}
                                className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-full px-3 py-1.5 transition"
                              >
                                Simpan
                              </button>
                              <button onClick={() => setEditDenom(null)} className="text-xs font-semibold text-[#717171] hover:text-[#111] px-2">Batal</button>
                            </div>
                          ) : (
                            <div className="flex gap-2 text-xs font-semibold">
                              <button onClick={() => setEditDenom(d)} className="text-[#3730a3] hover:underline">Edit</button>
                              <button
                                onClick={() => guard(d.id, () => supabase.from("denoms").delete().eq("id", d.id), "Nominal dihapus")}
                                className="text-[#ff385c] hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ============ PEMBAYARAN ============ */}
        {tab === "pays" && (
          <>
            <section className={shell + " mb-4"}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                  TAMBAH METODE
                </h2>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <input className="field" placeholder="Label (mis. QRIS)" value={npay.label} onChange={(e) => setNpay({ ...npay, label: e.target.value })} />
                  <input className="field" placeholder="Jenis (E-wallet, dll)" value={npay.kind} onChange={(e) => setNpay({ ...npay, kind: e.target.value })} />
                  <input className="field" type="number" placeholder="Biaya" value={npay.fee} onChange={(e) => setNpay({ ...npay, fee: Number(e.target.value) })} />
                  <input className="field" type="number" placeholder="Rank" value={npay.rank} onChange={(e) => setNpay({ ...npay, rank: Number(e.target.value) })} />
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => addPayImgRef.current?.click()}
                      disabled={uploading === "add"}
                      className="shrink-0 border-2 border-[#eee] hover:border-[#ff385c] rounded-xl px-4 py-2.5 text-xs font-bold text-[#717171] hover:text-[#ff385c] transition"
                    >
                      {uploading === "add" ? "Uploading…" : npay.img ? "Ganti Gambar" : "Upload QRIS/Gambar"}
                    </button>
                    {npay.img && <img src={npay.img} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-[#eee]" />}
                  </div>
                  <input
                    ref={addPayImgRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      setUploading("add");
                      const url = await uploadImage(f);
                      if (url) setNpay((p) => ({ ...p, img: url }));
                      setUploading("");
                      e.target.value = "";
                    }}
                  />
                </div>
                {npay.img && <p className="text-[11px] text-[#0a7d43] font-semibold mt-2">Gambar siap disimpan bersama metode.</p>}
                <button
                  onClick={() => guard("add-pay", async () => {
                    if (!npay.label) throw new Error("kosong");
                    await supabase.from("pays").insert(npay);
                    setNpay({ label: "", kind: "E-wallet", fee: 0, rank: 99, img: "" });
                  }, "Metode ditambahkan")}
                  className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
                >
                  Tambah Metode
                </button>
              </div>
            </section>

            <section className={shell}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="3"></rect><path d="M2 10h20"></path></svg>
                  SEMUA METODE ({pays.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="border-b-2 border-[#eee] bg-[#fafafa]">
                    <tr>
                      <th className={th}>Metode</th>
                      <th className={th}>Gambar</th>
                      <th className={th}>Jenis</th>
                      <th className={th}>Biaya</th>
                      <th className={th}>Rank</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-[#f2f2f2]">
                    {pays.map((y) => (
                      <tr key={y.id} className="hover:bg-[#fafafa] transition">
                        <td className={td}>
                          {editPay?.id === y.id ? (
                            <input className="field !py-1.5 !px-2.5 text-xs w-36" value={editPay.label} onChange={(e) => setEditPay({ ...editPay, label: e.target.value })} />
                          ) : (
                            <span className="font-semibold">{y.label}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editPay?.id === y.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => editPayImgRef.current?.click()}
                                disabled={uploading === y.id}
                                className="text-xs font-bold text-[#ff385c] hover:underline whitespace-nowrap"
                              >
                                {uploading === y.id ? "Uploading…" : editPay.img ? "Ganti" : "Upload"}
                              </button>
                              {editPay.img && <img src={editPay.img} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-[#eee]" />}
                              <input
                                ref={editPayImgRef}
                                type="file"
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0];
                                  if (!f || !editPay) return;
                                  setUploading(y.id);
                                  const url = await uploadImage(f);
                                  if (url) setEditPay({ ...editPay, img: url });
                                  setUploading("");
                                  e.target.value = "";
                                }}
                              />
                            </div>
                          ) : y.img ? (
                            <img src={y.img} alt={y.label} className="w-10 h-10 rounded-lg object-cover border-2 border-[#eee]" />
                          ) : (
                            <span className="text-xs text-[#c9c9c9]">—</span>
                          )}
                        </td>
                        <td className={td}>
                          {editPay?.id === y.id ? (
                            <input className="field !py-1.5 !px-2.5 text-xs w-32" value={editPay.kind} onChange={(e) => setEditPay({ ...editPay, kind: e.target.value })} />
                          ) : (
                            <span className="text-xs">{y.kind}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editPay?.id === y.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-20" value={editPay.fee} onChange={(e) => setEditPay({ ...editPay, fee: Number(e.target.value) })} />
                          ) : (
                            y.fee ? rupiah(y.fee) : "Gratis"
                          )}
                        </td>
                        <td className={td}>
                          {editPay?.id === y.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-16" value={editPay.rank} onChange={(e) => setEditPay({ ...editPay, rank: Number(e.target.value) })} />
                          ) : (
                            y.rank
                          )}
                        </td>
                        <td className={td}>
                          {editPay?.id === y.id ? (
                            <div className="flex gap-1.5">
                              <button
                                disabled={saving === y.id}
                                onClick={() => guard(y.id, async () => {
                                  await supabase.from("pays").update(editPay).eq("id", y.id);
                                  setEditPay(null);
                                }, "Metode diperbarui")}
                                className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-full px-3 py-1.5 transition"
                              >
                                Simpan
                              </button>
                              <button onClick={() => setEditPay(null)} className="text-xs font-semibold text-[#717171] hover:text-[#111] px-2">Batal</button>
                            </div>
                          ) : (
                            <div className="flex gap-2 text-xs font-semibold">
                              <button onClick={() => setEditPay(y)} className="text-[#3730a3] hover:underline">Edit</button>
                              <button
                                onClick={() => guard(y.id, () => supabase.from("pays").delete().eq("id", y.id), "Metode dihapus")}
                                className="text-[#ff385c] hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ============ PROMO ============ */}
        {tab === "promos" && (
          <>
            <section className={shell + " mb-4"}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
                  TAMBAH PROMO
                </h2>
              </div>
              <div className="p-5">
                <div className="grid sm:grid-cols-2 gap-2.5 max-w-md">
                  <input className="field mono uppercase" placeholder="Kode (mis. NORYXA10)" value={npr.code} onChange={(e) => setNpr({ ...npr, code: e.target.value.toUpperCase() })} />
                  <input className="field" type="number" placeholder="Diskon %" value={npr.disc_pct} onChange={(e) => setNpr({ ...npr, disc_pct: Number(e.target.value) })} />
                </div>
                <button
                  onClick={() => guard("add-promo", async () => {
                    if (!npr.code) throw new Error("kosong");
                    await supabase.from("promos").insert(npr);
                    setNpr({ code: "", disc_pct: 10 });
                  }, "Promo ditambahkan")}
                  className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5"
                >
                  Tambah Promo
                </button>
              </div>
            </section>

            <section className={shell}>
              <div className={panelHead}>
                <h2 className={panelTitle}>
                  <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"></path></svg>
                  SEMUA PROMO ({promos.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px]">
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
                      <tr key={m.id} className="hover:bg-[#fafafa] transition">
                        <td className={td}>
                          {editPromo?.id === m.id ? (
                            <input className="field !py-1.5 !px-2.5 text-xs mono uppercase w-32" value={editPromo.code} onChange={(e) => setEditPromo({ ...editPromo, code: e.target.value.toUpperCase() })} />
                          ) : (
                            <span className="mono font-bold">{m.code}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editPromo?.id === m.id ? (
                            <input type="number" className="field !py-1.5 !px-2.5 text-xs w-16" value={editPromo.disc_pct} onChange={(e) => setEditPromo({ ...editPromo, disc_pct: Number(e.target.value) })} />
                          ) : (
                            `${m.disc_pct}%`
                          )}
                        </td>
                        <td className={td}>
                          {editPromo?.id === m.id ? (
                            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                              <input type="checkbox" className="accent-[#ff385c] w-4 h-4" checked={editPromo.active} onChange={(e) => setEditPromo({ ...editPromo, active: e.target.checked })} />
                              Aktif
                            </label>
                          ) : (
                            <span className={`text-[11px] font-bold rounded-full px-2 py-1 ${m.active ? "bg-[#e8f7ef] text-[#0a7d43]" : "bg-[#f0f0f0] text-[#717171]"}`}>
                              {m.active ? "Aktif" : "Nonaktif"}
                            </span>
                          )}
                        </td>
                        <td className={td}>
                          {editPromo?.id === m.id ? (
                            <div className="flex gap-1.5">
                              <button
                                disabled={saving === m.id}
                                onClick={() => guard(m.id, async () => {
                                  await supabase.from("promos").update(editPromo).eq("id", m.id);
                                  setEditPromo(null);
                                }, "Promo diperbarui")}
                                className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-full px-3 py-1.5 transition"
                              >
                                Simpan
                              </button>
                              <button onClick={() => setEditPromo(null)} className="text-xs font-semibold text-[#717171] hover:text-[#111] px-2">Batal</button>
                            </div>
                          ) : (
                            <div className="flex gap-2 text-xs font-semibold">
                              <button onClick={() => setEditPromo(m)} className="text-[#3730a3] hover:underline">Edit</button>
                              <button
                                onClick={() => guard(m.id, () => supabase.from("promos").update({ active: !m.active }).eq("id", m.id), m.active ? "Promo dinonaktifkan" : "Promo diaktifkan")}
                                className={m.active ? "text-[#a05a00] hover:underline" : "text-[#0a7d43] hover:underline"}
                              >
                                {m.active ? "Nonaktif" : "Aktifkan"}
                              </button>
                              <button
                                onClick={() => guard(m.id, () => supabase.from("promos").delete().eq("id", m.id), "Promo dihapus")}
                                className="text-[#ff385c] hover:underline"
                              >
                                Hapus
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ============ SETTINGS ============ */}
        {tab === "settings" && (
          <section className={shell}>
            <div className={panelHead}>
              <h2 className={panelTitle}>
                <svg className="ico w-4 h-4 text-[#ff385c]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
                Pengaturan Umum
              </h2>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <label className="text-sm font-bold text-[#111318] block mb-2">Nomor WhatsApp CS</label>
                <p className="text-xs text-[#717171] mb-3">Nomor ini digunakan di semua tombol &quot;Hubungi CS&quot; di seluruh halaman.</p>
                <div className="flex gap-3 max-w-md">
                  <input
                    className="field flex-1 mono"
                    placeholder="6281234567890"
                    value={waInput}
                    onChange={(e) => setWaInput(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      updateWhatsApp(waInput);
                      flash("Nomor WhatsApp disimpan");
                    }}
                    className="bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-6 py-2.5 shrink-0"
                  >
                    Simpan
                  </button>
                </div>
                <p className="text-xs text-[#717171] mt-2">
                  Saat ini: <span className="mono font-semibold text-[#111318]">{settings.whatsapp}</span>
                </p>
                <p className="text-xs text-[#9a9a9a] mt-1">
                  Link: <span className="mono">{`https://wa.me/${settings.whatsapp}`}</span>
                </p>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
