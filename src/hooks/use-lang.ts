import { useCallback, useState } from "react";
import {
  getPreferredLanguage,
  setPreferredLanguage,
  type LangPref,
} from "@/lib/languages";
import { UI_TRANSLATIONS, translate, type UIStrings } from "@/lib/ui-strings";

/**
 * UI language state. The stored preference is either "auto" (per-message
 * detection — UI falls back to English) or a fixed language, in which case
 * both the UI labels and the analysis engine run in that language.
 */
export function useLang() {
  const [pref, setPref] = useState<LangPref>(() => getPreferredLanguage());

  const setPrefAndPersist = useCallback((next: LangPref) => {
    setPreferredLanguage(next);
    setPref(next);
  }, []);

  const uiLang = pref === "auto" ? "en" : pref;
  const t: UIStrings = UI_TRANSLATIONS[uiLang];
  const translateKey = useCallback(
    (key: keyof UIStrings) => translate(uiLang, key),
    [uiLang],
  );

  return { pref, setPrefAndPersist, uiLang, t, translateKey };
}
