"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { setReturnMethod } from "../services/refundService";
import type { RefundReturnMethod } from "../types";

interface Props {
    refundId: string;
    orderCurrency: string;
    onClose: () => void;
    onChosen: () => void;
}

export default function ChooseReturnMethodModal({
    refundId,
    orderCurrency,
    onClose,
    onChosen,
}: Props) {
    const { t } = useTranslation("refund");
    const [mounted, setMounted] = useState(false);
    const [submitting, setSubmitting] = useState<RefundReturnMethod | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const choose = async (method: RefundReturnMethod) => {
        setSubmitting(method);
        setError(null);
        try {
            await setReturnMethod(refundId, method, orderCurrency);
            onChosen();
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : t("error.generic"));
        } finally {
            setSubmitting(null);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">{t("method.modal.title")}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label={t("modal.cancel")}
                    >
                        ✕
                    </button>
                </div>

                <p className="mb-4 text-sm text-gray-600">{t("method.modal.description")}</p>

                <div className="space-y-3">
                    <button
                        onClick={() => choose("STORE_DROPOFF")}
                        disabled={submitting !== null}
                        className="w-full rounded-xl border-2 border-gray-200 p-4 text-left transition hover:border-[#402F75] disabled:opacity-50"
                    >
                        <p className="text-sm font-bold text-gray-900">{t("method.dropoff.title")}</p>
                        <p className="mt-1 text-xs text-gray-500">{t("method.dropoff.desc")}</p>
                    </button>

                    <button
                        onClick={() => choose("COURIER_PICKUP")}
                        disabled={submitting !== null}
                        className="w-full rounded-xl border-2 border-gray-200 p-4 text-left transition hover:border-[#402F75] disabled:opacity-50"
                    >
                        <p className="text-sm font-bold text-gray-900">{t("method.courier.title")}</p>
                        <p className="mt-1 text-xs text-gray-500">
                            {t("method.courier.desc", { currency: orderCurrency })}
                        </p>
                    </button>
                </div>

                {error && (
                    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}

                {submitting && (
                    <p className="mt-3 text-center text-xs text-gray-500">{t("method.submitting")}</p>
                )}
            </div>
        </div>,
        document.body,
    );
}
