"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { getUser, onAuthChange } from "@/lib/auth";
import { findOrdersByEmail, type Order } from "@/lib/orders";
import type { User } from "@supabase/supabase-js";

const GAME_IMAGES: Record<string, string> = {
  "Mobile Legends": "https://needmcp.com/storage/gallery/game-store/dd3ccb84374a3f9225f0515c31ac6910-large.avif",
  "Honor of Kings": "https://needmcp.com/storage/gallery/game-store/bb1f7085972ba9a56836421cd3e6c14c-large.avif",
  "Free Fire": "https://needmcp.com/storage/gallery/game-store/4563402943eaa28232822b1304db7bb1.avif",
  "Valorant": "https://needmcp.com/storage/gallery/game-store/2ada39efe96392a41afa47af6fe6b32c-large.avif",
  "Roblox": "https://needmcp.com/storage/gallery/game-store/620ad99df2c704d765036ae40064ba77-large.avif",
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

  if (!user) {
    return (
      <AppLayout>
        <main className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-8 pb-16">
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
      <main className="w-full max-w-[1180px] mx-auto px-4 sm:px-6 py-6 pb-16">
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