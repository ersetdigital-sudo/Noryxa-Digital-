"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getUser, signOut, onAuthChange } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
  rightBadge?: React.ReactNode;
}

export default function Header({
  title,
  showSearch = true,
  showBack = false,
  backHref = "/",
  backLabel = "Katalog",
  rightBadge,
}: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    getUser().then(setUser);
    const unsub = onAuthChange(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("noryxa:toggle-sidebar"));
  };

  const logout = async () => {
    await signOut();
    localStorage.removeItem("noryxaUser");
    setUser(null);
    setMenuOpen(false);
    window.location.href = "/";
  };

  const email = user?.email || "";
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-[#eee]">
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        <button
          id="menuBtn"
          onClick={toggleSidebar}
          className="lg:hidden w-9 h-9 rounded-lg border-2 border-[#eee] grid place-items-center"
        >
          <svg className="ico" viewBox="0 0 24 24">
            <path d="M3 6h18M3 12h18M3 18h18"></path>
          </svg>
        </button>

        {showBack && (
          <Link
            href={backHref}
            className="text-sm text-[#717171] hover:text-[#ff385c] transition inline-flex items-center gap-1.5"
          >
            <svg className="ico" viewBox="0 0 24 24">
              <path d="M19 12H5M11 18l-6-6 6-6"></path>
            </svg>
            <span className="hidden sm:inline">{backLabel}</span>
          </Link>
        )}

        <h1 className="display text-base sm:text-lg font-bold truncate">{title}</h1>

        {rightBadge && <div className="ml-auto">{rightBadge}</div>}

        {showSearch && (
          <div className="ml-auto flex items-center gap-2 w-full max-w-[360px]">
            <div className="relative flex-1">
              <svg
                className="ico absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="7"></circle>
                <path d="m20 20-3.5-3.5"></path>
              </svg>
              <input
                id="search"
                type="search"
                placeholder="Cari game atau voucher…"
                className="w-full text-sm rounded-full border-2 border-[#eee] bg-[#fafafa] pl-10 pr-4 py-2 outline-none focus:border-[#ff385c] focus:bg-white transition"
              />
            </div>

            {/* PROFILE */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={user ? `Akun ${name || email}` : "Masuk atau daftar"}
                aria-expanded={menuOpen}
                className={`w-9 h-9 rounded-full grid place-items-center transition ${
                  user
                    ? "bg-[#111318] text-white"
                    : "border-2 border-[#eee] hover:border-[#ff385c]"
                }`}
              >
                {user ? (
                  <span className="text-sm font-bold">{initial}</span>
                ) : (
                  <svg className="ico" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4"></circle>
                    <path d="M4 21a8 8 0 0 1 16 0"></path>
                  </svg>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-60 card p-3 z-50">
                  {user ? (
                    <>
                      <div className="px-2 py-2 mb-1 border-b-2 border-[#f2f2f2]">
                        <p className="text-sm font-bold truncate">{name || "Pengguna Noryxa"}</p>
                        <p className="text-xs text-[#717171] truncate">{email}</p>
                      </div>
                      <Link
                        href="/track"
                        className="navlink"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="ico" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="7"></circle>
                          <path d="m20 20-3.5-3.5"></path>
                        </svg>
                        Cek Transaksi
                      </Link>
                      <a
                        href="https://wa.me/6281234567890"
                        className="navlink"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="ico" viewBox="0 0 24 24">
                          <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
                        </svg>
                        Hubungi CS
                      </a>
                      <button
                        onClick={logout}
                        className="navlink w-full text-left text-[#ff385c]"
                      >
                        <svg className="ico" viewBox="0 0 24 24">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <path d="M10 17l5-5-5-5M15 12H3"></path>
                        </svg>
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-[#717171] px-2 py-1.5 mb-1">
                        Masuk untuk pengalaman penuh Noryxa.
                      </p>
                      <Link
                        href="/login"
                        className="navlink"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="ico" viewBox="0 0 24 24">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                          <path d="M10 17l5-5-5-5M15 12H3"></path>
                        </svg>
                        Masuk / Daftar
                      </Link>
                      <Link
                        href="/track"
                        className="navlink"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg className="ico" viewBox="0 0 24 24">
                          <circle cx="11" cy="11" r="7"></circle>
                          <path d="m20 20-3.5-3.5"></path>
                        </svg>
                        Cek Transaksi
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
