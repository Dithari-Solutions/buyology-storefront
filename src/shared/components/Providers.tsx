"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n";
import HtmlLangDir from "@/shared/components/HtmlLangDir";
import { tryRestoreSession } from "@/shared/lib/tokenManager";

function AuthInitializer() {
  useEffect(() => {
    tryRestoreSession();
  }, []);
  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <HtmlLangDir />
        <AuthInitializer />
        {children}
      </I18nextProvider>
    </Provider>
  );
}