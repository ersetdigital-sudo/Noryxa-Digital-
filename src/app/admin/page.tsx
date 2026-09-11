"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { rupiah } from "@/lib/data";
import { uploadImage } from "@/lib/cloudinary";
import { useSettings } from "@/lib/useSettings";
import RupiahInput from "@/components/RupiahInput";
import type { Denom, Pay, Promo } from "@/lib/catalog";

type Tab = "overview" | "orders" | "products" | "denoms" | "pays" | "promos" | "settings";

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

export default function AdminPage() {
  const { settings, loaded, updateWhatsApp } = useSettings();
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("noryxa_admin") === "1";
  });
  const [pass, setPass] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [waInput, setWaInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [denoms, setDenoms] = useState<Denom[]>([]);
  const [pays, setPays] = useState<Pay[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, done: 0, revenue: 0 });
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState("");

  const [editOrder, setEditOrder] = useState<OrderRow | null>(null);
  const [editProduct, setEditProduct] = useState<ProductRow | null>(null);
  const [editDenom, setEditDenom] = useState<Denom | null>(null);
  const [editPay, setEditPay] = useState<Pay | null>(null);
  const [editPromo, setEditPromo] = useState<Promo | null>(null);

  const [np, setNp] = useState({ name: "", category: "Mobile Games", price: 0, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 99, tags: "" });
  const [nd, setNd] = useState({ product_name: "Mobile Legends", label: "", price: 0, rank: 99 });
  const [denomGame, setDenomGame] = useState("Mobile Legends");
  const [npay, setNpay] = useState({ label: "", kind: "E-wallet", fee: 0, rank: 99, img: "" });
  const [npr, setNpr] = useState({ code: "", disc_pct: 10 });
  const [uploading, setUploading] = useState("");
  const addPayImgRef = useRef<HTMLInputElement>(null);
  const editPayImgRef = useRef<HTMLInputElement>(null);

  const flash = (t: string) => { setMsg(t); setTimeout(() => setMsg(""), 2500); };

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

  useEffect(() => { if (authed) loadAll(); }, [authed, loadAll]);
  useEffect(() => { if (loaded) setWaInput(settings.whatsapp); }, [loaded, settings.whatsapp]);

  const guard = async (id: string, fn: () => PromiseLike<unknown>, okMsg: string) => {
    setSaving(id);
    try { await fn(); flash(okMsg); await loadAll(); } catch { flash("Gagal menyimpan"); }
    setSaving("");
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] grid place-items-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#ff385c] grid place-items-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <h1 className="text-white text-2xl font-black tracking-tight">NORYXA</h1>
            <p className="text-white/40 text-sm mt-1">Admin Dashboard</p>
          </div>
          <div className="bg-[#141414] rounded-2xl border border-white/10 p-6">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#ff385c] transition mb-3"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && pass === ADMIN_PASS) { sessionStorage.setItem("noryxa_admin", "1"); setAuthed(true); } }}
            />
            <button
              onClick={() => { if (pass === ADMIN_PASS) { sessionStorage.setItem("noryxa_admin", "1"); setAuthed(true); } else { flash("Password salah"); } }}
              className="w-full bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-bold rounded-xl py-3"
            >
              Masuk
            </button>
            {msg && <p className="text-sm text-[#ff385c] font-semibold mt-3 text-center">{msg}</p>}
          </div>
        </div>
      </div>
    );
  }

  const NAV = [
    { id: "overview" as Tab, label: "Overview", icon: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path> },
    { id: "orders" as Tab, label: "Orders", icon: <><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path><path d="M9 7h6M9 11h6M9 15h4"></path></> },
    { id: "products" as Tab, label: "Produk", icon: <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8Z"></path> },
    { id: "denoms" as Tab, label: "Nominal", icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path> },
    { id: "pays" as Tab, label: "Pembayaran", icon: <><rect x="2" y="5" width="20" height="14" rx="3"></rect><path d="M2 10h20"></path></> },
    { id: "promos" as Tab, label: "Promo", icon: <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></> },
    { id: "settings" as Tab, label: "Settings", icon: <><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></> },
  ];

  const th = "text-left text-[11px] font-bold text-[#9a9a9a] uppercase tracking-wider px-4 py-3";
  const td = "px-4 py-3 text-sm";

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-[260px] shrink-0 flex-col bg-[#0a0a0a] text-white">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-[#ff385c] grid place-items-center shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">NORYXA</p>
            <p className="text-[11px] text-white/40">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setTab(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                tab === n.id ? "bg-[#ff385c] text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
              {n.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button onClick={() => { sessionStorage.removeItem("noryxa_admin"); setAuthed(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* TOP BAR */}
        <header className="h-16 bg-white border-b border-[#e5e5e5] flex items-center gap-4 px-4 sm:px-6 shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-9 h-9 rounded-lg border border-[#e5e5e5] grid place-items-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18"></path></svg>
          </button>
          <h1 className="font-bold text-[#111] text-sm sm:text-base">{NAV.find((n) => n.id === tab)?.label}</h1>
          <div className="ml-auto flex items-center gap-3">
            <a href="/" target="_blank" className="text-xs font-semibold text-[#717171] hover:text-[#ff385c] transition flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Lihat Situs
            </a>
            <div className="w-8 h-8 rounded-full bg-[#111] grid place-items-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        </header>

        {/* MOBILE NAV */}
        {sidebarOpen && (
          <div className="lg:hidden bg-white border-b border-[#e5e5e5] px-4 py-2 flex gap-1 overflow-x-auto">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => { setTab(n.id); setSidebarOpen(false); }}
                className={`whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold transition ${
                  tab === n.id ? "bg-[#ff385c] text-white" : "bg-[#f5f5f5] text-[#717171]"
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {msg && (
            <div className="mb-4 bg-[#0a7d43] text-white text-sm font-semibold rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"></path></svg>
              {msg}
            </div>
          )}

          {/* ============ OVERVIEW ============ */}
          {tab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Order", value: String(stats.total), color: "bg-blue-500", icon: <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path> },
                  { label: "Pending", value: String(stats.pending), color: "bg-amber-500", icon: <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path> },
                  { label: "Selesai", value: String(stats.done), color: "bg-emerald-500", icon: <path d="M20 6L9 17l-5-5"></path> },
                  { label: "Revenue", value: rupiah(stats.revenue), color: "bg-[#ff385c]", icon: <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></> },
                ].map((s) => (
                  <div key={s.label} className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                    <div className={`w-10 h-10 rounded-xl ${s.color} grid place-items-center mb-3`}>
                      <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                    </div>
                    <p className="text-2xl font-black text-[#111] tracking-tight">{s.value}</p>
                    <p className="text-xs text-[#9a9a9a] mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#111]">Order Terbaru</h3>
                  <button onClick={() => setTab("orders")} className="text-xs font-semibold text-[#ff385c] hover:underline">Lihat Semua</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#fafafa]">
                      <tr>
                        <th className={th}>Invoice</th>
                        <th className={th}>Produk</th>
                        <th className={th}>Total</th>
                        <th className={th}>Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {orders.slice(0, 5).map((o) => (
                        <tr key={o.id} className="hover:bg-[#fafafa]">
                          <td className={td + " font-mono font-semibold text-[#111]"}>{o.inv}</td>
                          <td className={td}>
                            <p className="font-semibold text-[#111]">{o.product}</p>
                            <p className="text-xs text-[#9a9a9a]">{o.denom}</p>
                          </td>
                          <td className={td + " font-semibold"}>{rupiah(o.total)}</td>
                          <td className={td}>
                            <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${
                              o.status === "Selesai" ? "bg-emerald-50 text-emerald-600"
                              : o.status === "Sedang diverifikasi" ? "bg-blue-50 text-blue-600"
                              : "bg-amber-50 text-amber-600"
                            }`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr><td colSpan={4} className={td + " text-center text-[#9a9a9a] py-8"}>Belum ada order</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ ORDERS ============ */}
          {tab === "orders" && (
            <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#111]">Semua Order ({orders.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-[#fafafa]">
                    <tr>
                      <th className={th}>Invoice</th>
                      <th className={th}>Produk</th>
                      <th className={th}>User ID</th>
                      <th className={th}>Total</th>
                      <th className={th}>Status</th>
                      <th className={th}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0f0]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#fafafa]">
                        <td className={td + " font-mono font-semibold"}>{o.inv}</td>
                        <td className={td}>
                          {editOrder?.id === o.id ? (
                            <div className="flex flex-col gap-1.5 min-w-[180px]">
                              <input className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff385c]" value={editOrder.product} onChange={(e) => setEditOrder({ ...editOrder, product: e.target.value })} />
                              <input className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff385c]" value={editOrder.denom} onChange={(e) => setEditOrder({ ...editOrder, denom: e.target.value })} />
                            </div>
                          ) : (
                            <><p className="font-semibold">{o.product}</p><p className="text-xs text-[#9a9a9a]">{o.denom}</p></>
                          )}
                        </td>
                        <td className={td}>
                          {editOrder?.id === o.id ? (
                            <input className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs font-mono w-24 focus:outline-none focus:border-[#ff385c]" value={editOrder.uid} onChange={(e) => setEditOrder({ ...editOrder, uid: e.target.value })} />
                          ) : <span className="font-mono text-xs">{o.uid}</span>}
                        </td>
                        <td className={td}>
                          {editOrder?.id === o.id ? (
                            <input type="number" className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs w-24 focus:outline-none focus:border-[#ff385c]" value={editOrder.total} onChange={(e) => setEditOrder({ ...editOrder, total: Number(e.target.value) })} />
                          ) : <span className="font-semibold">{rupiah(o.total)}</span>}
                        </td>
                        <td className={td}>
                          {editOrder?.id === o.id ? (
                            <select className="bg-white border border-[#e5e5e5] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#ff385c]" value={editOrder.status} onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}>
                              <option>Menunggu pembayaran</option>
                              <option>Sedang diverifikasi</option>
                              <option>Selesai</option>
                            </select>
                          ) : (
                            <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${
                              o.status === "Selesai" ? "bg-emerald-50 text-emerald-600"
                              : o.status === "Sedang diverifikasi" ? "bg-blue-50 text-blue-600"
                              : "bg-amber-50 text-amber-600"
                            }`}>{o.status}</span>
                          )}
                        </td>
                        <td className={td}>
                          {editOrder?.id === o.id ? (
                            <div className="flex gap-1.5">
                              <button disabled={saving === o.id} onClick={() => guard(o.id, async () => {
                                const { id, inv, product, denom, uid, pay, total, status } = editOrder;
                                await supabase.from("orders").update({ inv, product, denom, uid, pay, total, status }).eq("id", id);
                                setEditOrder(null);
                              }, "Order diperbarui")} className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-lg px-3 py-1.5 transition">Simpan</button>
                              <button onClick={() => setEditOrder(null)} className="text-xs font-semibold text-[#9a9a9a] hover:text-[#111] px-2">Batal</button>
                            </div>
                          ) : (
                            <div className="flex gap-2 text-xs font-semibold">
                              <button onClick={() => setEditOrder(o)} className="text-blue-600 hover:underline">Edit</button>
                              {o.status !== "Selesai" && <button onClick={() => guard(o.id, () => supabase.from("orders").update({ status: "Selesai" }).eq("id", o.id), "Selesai")} className="text-emerald-600 hover:underline">Done</button>}
                              <button onClick={() => guard(o.id, () => supabase.from("orders").delete().eq("id", o.id), "Hapus")} className="text-[#ff385c] hover:underline">Hapus</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && <tr><td colSpan={6} className={td + " text-center text-[#9a9a9a] py-8"}>Belum ada order</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============ PRODUCTS ============ */}
          {tab === "products" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                <h3 className="font-bold text-sm text-[#111] mb-3">Tambah Produk</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" placeholder="Nama produk" value={np.name} onChange={(e) => setNp({ ...np, name: e.target.value })} />
                  <select className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" value={np.category} onChange={(e) => setNp({ ...np, category: e.target.value })}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <RupiahInput value={np.price} onChange={(n) => setNp({ ...np, price: n })} placeholder="Harga mulai" />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" placeholder="Path gambar" value={np.img} onChange={(e) => setNp({ ...np, img: e.target.value })} />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" type="number" placeholder="Rank" value={np.rank} onChange={(e) => setNp({ ...np, rank: Number(e.target.value) })} />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" placeholder="Tags (promo,instant)" value={np.tags} onChange={(e) => setNp({ ...np, tags: e.target.value })} />
                </div>
                <button onClick={() => guard("add-p", async () => {
                  if (!np.name) throw new Error("kosong");
                  const tags = np.tags.split(",").map((t) => t.trim()).filter(Boolean);
                  await supabase.from("products").insert({ ...np, tags });
                  setNp({ name: "", category: "Mobile Games", price: 0, img: "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png", rank: 99, tags: "" });
                }, "Produk ditambahkan")} className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-xl px-6 py-2.5">Tambah</button>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e5e5]">
                  <h3 className="font-bold text-sm text-[#111]">Semua Produk ({products.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-[#fafafa]">
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
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {products.map((p) => (
                        <tr key={p.id} className="hover:bg-[#fafafa]">
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <div className="flex items-center gap-2">
                                <img src={editProduct.img} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                <div className="flex flex-col gap-1.5">
                                  <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#ff385c]" value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} />
                                  <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#ff385c]" value={editProduct.img} onChange={(e) => setEditProduct({ ...editProduct, img: e.target.value })} />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2"><img src={p.img} alt="" className="w-8 h-8 rounded-lg object-cover" /><span className="font-semibold">{p.name}</span></div>
                            )}
                          </td>
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <select className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#ff385c]" value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}>
                                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                              </select>
                            ) : <span className="text-xs">{p.category}</span>}
                          </td>
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <RupiahInput value={editProduct.price} onChange={(n) => setEditProduct({ ...editProduct, price: n })} className="w-28" />
                            ) : <span className="font-semibold">{rupiah(p.price)}</span>}
                          </td>
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <input type="number" className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-16 focus:outline-none focus:border-[#ff385c]" value={editProduct.rank} onChange={(e) => setEditProduct({ ...editProduct, rank: Number(e.target.value) })} />
                            ) : p.rank}
                          </td>
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:border-[#ff385c]" value={editProduct.tags.join(",")} onChange={(e) => setEditProduct({ ...editProduct, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} />
                            ) : <div className="flex flex-wrap gap-1">{p.tags?.map((t) => <span key={t} className="text-[10px] font-bold bg-[#f0f0f0] rounded-full px-2 py-0.5">{t}</span>)}</div>}
                          </td>
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                <input type="checkbox" className="accent-[#ff385c] w-4 h-4" checked={editProduct.active} onChange={(e) => setEditProduct({ ...editProduct, active: e.target.checked })} />Aktif
                              </label>
                            ) : <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${p.active ? "bg-emerald-50 text-emerald-600" : "bg-[#f0f0f0] text-[#9a9a9a]"}`}>{p.active ? "Aktif" : "Off"}</span>}
                          </td>
                          <td className={td}>
                            {editProduct?.id === p.id ? (
                              <div className="flex gap-1.5">
                                <button disabled={saving === p.id} onClick={() => guard(p.id, async () => { await supabase.from("products").update(editProduct).eq("id", p.id); setEditProduct(null); }, "Updated")} className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-lg px-3 py-1.5 transition">Simpan</button>
                                <button onClick={() => setEditProduct(null)} className="text-xs font-semibold text-[#9a9a9a] px-2">Batal</button>
                              </div>
                            ) : (
                              <div className="flex gap-2 text-xs font-semibold">
                                <button onClick={() => setEditProduct(p)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => guard(p.id, () => supabase.from("products").update({ active: !p.active }).eq("id", p.id), p.active ? "Off" : "On")} className={p.active ? "text-amber-600 hover:underline" : "text-emerald-600 hover:underline"}>{p.active ? "Off" : "On"}</button>
                                <button onClick={() => guard(p.id, () => supabase.from("products").delete().eq("id", p.id), "Hapus")} className="text-[#ff385c] hover:underline">Hapus</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ DENOMS ============ */}
          {tab === "denoms" && (() => {
            const gameNames = [...new Set(denoms.map((d) => d.product_name))];
            const filteredDenoms = denoms.filter((d) => d.product_name === denomGame);
            return (
            <div className="space-y-4">
              {/* Game tabs */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-4">
                <p className="text-xs font-bold text-[#717171] uppercase tracking-wider mb-3">Pilih Game</p>
                <div className="flex flex-wrap gap-2">
                  {gameNames.map((g) => (
                    <button key={g} onClick={() => { setDenomGame(g); setNd({ ...nd, product_name: g }); }}
                      className={`text-xs font-bold px-4 py-2 rounded-xl border transition ${denomGame === g ? "bg-[#ff385c] text-white border-[#ff385c]" : "border-[#e5e5e5] text-[#717171] hover:border-[#ff385c] hover:text-[#ff385c]"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add form */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                <h3 className="font-bold text-sm text-[#111] mb-3">Tambah Nominal — {denomGame}</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" placeholder="Label (86 Diamonds)" value={nd.label} onChange={(e) => setNd({ ...nd, label: e.target.value })} />
                  <RupiahInput value={nd.price} onChange={(n) => setNd({ ...nd, price: n })} placeholder="Harga" />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" type="number" placeholder="Rank" value={nd.rank} onChange={(e) => setNd({ ...nd, rank: Number(e.target.value) })} />
                </div>
                <button onClick={() => guard("add-d", async () => {
                  if (!nd.label) throw new Error("kosong");
                  await supabase.from("denoms").insert({ ...nd, product_name: denomGame });
                  setNd({ ...nd, label: "", price: 0, rank: 99 });
                }, "Nominal ditambahkan")} className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-xl px-6 py-2.5">Tambah</button>
              </div>

              {/* Denom table per game */}
              <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e5e5] flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[#111]">{denomGame} — {filteredDenoms.length} nominal</h3>
                </div>
                {filteredDenoms.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-[#9a9a9a] text-center">Belum ada nominal untuk game ini.</p>
                ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead className="bg-[#fafafa]">
                      <tr><th className={th}>Label</th><th className={th}>Harga</th><th className={th}>Rank</th><th className={th}>Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {filteredDenoms.map((d) => (
                        <tr key={d.id} className="hover:bg-[#fafafa]">
                          <td className={td}>{editDenom?.id === d.id ? <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-40 focus:outline-none focus:border-[#ff385c]" value={editDenom.label} onChange={(e) => setEditDenom({ ...editDenom, label: e.target.value })} /> : <span className="font-semibold">{d.label}</span>}</td>
                          <td className={td}>{editDenom?.id === d.id ? <RupiahInput value={editDenom.price} onChange={(n) => setEditDenom({ ...editDenom, price: n })} className="w-32" /> : rupiah(d.price)}</td>
                          <td className={td}>{editDenom?.id === d.id ? <input type="number" className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-16 focus:outline-none focus:border-[#ff385c]" value={editDenom.rank} onChange={(e) => setEditDenom({ ...editDenom, rank: Number(e.target.value) })} /> : d.rank}</td>
                          <td className={td}>
                            {editDenom?.id === d.id ? (
                              <div className="flex gap-1.5">
                                <button disabled={saving === d.id} onClick={() => guard(d.id, async () => { await supabase.from("denoms").update(editDenom).eq("id", d.id); setEditDenom(null); }, "Updated")} className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-lg px-3 py-1.5 transition">Simpan</button>
                                <button onClick={() => setEditDenom(null)} className="text-xs font-semibold text-[#9a9a9a] px-2">Batal</button>
                              </div>
                            ) : (
                              <div className="flex gap-2 text-xs font-semibold">
                                <button onClick={() => setEditDenom(d)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => guard(d.id, () => supabase.from("denoms").delete().eq("id", d.id), "Hapus")} className="text-[#ff385c] hover:underline">Hapus</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* ============ PAYS ============ */}
          {tab === "pays" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                <h3 className="font-bold text-sm text-[#111] mb-3">Tambah Metode</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" placeholder="Label (QRIS)" value={npay.label} onChange={(e) => setNpay({ ...npay, label: e.target.value })} />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" placeholder="Jenis" value={npay.kind} onChange={(e) => setNpay({ ...npay, kind: e.target.value })} />
                  <RupiahInput value={npay.fee} onChange={(n) => setNpay({ ...npay, fee: n })} placeholder="Biaya" />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" type="number" placeholder="Rank" value={npay.rank} onChange={(e) => setNpay({ ...npay, rank: Number(e.target.value) })} />
                  <div className="flex items-center gap-2.5">
                    <button type="button" onClick={() => addPayImgRef.current?.click()} disabled={uploading === "add"} className="shrink-0 border border-[#e5e5e5] hover:border-[#ff385c] rounded-xl px-4 py-2.5 text-xs font-bold text-[#717171] hover:text-[#ff385c] transition">
                      {uploading === "add" ? "Upload…" : npay.img ? "Ganti" : "Upload Gambar"}
                    </button>
                    {npay.img && <img src={npay.img} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#e5e5e5]" />}
                  </div>
                  <input ref={addPayImgRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const f = e.target.files?.[0]; if (!f) return;
                    setUploading("add"); const url = await uploadImage(f);
                    if (url) setNpay((p) => ({ ...p, img: url })); setUploading(""); e.target.value = "";
                  }} />
                </div>
                <button onClick={() => guard("add-pay", async () => {
                  if (!npay.label) throw new Error("kosong");
                  await supabase.from("pays").insert(npay);
                  setNpay({ label: "", kind: "E-wallet", fee: 0, rank: 99, img: "" });
                }, "Metode ditambahkan")} className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-xl px-6 py-2.5">Tambah</button>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e5e5]">
                  <h3 className="font-bold text-sm text-[#111]">Semua Metode ({pays.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px]">
                    <thead className="bg-[#fafafa]">
                      <tr><th className={th}>Metode</th><th className={th}>Gambar</th><th className={th}>Jenis</th><th className={th}>Biaya</th><th className={th}>Rank</th><th className={th}>Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {pays.map((y) => (
                        <tr key={y.id} className="hover:bg-[#fafafa]">
                          <td className={td}>{editPay?.id === y.id ? <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-36 focus:outline-none focus:border-[#ff385c]" value={editPay.label} onChange={(e) => setEditPay({ ...editPay, label: e.target.value })} /> : <span className="font-semibold">{y.label}</span>}</td>
                          <td className={td}>
                            {editPay?.id === y.id ? (
                              <div className="flex items-center gap-2">
                                <button type="button" onClick={() => editPayImgRef.current?.click()} disabled={uploading === y.id} className="text-xs font-bold text-[#ff385c] hover:underline">{uploading === y.id ? "…" : editPay.img ? "Ganti" : "Upload"}</button>
                                {editPay.img && <img src={editPay.img} alt="" className="w-10 h-10 rounded-lg object-cover border border-[#e5e5e5]" />}
                                <input ref={editPayImgRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                  const f = e.target.files?.[0]; if (!f || !editPay) return;
                                  setUploading(y.id); const url = await uploadImage(f);
                                  if (url) setEditPay({ ...editPay, img: url }); setUploading(""); e.target.value = "";
                                }} />
                              </div>
                            ) : y.img ? <img src={y.img} alt={y.label} className="w-10 h-10 rounded-lg object-cover border border-[#e5e5e5]" /> : <span className="text-xs text-[#ccc]">—</span>}
                          </td>
                          <td className={td}>{editPay?.id === y.id ? <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-32 focus:outline-none focus:border-[#ff385c]" value={editPay.kind} onChange={(e) => setEditPay({ ...editPay, kind: e.target.value })} /> : <span className="text-xs">{y.kind}</span>}</td>
                          <td className={td}>{editPay?.id === y.id ? <RupiahInput value={editPay.fee} onChange={(n) => setEditPay({ ...editPay, fee: n })} className="w-24" /> : y.fee ? rupiah(y.fee) : "Gratis"}</td>
                          <td className={td}>{editPay?.id === y.id ? <input type="number" className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-16 focus:outline-none focus:border-[#ff385c]" value={editPay.rank} onChange={(e) => setEditPay({ ...editPay, rank: Number(e.target.value) })} /> : y.rank}</td>
                          <td className={td}>
                            {editPay?.id === y.id ? (
                              <div className="flex gap-1.5">
                                <button disabled={saving === y.id} onClick={() => guard(y.id, async () => { await supabase.from("pays").update(editPay).eq("id", y.id); setEditPay(null); }, "Updated")} className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-lg px-3 py-1.5 transition">Simpan</button>
                                <button onClick={() => setEditPay(null)} className="text-xs font-semibold text-[#9a9a9a] px-2">Batal</button>
                              </div>
                            ) : (
                              <div className="flex gap-2 text-xs font-semibold">
                                <button onClick={() => setEditPay(y)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => guard(y.id, () => supabase.from("pays").delete().eq("id", y.id), "Hapus")} className="text-[#ff385c] hover:underline">Hapus</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ PROMOS ============ */}
          {tab === "promos" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-5">
                <h3 className="font-bold text-sm text-[#111] mb-3">Tambah Promo</h3>
                <div className="grid sm:grid-cols-2 gap-2.5 max-w-md">
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm font-mono uppercase focus:outline-none focus:border-[#ff385c] transition" placeholder="Kode" value={npr.code} onChange={(e) => setNpr({ ...npr, code: e.target.value.toUpperCase() })} />
                  <input className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition" type="number" placeholder="Diskon %" value={npr.disc_pct} onChange={(e) => setNpr({ ...npr, disc_pct: Number(e.target.value) })} />
                </div>
                <button onClick={() => guard("add-pr", async () => {
                  if (!npr.code) throw new Error("kosong");
                  await supabase.from("promos").insert(npr);
                  setNpr({ code: "", disc_pct: 10 });
                }, "Promo ditambahkan")} className="mt-3 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-xl px-6 py-2.5">Tambah</button>
              </div>

              <div className="bg-white rounded-2xl border border-[#e5e5e5] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e5e5]">
                  <h3 className="font-bold text-sm text-[#111]">Semua Promo ({promos.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px]">
                    <thead className="bg-[#fafafa]">
                      <tr><th className={th}>Kode</th><th className={th}>Diskon</th><th className={th}>Status</th><th className={th}>Aksi</th></tr>
                    </thead>
                    <tbody className="divide-y divide-[#f0f0f0]">
                      {promos.map((m) => (
                        <tr key={m.id} className="hover:bg-[#fafafa]">
                          <td className={td}>{editPromo?.id === m.id ? <input className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs font-mono uppercase w-32 focus:outline-none focus:border-[#ff385c]" value={editPromo.code} onChange={(e) => setEditPromo({ ...editPromo, code: e.target.value.toUpperCase() })} /> : <span className="font-mono font-bold">{m.code}</span>}</td>
                          <td className={td}>{editPromo?.id === m.id ? <input type="number" className="bg-white border border-[#e5e5e5] rounded-lg px-2.5 py-1.5 text-xs w-16 focus:outline-none focus:border-[#ff385c]" value={editPromo.disc_pct} onChange={(e) => setEditPromo({ ...editPromo, disc_pct: Number(e.target.value) })} /> : `${m.disc_pct}%`}</td>
                          <td className={td}>
                            {editPromo?.id === m.id ? (
                              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                                <input type="checkbox" className="accent-[#ff385c] w-4 h-4" checked={editPromo.active} onChange={(e) => setEditPromo({ ...editPromo, active: e.target.checked })} />Aktif
                              </label>
                            ) : <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 ${m.active ? "bg-emerald-50 text-emerald-600" : "bg-[#f0f0f0] text-[#9a9a9a]"}`}>{m.active ? "Aktif" : "Off"}</span>}
                          </td>
                          <td className={td}>
                            {editPromo?.id === m.id ? (
                              <div className="flex gap-1.5">
                                <button disabled={saving === m.id} onClick={() => guard(m.id, async () => { await supabase.from("promos").update(editPromo).eq("id", m.id); setEditPromo(null); }, "Updated")} className="text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e12b4d] rounded-lg px-3 py-1.5 transition">Simpan</button>
                                <button onClick={() => setEditPromo(null)} className="text-xs font-semibold text-[#9a9a9a] px-2">Batal</button>
                              </div>
                            ) : (
                              <div className="flex gap-2 text-xs font-semibold">
                                <button onClick={() => setEditPromo(m)} className="text-blue-600 hover:underline">Edit</button>
                                <button onClick={() => guard(m.id, () => supabase.from("promos").update({ active: !m.active }).eq("id", m.id), m.active ? "Off" : "On")} className={m.active ? "text-amber-600 hover:underline" : "text-emerald-600 hover:underline"}>{m.active ? "Off" : "On"}</button>
                                <button onClick={() => guard(m.id, () => supabase.from("promos").delete().eq("id", m.id), "Hapus")} className="text-[#ff385c] hover:underline">Hapus</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============ SETTINGS ============ */}
          {tab === "settings" && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 grid place-items-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#111]">WhatsApp CS</h3>
                    <p className="text-xs text-[#9a9a9a]">Nomor untuk semua tombol &quot;Hubungi CS&quot; di situs</p>
                  </div>
                </div>
                <div className="flex gap-3 max-w-md">
                  <input className="flex-1 bg-white border border-[#e5e5e5] rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#ff385c] transition" placeholder="6281234567890" value={waInput} onChange={(e) => setWaInput(e.target.value)} />
                  <button onClick={() => { updateWhatsApp(waInput); flash("Nomor WhatsApp disimpan"); }} className="bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-xl px-6 py-3 shrink-0">Simpan</button>
                </div>
                <p className="text-xs text-[#9a9a9a] mt-3">Aktif: <span className="font-mono font-semibold text-[#111]">{settings.whatsapp}</span></p>
                <p className="text-xs text-[#ccc] mt-1">Link: <span className="font-mono">{`https://wa.me/${settings.whatsapp}`}</span></p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
