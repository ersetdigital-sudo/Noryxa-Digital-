"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_WA = "6281234567890";
const LS_KEY = "noryxa_settings";

interface Settings {
  whatsapp: string;
}

function getLocal(): Settings {
  try {
    return { ...{ whatsapp: DEFAULT_WA }, ...JSON.parse(localStorage.getItem(LS_KEY) || "{}") };
  } catch {
    return { whatsapp: DEFAULT_WA };
  }
}

function setLocal(s: Settings) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ whatsapp: DEFAULT_WA });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSettings(getLocal());
    setLoaded(true);
  }, []);

  const updateWhatsApp = useCallback((num: string) => {
    const clean = num.replace(/[^0-9]/g, "");
    const next = { whatsapp: clean };
    setSettings(next);
    setLocal(next);
  }, []);

  const waLink = useCallback(
    (text?: string) => {
      const msg = text ? `?text=${encodeURIComponent(text)}` : "";
      return `https://wa.me/${settings.whatsapp}${msg}`;
    },
    [settings.whatsapp]
  );

  return { settings, loaded, updateWhatsApp, waLink };
}
