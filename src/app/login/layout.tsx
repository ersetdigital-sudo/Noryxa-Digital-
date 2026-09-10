import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Masuk / Daftar — Noryxa Digital",
  description: "Masuk atau daftar akun Noryxa Digital untuk lanjut top up game favoritmu.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
