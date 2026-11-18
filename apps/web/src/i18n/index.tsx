import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { en, type Dict } from "./en";
import { he } from "./he";

export type Lang = "he" | "en";

const DICTS: Record<Lang, Dict> = { he, en };
const DEFAULT_LANG: Lang = "he";
const STORAGE_KEY = "lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "he" || saved === "en") return saved;
  } catch {
    // Storage blocked (private mode etc.) — fall back to the default.
  }
  return DEFAULT_LANG;
}

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Dict;
  /** Locale-aware number formatting (thousands separators). */
  fmt: (n: number) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);
  const t = DICTS[lang];

  // Keep <html lang/dir> in sync so CSS (:lang, logical properties) and the
  // browser's text direction follow the chosen language.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = t.dir;
  }, [lang, t.dir]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      // Not persisted; the choice still applies for this visit.
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t,
      fmt: (n: number) => n.toLocaleString(t.locale),
    }),
    [lang, setLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <I18nProvider>");
  return ctx;
}
