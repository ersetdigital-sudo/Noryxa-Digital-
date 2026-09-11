"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { getUser, signOut, onAuthChange } from "@/lib/auth";
import { findOrdersByEmail, type Order } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";

const GAME_IMAGES: Record<string, string> = {
  "Mobile Legends": "https://img.lootbar.com/file/68a708c81db899dc74a8b2e2NUvhsc5103?fop=imageView/2/w/200/h/200/q/80",
  "PUBG Mobile": "https://img.lootbar.com/file/68a7091567ccf0d6e888b4b83H7ls1QJ03?fop=imageView/2/w/200/h/200/q/80",
  "Free Fire": "https://img.lootbar.com/file/6a3e1af081e1baf5f45baa5eqShc5Vco03?fop=imageView/2/w/200/h/200/q/80",
  "Honor of Kings": "https://img.lootbar.com/file/66753e0b027d7e7a76622203iLFXBIgV03?fop=imageView/2/w/200/h/200/q/80",
  "Roblox": "https://img.lootbar.com/file/69dda42d9630195bcb523af1zpgEzZLe03?fop=imageView/2/w/200/h/200/q/80",
  "Valorant": "https://img.lootbar.com/file/68a7079b485cfae98de3fe70Reu2CAxY03?fop=imageView/2/w/200/h/200/q/80",
  "Steam Wallet": "https://needmcp.com/storage/gallery/game-store/b09347019ee70f90e5517b2ae2f4c2d4-large.avif",
};

function getGameImage(product: string): string {
  for (const [key, url] of Object.entries(GAME_IMAGES)) {
    if (product.toLowerCase().includes(key.toLowerCase())) return url;
  }
  return "/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png";
}

function rupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(ts: number | string): string {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type TabKey = "overview" | "transactions" | "accounts";

interface SavedId {
  id: string;
  game: string;
  uid: string;
  image: string;
}

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "overview",
    label: "Overview",
    icon: (
      <svg className="ico" viewBox="0 0 24 24">
        <path d="M3 3v18h18"></path>
        <path d="M7 14l3-3 3 3 5-6"></path>
      </svg>
    ),
  },
  {
    key: "transactions",
    label: "My Transactions",
    icon: (
      <svg className="ico" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9"></circle>
        <path d="M12 7v5l3 2"></path>
      </svg>
    ),
  },
  {
    key: "accounts",
    label: "Saved Accounts",
    icon: (
      <svg className="ico" viewBox="0 0 24 24">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
];

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="bg-white rounded-[20px] border-2 border-[#eee] p-5">
      <div className="w-10 h-10 rounded-xl bg-[#fff1f4] text-[#ff385c] flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-2xl font-black text-[#111] truncate">{value}</p>
      <p className="text-xs text-[#717171] mt-1 truncate">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "Selesai"
      ? "bg-green-50 text-green-600 border-green-200"
      : status === "Sedang diverifikasi"
      ? "bg-blue-50 text-blue-600 border-blue-200"
      : "bg-[#fff7f7] text-[#ff385c] border-[#ff385c]";
  const text = status === "Selesai" ? "SUCCESS" : "PENDING";
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      {text}
    </span>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [savedIds, setSavedIds] = useState<SavedId[]>(() =>
    typeof window === "undefined"
      ? []
      : (JSON.parse(localStorage.getItem("noryxaSavedIds") || "[]") as SavedId[])
  );

  useEffect(() => {
    getUser().then(setUser);
    const unsub = onAuthChange((u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user?.email) return;
    findOrdersByEmail(user.email, 20).then(setOrders);
  }, [user]);

  const handleLogout = async () => {
    await signOut();
    localStorage.removeItem("noryxaUser");
    window.location.href = "/";
  };

  const addSavedId = () => {
    const game = prompt("Nama game (contoh: Mobile Legends):");
    if (!game) return;
    const uid = prompt("User ID:");
    if (!uid) return;
    const newId: SavedId = {
      id: Date.now().toString(),
      game,
      uid,
      image: getGameImage(game),
    };
    const updated = [...savedIds, newId];
    setSavedIds(updated);
    localStorage.setItem("noryxaSavedIds", JSON.stringify(updated));
  };

  const removeSavedId = (id: string) => {
    const updated = savedIds.filter((s) => s.id !== id);
    setSavedIds(updated);
    localStorage.setItem("noryxaSavedIds", JSON.stringify(updated));
  };

  const recentOrders = orders.slice(0, 3);
  const totalSpend = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;

  const productCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.product] = (acc[o.product] || 0) + 1;
    return acc;
  }, {});
  const topEntry = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];
  const topProductName = topEntry ? topEntry[0] : "Top Ups";
  const topProductCount = topEntry ? topEntry[1] : 0;

  const getStatusBadge = (status: string) => {
    if (status === "Selesai") return "bg-green-50 text-green-600 border border-green-200";
    if (status === "Sedang diverifikasi") return "bg-blue-50 text-blue-600 border border-blue-200";
    return "bg-[#fff7f7] text-[#ff385c] border border-[#ff385c]";
  };

  const getStatusText = (status: string) => {
    if (status === "Selesai") return "SUCCESS";
    return "PENDING";
  };

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const email = user?.email || "";

  if (!user) {
    return (
      <AppLayout>
        <main className="px-4 sm:px-6 py-8 pb-16">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#fff1f4] text-[#ff385c] grid place-items-center mx-auto mb-4">
              <svg className="ico w-8 h-8" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M4 21a8 8 0 0 1 16 0"></path>
              </svg>
            </div>
            <h2 className="display text-xl font-bold mb-2">Belum masuk</h2>
            <p className="text-sm text-[#717171] mb-6">
              Masuk atau daftar akun untuk melihat dashboard kamu.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#ff385c] hover:bg-[#e12b4d] transition text-white text-sm font-semibold rounded-full px-8 py-3 shadow-[0_10px_26px_rgba(255,56,92,.3)]"
            >
              Masuk / Daftar
            </Link>
          </div>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* ================= MOBILE (original) ================= */}
      <main className="lg:hidden px-4 sm:px-6 py-4 pb-16">
        <section>
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a0a14] rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#ff385c]/15"></div>
            <div className="flex items-center gap-3 relative">
              <div className="w-14 h-14 rounded-2xl bg-[#ff385c] flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                {(name || email || "?").trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-extrabold leading-tight truncate">
                  {name || "Pengguna Noryxa"}
                </p>
                <p className="text-[11px] text-white/70 truncate">{email}</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-[#ff385c] text-white px-2 py-0.5 rounded-full">
                    MEMBER
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 relative">
              <div className="bg-white/10 rounded-xl px-2 py-2 text-center">
                <p className="text-base font-black">{orderCount}</p>
                <p className="text-[9px] text-white/70 uppercase tracking-wide">Order</p>
              </div>
              <div className="bg-white/10 rounded-xl px-2 py-2 text-center">
                <p className="text-base font-black">
                  {totalSpend >= 1000000
                    ? (totalSpend / 1000000).toFixed(1) + "jt"
                    : orderCount > 0
                    ? rupiah(totalSpend)
                    : "0"}
                </p>
                <p className="text-[9px] text-white/70 uppercase tracking-wide">Spend</p>
              </div>
              <div className="bg-white/10 rounded-xl px-2 py-2 text-center">
                <p className="text-base font-black">{savedIds.length}</p>
                <p className="text-[9px] text-white/70 uppercase tracking-wide">Saved IDs</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            <Link href="/" className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-[#ddd] hover:bg-[#f7f7f7] transition">
              <div className="w-10 h-10 rounded-xl bg-[#fff7f7] flex items-center justify-center">
                <svg className="ico text-[#ff385c]" viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"></path></svg>
              </div>
              <span className="text-[10px] font-bold text-center leading-tight">Top Up</span>
            </Link>
            <Link href="/track" className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-[#ddd] hover:bg-[#f7f7f7] transition">
              <div className="w-10 h-10 rounded-xl bg-[#fff7f7] flex items-center justify-center">
                <svg className="ico text-[#ff385c]" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
              </div>
              <span className="text-[10px] font-bold text-center leading-tight">History</span>
            </Link>
            <button onClick={() => setTab("accounts")} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-[#ddd] hover:bg-[#f7f7f7] transition">
              <div className="w-10 h-10 rounded-xl bg-[#fff7f7] flex items-center justify-center">
                <svg className="ico text-[#ff385c]" viewBox="0 0 24 24"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <span className="text-[10px] font-bold text-center leading-tight">Saved</span>
            </button>
            <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border border-[#ddd] hover:bg-[#f7f7f7] transition">
              <div className="w-10 h-10 rounded-xl bg-[#fff7f7] flex items-center justify-center">
                <svg className="ico text-[#ff385c]" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><path d="M10 17l5-5-5-5M15 12H3"></path></svg>
              </div>
              <span className="text-[10px] font-bold text-center leading-tight">Logout</span>
            </button>
          </div>
        </section>

        <section className="mt-5">
          <div className="bg-[#f7f7f7] border-2 border-[#eee] rounded-xl p-1 flex gap-1">
            {([
              ["overview", "Overview"],
              ["transactions", "Transaksi"],
              ["accounts", "Saved IDs"],
            ] as [TabKey, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition ${
                  tab === key ? "bg-white text-[#111] shadow-sm" : "text-[#717171]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {tab === "overview" && (
          <section className="mt-4">
            <div className="card overflow-hidden">
              <div className="bg-[#f7f7f7] px-4 py-2.5 border-b-2 border-[#eee] flex items-center justify-between">
                <h3 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-2">
                  <svg className="ico text-[#ff385c]" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                  Recent Transactions
                </h3>
                <button
                  onClick={() => setTab("transactions")}
                  className="text-[10px] font-extrabold text-[#ff385c]"
                >
                  All &rarr;
                </button>
              </div>
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#717171]">Belum ada transaksi.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#eee]">
                  {recentOrders.map((o) => (
                    <Link key={o.inv} href={`/track?inv=${o.inv}`} className="flex items-center gap-3 p-3 hover:bg-[#f7f7f7] transition">
                      <img src={getGameImage(o.product)} className="w-11 h-11 rounded-xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{o.product}</p>
                        <p className="text-[10px] text-[#717171] font-mono">{o.inv}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold text-[#ff385c]">{rupiah(o.total)}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getStatusBadge(o.status)}`}>
                          {getStatusText(o.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "transactions" && (
          <section className="mt-4">
            <div className="card overflow-hidden">
              <div className="bg-[#f7f7f7] px-4 py-2.5 border-b-2 border-[#eee]">
                <h3 className="font-extrabold text-xs uppercase tracking-wide flex items-center gap-2">
                  <svg className="ico text-[#ff385c]" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>
                  All Transactions
                </h3>
              </div>
              {orders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#717171]">Belum ada transaksi.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#eee]">
                  {orders.map((o) => (
                    <Link key={o.inv} href={`/track?inv=${o.inv}`} className="flex items-center gap-3 p-3 hover:bg-[#f7f7f7] transition">
                      <img src={getGameImage(o.product)} className="w-10 h-10 rounded-xl object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{o.product}</p>
                        <p className="text-[10px] text-[#717171]">{formatDate(o.created)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold text-[#ff385c]">{rupiah(o.total)}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${getStatusBadge(o.status)}`}>
                          {getStatusText(o.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "accounts" && (
          <section className="mt-4">
            <div className="card overflow-hidden divide-y divide-[#eee]">
              {savedIds.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#717171]">Belum ada ID tersimpan.</p>
                </div>
              ) : (
                savedIds.map((s) => (
                  <div key={s.id} className="p-3 flex items-center gap-3">
                    <img src={s.image} className="w-11 h-11 rounded-xl object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{s.game}</p>
                      <p className="text-[10px] text-[#717171]">ID {s.uid}</p>
                    </div>
                    <button
                      onClick={() => removeSavedId(s.id)}
                      className="text-red-500 px-2 py-1"
                    >
                      <svg className="ico" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={addSavedId}
              className="w-full mt-3 border-2 border-dashed border-[#ddd] rounded-2xl py-3 text-xs font-bold text-[#717171] flex items-center justify-center gap-2 hover:border-[#ff385c] hover:text-[#ff385c] transition"
            >
              <svg className="ico" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"></path></svg>
              Add New ID
            </button>
          </section>
        )}
      </main>

      {/* ================= DESKTOP (wireframe) ================= */}
      <main className="hidden lg:block w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="flex gap-1 border-b-2 border-[#eee] mb-6">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap px-4 py-3 text-sm flex items-center gap-2 border-b-2 -mb-[2px] transition ${
                tab === t.key
                  ? "font-bold text-[#ff385c] border-[#ff385c]"
                  : "font-medium text-[#717171] border-transparent hover:text-[#ff385c]"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <StatCard
                value={String(orderCount)}
                label="Total Transactions"
                icon={
                  <svg className="ico" viewBox="0 0 24 24">
                    <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path>
                    <path d="M9 7h6M9 11h6M9 15h4"></path>
                  </svg>
                }
              />
              <StatCard
                value={rupiah(totalSpend)}
                label="Total Spend"
                icon={
                  <svg className="ico" viewBox="0 0 24 24">
                    <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path>
                    <path d="M16 12h.01M3 10h18"></path>
                  </svg>
                }
              />
              <StatCard
                value={`${topProductCount}x`}
                label={`${topProductName} Top Ups`}
                icon={
                  <svg className="ico" viewBox="0 0 24 24">
                    <path d="M12 3c3 3 5 6 5 9a5 5 0 0 1-10 0c0-3 2-6 5-9Z"></path>
                  </svg>
                }
              />
            </div>

            <div className="bg-white rounded-[20px] border-2 border-[#eee] overflow-hidden">
              <div className="bg-[#f7f7f7] px-5 py-3 border-b-2 border-[#eee] flex items-center justify-between">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <svg className="ico text-[#ff385c]" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9"></circle>
                    <path d="M12 7v5l3 2"></path>
                  </svg>
                  RECENT TRANSACTIONS
                </h2>
                <button
                  onClick={() => setTab("transactions")}
                  className="text-xs font-semibold text-[#ff385c] hover:text-[#e12b4d] transition"
                >
                  View All &rarr;
                </button>
              </div>
              {recentOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-[#717171]">Belum ada transaksi.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#eee]">
                  {recentOrders.map((o) => (
                    <Link
                      key={o.inv}
                      href={`/track?inv=${o.inv}`}
                      className="flex items-center gap-3 p-4 hover:bg-[#f7f7f7] transition"
                    >
                      <img
                        src={getGameImage(o.product)}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{o.product}</p>
                        <p className="text-xs text-[#717171] font-mono">{o.inv}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[#ff385c]">{rupiah(o.total)}</p>
                        <div className="mt-0.5">
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                      <svg className="ico text-[#ddd]" viewBox="0 0 24 24">
                        <path d="M9 6l6 6-6 6"></path>
                      </svg>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "transactions" && (
          <div className="bg-white rounded-[20px] border-2 border-[#eee] overflow-hidden">
            <div className="bg-[#f7f7f7] px-5 py-3 border-b-2 border-[#eee]">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <svg className="ico text-[#ff385c]" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9"></circle>
                  <path d="M12 7v5l3 2"></path>
                </svg>
                ALL TRANSACTIONS
              </h2>
            </div>
            {orders.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-[#717171]">Belum ada transaksi.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#eee]">
                {orders.map((o) => (
                  <Link
                    key={o.inv}
                    href={`/track?inv=${o.inv}`}
                    className="flex items-center gap-3 p-4 hover:bg-[#f7f7f7] transition"
                  >
                    <img
                      src={getGameImage(o.product)}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{o.product}</p>
                      <p className="text-xs text-[#717171] font-mono">
                        {o.inv} &middot; {formatDate(o.created)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#ff385c]">{rupiah(o.total)}</p>
                      <div className="mt-0.5">
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    <svg className="ico text-[#ddd]" viewBox="0 0 24 24">
                      <path d="M9 6l6 6-6 6"></path>
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "accounts" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {savedIds.length === 0 ? (
                <div className="col-span-2 p-6 text-center text-sm text-[#717171]">
                  Belum ada ID tersimpan.
                </div>
              ) : (
                savedIds.map((s) => (
                  <div key={s.id} className="bg-white rounded-[20px] border-2 border-[#eee] p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={s.image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{s.game}</p>
                        <p className="text-xs text-[#717171]">ID {s.uid}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 border-2 border-[#eee] rounded-xl py-2 text-xs font-bold text-[#717171] hover:bg-[#f7f7f7] transition">
                        Edit
                      </button>
                      <button
                        onClick={() => removeSavedId(s.id)}
                        className="flex-1 border-2 border-red-200 rounded-xl py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={addSavedId}
              className="w-full mt-4 border-2 border-dashed border-[#ddd] rounded-[20px] py-4 text-sm font-bold text-[#717171] hover:border-[#ff385c] hover:text-[#ff385c] transition flex items-center justify-center gap-2"
            >
              <svg className="ico" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              Add New Account
            </button>
          </>
        )}
      </main>
    </AppLayout>
  );
}