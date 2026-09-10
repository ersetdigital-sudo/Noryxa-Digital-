"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export type NavLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
};

const storeLinks: NavLink[] = [
  {
    href: "/",
    label: "Top Up Games",
    icon: <svg className="ico" viewBox="0 0 24 24"><path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"></path></svg>,
  },
  {
    href: "/",
    label: "PPOB Bills",
    disabled: true,
    icon: <svg className="ico" viewBox="0 0 24 24"><path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z"></path><path d="M9 7h6M9 11h6M9 15h4"></path></svg>,
  },
  {
    href: "/",
    label: "Vouchers",
    disabled: true,
    icon: <svg className="ico" viewBox="0 0 24 24"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8Z"></path><path d="M14 6v12"></path></svg>,
  },
];

const toolLinks: NavLink[] = [
  {
    href: "/",
    label: "Check Region",
    icon: <svg className="ico" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18M12 3c2.5 2.7 2.5 15.3 0 18-2.5-2.7-2.5-15.3 0-18Z"></path></svg>,
  },
  {
    href: "/track",
    label: "Check Transaction",
    icon: <svg className="ico" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><path d="m20 20-3.5-3.5"></path></svg>,
  },
  {
    href: "/",
    label: "Win Rate Calculator",
    icon: <svg className="ico" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"></path></svg>,
  },
];

const accountLinks: NavLink[] = [
  {
    href: "/",
    label: "My Dashboard",
    disabled: true,
    icon: <svg className="ico" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>,
  },
  {
    href: "/login",
    label: "Login / Register",
    icon: <svg className="ico" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><path d="M10 17l5-5-5-5M15 12H3"></path></svg>,
  },
];

export function NavItem({
  link,
  active,
  onNavigate,
}: {
  link: NavLink;
  active: boolean;
  onNavigate?: () => void;
}) {
  if (link.disabled) {
    return (
      <span
        className="navlink disabled"
        aria-disabled="true"
        title="Segera hadir"
        onClick={(e) => e.preventDefault()}
      >
        {link.icon}
        {link.label}
        <span className="navlink-badge">Segera</span>
      </span>
    );
  }

  return (
    <Link
      href={link.href}
      className={`navlink ${active ? "active" : ""}`}
      onClick={onNavigate}
    >
      {link.icon}
      {link.label}
    </Link>
  );
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <p className="eyebrow px-2 mb-2">Store</p>
      <nav className="flex flex-col gap-1 mb-6">
        {storeLinks.map((link) => (
          <NavItem
            key={link.label}
            link={link}
            active={pathname === link.href && link.label === "Top Up Games"}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <p className="eyebrow px-2 mb-2">Tools</p>
      <nav className="flex flex-col gap-1 mb-6">
        {toolLinks.map((link) => (
          <NavItem
            key={link.label}
            link={link}
            active={pathname === link.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <p className="eyebrow px-2 mb-2">Account</p>
      <nav className="flex flex-col gap-1">
        {accountLinks.map((link) => (
          <NavItem key={link.label} link={link} active={false} onNavigate={onNavigate} />
        ))}
      </nav>
    </>
  );
}

function SidebarMobile() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onToggle = () => setOpen((v) => !v);
    window.addEventListener("noryxa:toggle-sidebar", onToggle);
    return () => window.removeEventListener("noryxa:toggle-sidebar", onToggle);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      {/* BACKDROP */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* DRAWER */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[262px] bg-white flex flex-col border-r-2 border-[#eee] px-4 py-5 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menu"
      >
        <div className="flex items-center justify-between mb-7 pr-1">
          <Link href="/" className="flex items-center gap-2 px-2" onClick={() => setOpen(false)}>
            <img
              src="/images/02f95e73-2700-481c-ab2b-4f9fbd473da7.png"
              alt="Noryxa Digital"
              width={28}
              height={28}
              className="w-7 h-7 rounded-lg shrink-0"
            />
            <span className="display text-[17px] font-bold">
              Noryxa<span className="text-[#ff385c]"> Digital</span>
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="w-9 h-9 rounded-lg border-2 border-[#eee] grid place-items-center shrink-0"
            aria-label="Tutup menu"
          >
            <svg className="ico" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarNav onNavigate={() => setOpen(false)} />
        </div>

        <a
          href="https://wa.me/6281234567890"
          className="mt-4 flex items-center justify-center gap-2 bg-[#ff385c] text-white text-sm font-semibold rounded-full py-3 hover:bg-[#e12b4d] transition shadow-[0_6px_18px_rgba(255,56,92,.3)]"
        >
          <svg className="ico" viewBox="0 0 24 24">
            <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
          </svg>
          CS Support
        </a>
      </aside>
    </div>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden lg:flex w-[248px] shrink-0 flex-col border-r-2 border-[#eee] px-4 py-5 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2 px-2 mb-7">
          <img
            src="/images/02f95e73-2700-481c-ab2b-4f9fbd473da7.png"
            alt="Noryxa Digital"
            width={28}
            height={28}
            className="w-7 h-7 rounded-lg shrink-0"
          />
          <span className="display text-[17px] font-bold">
            Noryxa<span className="text-[#ff385c]"> Digital</span>
          </span>
        </Link>

        <SidebarNav />

        <a
          href="https://wa.me/6281234567890"
          className="mt-auto flex items-center justify-center gap-2 bg-[#ff385c] text-white text-sm font-semibold rounded-full py-3 hover:bg-[#e12b4d] transition shadow-[0_6px_18px_rgba(255,56,92,.3)]"
        >
          <svg className="ico" viewBox="0 0 24 24">
            <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5Z"></path>
          </svg>
          CS Support
        </a>
      </aside>

      {/* MOBILE DRAWER */}
      <SidebarMobile />
    </>
  );
}
