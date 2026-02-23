"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n";
import HtmlLangDir from "@/shared/components/HtmlLangDir";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <HtmlLangDir />
        {children}
      </I18nextProvider>
    </Provider>
  );
}