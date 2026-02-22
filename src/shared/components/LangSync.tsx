"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/store/languageSlice";
import i18n from "@/shared/i18n";

type Lang = "en" | "az" | "ar";

export default function LangSync({ lang }: { lang: Lang }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
  }, [lang, dispatch]);

  return null;
}
