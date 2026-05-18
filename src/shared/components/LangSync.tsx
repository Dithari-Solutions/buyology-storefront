"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/store/languageSlice";
import { switchLanguage } from "@/shared/i18n";

type Lang = "en" | "az" | "ar";

export default function LangSync({ lang }: { lang: Lang }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLanguage(lang));
    // Lazy-loads the language bundle on demand, then swaps i18next's active lang.
    switchLanguage(lang).catch(() => {});
  }, [lang, dispatch]);

  return null;
}
