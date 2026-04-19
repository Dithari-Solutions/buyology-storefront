"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { unsubscribeFromNewsletter } from "@/features/newsletter/services/newsletter.api";

export default function UnsubscribePage() {
    const { t } = useTranslation("newsletter");
    const searchParams = useSearchParams();
    const params = useParams();
    const lang = params.lang as string;
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        const performUnsubscribe = async () => {
            try {
                await unsubscribeFromNewsletter(token);
                setStatus("success");
            } catch (err) {
                setStatus("error");
            }
        };

        performUnsubscribe();
    }, [token]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{t("unsubscribe.title")}</h1>
                
                {status === "loading" && (
                    <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-[#402F75] border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-gray-600">{t("unsubscribe.loading")}</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-gray-800 font-medium mb-8">
                            {t("unsubscribe.success")}
                        </p>
                        <Link 
                            href={`/${lang}`}
                            className="inline-block px-8 py-3 bg-[#402F75] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                        >
                            {t("unsubscribe.backToHome")}
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-gray-800 font-medium mb-8">
                            {t("unsubscribe.error")}
                        </p>
                        <Link 
                            href={`/${lang}`}
                            className="inline-block px-8 py-3 bg-[#402F75] text-white rounded-full font-semibold hover:opacity-90 transition-opacity"
                        >
                            {t("unsubscribe.backToHome")}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
