"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getUser } from "@/lib/auth";

const BENEFITS = [
  {
    icon: <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"></path>,
    title: "Pengiriman Instan",
    desc: "Sistem otomatis mengirim item langsung ke akun kamu dalam hitungan detik.",
  },
  {
    icon: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"></path>,
    title: "Pembayaran Aman",
    desc: "Gateway terverifikasi dan terenkripsi. Bebas risiko penipuan.",
  },
  {
    icon: <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>,
    title: "CS 24/7",
    desc: "Hubungi CS Noryxa lewat WhatsApp kapan saja.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUser().then((u) => {
      if (u) router.replace("/dashboard");
    });
  }, [router]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();

    try {
      if (mode === "login") {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err.message === "Invalid login credentials"
            ? "Email atau password salah."
            : err.message);
          return;
        }
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, fullName: name, phone }),
        });
        const result = await res.json();
        if (!res.ok) {
          console.error("[signup] error:", result.error);
          if (result.error?.includes("already")) {
            setError("Email sudah terdaftar. Silakan masuk.");
          } else {
            setError(result.error || "Gagal daftar. Coba lagi.");
          }
          return;
        }
        console.log("[signup] success:", result.user?.id);
        try {
          localStorage.setItem("noryxaUser", JSON.stringify({ name, email }));
        } catch {}
      }
      router.push("/");
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7f7f7] min-h-screen no-hover flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-[#eee]">
        <div className="max-w-5xl mx-auto h-16 flex items-center justify-between px-4 sm:px-6">
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
          <Link
            href="/"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-[#717171] hover:text-[#111] border-2 border-[#eee] rounded-full px-4 py-2 hover:border-[#111] transition"
          >
            <svg className="ico w-3.5 h-3.5" viewBox="0 0 24 24">
              <path d="M19 12H5M11 18l-6-6 6-6"></path>
            </svg>
            Kembali ke Store
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="text-center mb-8">
          <p className="eyebrow mb-2">Account</p>
          <h1 className="display text-2xl md:text-3xl font-bold">Selamat datang kembali</h1>
          <p className="text-sm text-[#717171] mt-2">
            Masuk atau daftar akun untuk lanjut top up kamu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6 items-start">
          {/* AUTH CARD */}
          <div className="lg:col-span-3 card p-6 md:p-8">
            <div className="grid grid-cols-2 gap-2 mb-6">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`border-2 rounded-xl py-2.5 text-sm font-bold transition ${
                  mode === "login"
                    ? "border-[#111318] bg-[#f7f7f7] text-[#111]"
                    : "border-[#eee] text-[#717171] hover:border-[#111318] hover:text-[#ff385c]"
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`border-2 rounded-xl py-2.5 text-sm font-bold transition ${
                  mode === "register"
                    ? "border-[#111318] bg-[#f7f7f7] text-[#111]"
                    : "border-[#eee] text-[#717171] hover:border-[#111318] hover:text-[#ff385c]"
                }`}
              >
                Daftar
              </button>
            </div>

            {mode === "login" ? (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" viewBox="0 0 24 24">
                      <rect x="2" y="5" width="20" height="14" rx="3"></rect>
                      <path d="m3 7 9 6 9-6"></path>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@kamu.com"
                      className="field pl-12"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" viewBox="0 0 24 24">
                      <rect x="4" y="10" width="16" height="10" rx="3"></rect>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                    </svg>
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Masukkan password kamu"
                      className="field pl-12 pr-12"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan password"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#111] transition"
                    >
                      <svg className="ico" viewBox="0 0 24 24">
                        {showPass ? (
                          <path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.1 6.1C3.7 7.8 2 10.5 2 12c0 1.7 4 6 10 6 1.4 0 2.7-.3 3.9-.7M12 6c6 0 10 4.3 10 6 0 .5-.5 1.5-1.4 2.5"></path>
                        ) : (
                          <>
                            <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-[#717171] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="accent-[#ff385c] w-4 h-4"
                    />
                    Ingat saya
                  </label>
                  <a href="#" className="text-[#ff385c] font-semibold hover:text-[#e12b4d]">
                    Lupa password?
                  </a>
                </div>

                {error && (
                  <p className="text-sm text-[#ff385c] font-semibold bg-[#fff5f7] border border-[#ffd1d9] rounded-xl px-4 py-2.5">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff385c] hover:bg-[#e12b4d] disabled:bg-[#ccc] transition text-white text-sm font-semibold rounded-full py-3.5 shadow-[0_10px_26px_rgba(255,56,92,.3)]"
                >
                  {loading ? "Memproses..." : "Masuk"}
                </button>

                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 border-t-2 border-[#eee]"></div>
                  <span className="text-xs text-[#717171] uppercase tracking-wider">atau lanjut dengan</span>
                  <div className="flex-1 border-t-2 border-[#eee]"></div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: "Google", icon: <path fill="#4285F4" d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"></path> },
                    { name: "Facebook", icon: <path fill="#1877F2" d="M13.5 21v-8.2h2.76l.41-3.2H13.5V7.55c0-.93.26-1.56 1.6-1.56h1.7V3.14C16.56 3.1 15.6 3 14.47 3c-2.4 0-4.05 1.47-4.05 4.16v2.44H7.65v3.2h2.77V21h3.08Z"></path> },
                    { name: "Apple", icon: <path fill="#111" d="M16.36 12.86c.02 2.72 2.38 3.62 2.41 3.63-.02.06-.38 1.3-1.25 2.57-.75 1.1-1.53 2.2-2.76 2.22-1.21.02-1.6-.71-2.99-.71-1.38 0-1.82.69-2.96.73-1.19.04-2.1-1.19-2.86-2.29-1.65-2.39-2.91-6.76-1.22-9.7.84-1.46 2.35-2.39 4-2.42 1.17-.02 2.27.79 2.99.79.71 0 2.06-.98 3.47-.83.59.02 2.25.21 3.32 1.72-.09.05-1.97 1.15-1.95 3.43M14.3 4.6c.63-.76 1.05-1.82.94-2.88-.94.04-2.09.63-2.75 1.4-.6.67-1.11 1.75-.97 2.78 1.05.08 2.14-.53 2.78-1.3"></path> },
                  ].map((s) => (
                    <button
                      key={s.name}
                      type="button"
                      aria-label={`Lanjut dengan ${s.name}`}
                      className="border-2 border-[#eee] rounded-xl py-2.5 text-[#717171] hover:bg-[#f7f7f7] hover:border-[#111] transition grid place-items-center"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">{s.icon}</svg>
                    </button>
                  ))}
                </div>
              </form>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Nama lengkap
                  </label>
                  <div className="relative">
                    <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="4"></circle>
                      <path d="M4 21a8 8 0 0 1 16 0"></path>
                    </svg>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nama lengkap kamu"
                      className="field pl-12"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Email
                  </label>
                  <div className="relative">
                    <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" viewBox="0 0 24 24">
                      <rect x="2" y="5" width="20" height="14" rx="3"></rect>
                      <path d="m3 7 9 6 9-6"></path>
                    </svg>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@kamu.com"
                      className="field pl-12"
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Nomor WhatsApp
                  </label>
                  <div className="relative">
                    <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
                    </svg>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="08xxxxxxxxxx"
                      className="field pl-12"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#717171] uppercase tracking-wider block mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <svg className="ico absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]" viewBox="0 0 24 24">
                      <rect x="4" y="10" width="16" height="10" rx="3"></rect>
                      <path d="M8 10V7a4 4 0 0 1 8 0v3"></path>
                    </svg>
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      required
                      placeholder="Password kamu"
                      className="field pl-12 pr-12"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      aria-label="Tampilkan password"
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9a9a9a] hover:text-[#111] transition"
                    >
                      <svg className="ico" viewBox="0 0 24 24">
                        {showPass ? (
                          <path d="M3 3l18 18M10.6 10.7a3 3 0 0 0 4.2 4.2M6.1 6.1C3.7 7.8 2 10.5 2 12c0 1.7 4 6 10 6 1.4 0 2.7-.3 3.9-.7M12 6c6 0 10 4.3 10 6 0 .5-.5 1.5-1.4 2.5"></path>
                        ) : (
                          <>
                            <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-[#717171] cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="accent-[#ff385c] w-4 h-4 mt-0.5"
                  />
                  <span>
                    Saya setuju dengan{" "}
                    <a href="#" className="text-[#ff385c] font-semibold hover:text-[#e12b4d]">
                      Syarat &amp; Ketentuan
                    </a>{" "}
                    dan{" "}
                    <a href="#" className="text-[#ff385c] font-semibold hover:text-[#e12b4d]">
                      Kebijakan Privasi
                    </a>
                    .
                  </span>
                </label>

                {error && (
                  <p className="text-sm text-[#ff385c] font-semibold bg-[#fff5f7] border border-[#ffd1d9] rounded-xl px-4 py-2.5">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#ff385c] hover:bg-[#e12b4d] disabled:bg-[#ccc] transition text-white text-sm font-semibold rounded-full py-3.5 shadow-[0_10px_26px_rgba(255,56,92,.3)]"
                >
                  {loading ? "Memproses..." : "Buat Akun"}
                </button>
              </form>
            )}

            <p className="text-xs text-[#717171] text-center mt-6">
              Kamu juga bisa checkout sebagai guest.{" "}
              <Link href="/track" className="text-[#ff385c] font-semibold hover:text-[#e12b4d]">
                Cek transaksi kamu di sini
              </Link>
              .
            </p>
          </div>

          {/* SIDE INFO */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="rounded-[20px] overflow-hidden border-2 border-[#eee] h-32 bg-cover bg-center" style={{ backgroundImage: "url('/images/3ba2d47c-f372-4e33-bbd8-712410f0f909.png')" }}></div>
            {BENEFITS.map((b) => (
              <div key={b.title} className="card p-5 flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#fff1f4] text-[#ff385c] grid place-items-center shrink-0">
                  <svg className="ico w-5 h-5" viewBox="0 0 24 24">{b.icon}</svg>
                </span>
                <div>
                  <h2 className="text-sm font-bold">{b.title}</h2>
                  <p className="text-xs text-[#717171] mt-1 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t-2 border-[#eee] py-6 mt-auto">
        <p className="text-center text-xs text-[#717171]">
          © 2026 Noryxa Digital — Nexus Gaming Store
        </p>
      </footer>
    </div>
  );
}
