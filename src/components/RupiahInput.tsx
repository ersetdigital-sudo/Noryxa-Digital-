"use client";

import { useState, useEffect } from "react";

function formatRupiah(n: number): string {
  if (!n) return "";
  return n.toLocaleString("id-ID");
}

function parseRupiah(s: string): number {
  return Number(s.replace(/[^0-9]/g, "")) || 0;
}

interface RupiahInputProps {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
}

export default function RupiahInput({ value, onChange, placeholder = "0", className = "" }: RupiahInputProps) {
  const [display, setDisplay] = useState(formatRupiah(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDisplay(formatRupiah(value));
  }, [value, focused]);

  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#717171] pointer-events-none">
        Rp
      </span>
      <input
        type="text"
        inputMode="numeric"
        className="w-full bg-white border border-[#e5e5e5] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#ff385c] transition"
        placeholder={placeholder}
        value={display}
        onFocus={() => { setFocused(true); setDisplay(formatRupiah(value)); }}
        onBlur={() => { setFocused(false); }}
        onChange={(e) => {
          const raw = parseRupiah(e.target.value);
          setDisplay(formatRupiah(raw));
          onChange(raw);
        }}
      />
    </div>
  );
}
