"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { createRefund } from "../services/refundService";

const MIN_IMAGES = 3;
const MAX_IMAGES = 8;
const MAX_BYTES = 5 * 1024 * 1024;

interface Props {
    orderId: string;
    onClose: () => void;
    onSubmitted: () => void;
}

export default function RequestRefundModal({ orderId, onClose, onSubmitted }: Props) {
    const { t } = useTranslation("refund");
    const [mounted, setMounted] = useState(false);
    const [description, setDescription] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Revoke object URLs to avoid memory leaks.
    useEffect(() => {
        return () => {
            previews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files ?? []);
        if (picked.length === 0) return;
        const merged = [...files, ...picked].slice(0, MAX_IMAGES);
        // Replace previews wholesale so revocation logic stays simple.
        previews.forEach((url) => URL.revokeObjectURL(url));
        setFiles(merged);
        setPreviews(merged.map((f) => URL.createObjectURL(f)));
        // Reset the input so picking the same file again still triggers change.
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeAt = (idx: number) => {
        const next = files.filter((_, i) => i !== idx);
        previews.forEach((url) => URL.revokeObjectURL(url));
        setFiles(next);
        setPreviews(next.map((f) => URL.createObjectURL(f)));
    };

    const validate = (): string | null => {
        if (description.trim().length < 10) return t("error.descriptionTooShort");
        if (files.length < MIN_IMAGES) return t("error.minImages", { count: MIN_IMAGES });
        if (files.length > MAX_IMAGES) return t("error.maxImages", { count: MAX_IMAGES });
        for (const f of files) {
            if (!f.type.startsWith("image/")) return t("error.notImage");
            if (f.size > MAX_BYTES) return t("error.fileSize");
        }
        return null;
    };

    const submit = async () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            await createRefund({ orderId, description: description.trim(), images: files });
            onSubmitted();
            onClose();
        } catch (e) {
            setError(e instanceof Error ? e.message : t("error.generic"));
        } finally {
            setSubmitting(false);
        }
    };

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-[#F8F6FF] to-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE9FF] text-[#402F75]">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 14 4 9 9 4" />
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                            </svg>
                        </span>
                        <h3 className="text-lg font-bold text-gray-900">{t("modal.title")}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="-mr-1 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                        aria-label={t("modal.cancel")}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="p-6">

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t("modal.description.label")}
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t("modal.description.placeholder")}
                        className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t("modal.description.help")}</p>
                </div>

                <div className="mb-4">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                        {t("modal.images.label", { min: MIN_IMAGES, max: MAX_IMAGES })}
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onPick}
                        className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#402F75] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#332561]"
                    />
                    <p className="mt-1 text-xs text-gray-500">{t("modal.images.help")}</p>

                    {previews.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {previews.map((url, i) => (
                                <div key={url} className="relative">
                                    <img
                                        src={url}
                                        alt={`Preview ${i + 1}`}
                                        className="aspect-square w-full rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => removeAt(i)}
                                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
                                        aria-label="Remove"
                                    >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}

                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        {t("modal.cancel")}
                    </button>
                    <button
                        onClick={submit}
                        disabled={submitting}
                        className="flex-1 rounded-lg bg-[#402F75] py-2.5 text-sm font-semibold text-white hover:bg-[#332561] disabled:opacity-50"
                    >
                        {submitting ? t("modal.submitting") : t("modal.submit")}
                    </button>
                </div>
                </div>
            </div>
        </div>,
        document.body,
    );
}
