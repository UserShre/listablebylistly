import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Mode = "light" | "dark";
export type Accent = "indigo" | "violet" | "rose" | "emerald" | "amber" | "sky" | "slate";

export const ACCENTS: Record<Accent, { label: string; swatch: string; primary: string; ring: string }> = {
  indigo:  { label: "Indigo",  swatch: "#6366f1", primary: "oklch(0.55 0.22 265)", ring: "oklch(0.704 0.04 256.788)" },
  violet:  { label: "Violet",  swatch: "#8b5cf6", primary: "oklch(0.58 0.24 295)", ring: "oklch(0.70 0.10 295)" },
  rose:    { label: "Rose",    swatch: "#f43f5e", primary: "oklch(0.62 0.22 15)",  ring: "oklch(0.72 0.10 15)" },
  emerald: { label: "Emerald", swatch: "#10b981", primary: "oklch(0.62 0.16 160)", ring: "oklch(0.72 0.08 160)" },
  amber:   { label: "Amber",   swatch: "#f59e0b", primary: "oklch(0.72 0.17 70)",  ring: "oklch(0.78 0.08 70)" },
  sky:     { label: "Sky",     swatch: "#0ea5e9", primary: "oklch(0.65 0.16 230)", ring: "oklch(0.74 0.08 230)" },
  slate:   { label: "Slate",   swatch: "#475569", primary: "oklch(0.40 0.03 250)", ring: "oklch(0.55 0.02 250)" },
};

type Ctx = {
  mode: Mode;
  setMode: (m: Mode) => void;
  toggleMode: () => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
};

const ThemeCtx = createContext<Ctx | null>(null);
const MODE_KEY = "listable.mode";
const ACCENT_KEY = "listable.accent";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("light");
  const [accent, setAccentState] = useState<Accent>("indigo");

  useEffect(() => {
    const m = (localStorage.getItem(MODE_KEY) as Mode) || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const a = (localStorage.getItem(ACCENT_KEY) as Accent) || "indigo";
    setModeState(m);
    setAccentState(a);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    const { primary, ring } = ACCENTS[accent];
    document.documentElement.style.setProperty("--primary", primary);
    document.documentElement.style.setProperty("--ring", ring);
    localStorage.setItem(ACCENT_KEY, accent);
  }, [accent]);

  return (
    <ThemeCtx.Provider
      value={{
        mode,
        setMode: setModeState,
        toggleMode: () => setModeState((m) => (m === "dark" ? "light" : "dark")),
        accent,
        setAccent: setAccentState,
      }}
    >
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
