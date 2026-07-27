"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import type { RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";
import { SITE_URL } from "@/shared/seo/config";
import { getProfile, getAddresses } from "@/features/profile/services/profile.api";
import type { Address, UserProfile } from "@/features/profile/types";
import { selectPreferredCurrency } from "@/features/country/store/countrySlice";
import { convertAmount } from "@/features/currency/services/currency.api";
import TabbyLogo from "@/assets/payments/tabby.png";
import TamaraLogo from "@/assets/payments/tamara.png";
import {
    acceptQuote,
    checkoutQuote,
    submitBankTransfer,
    type B2bQuote,
} from "@/features/b2b/services/quote.api";

// Proof-of-payment upload rules — mirror the backend FileValidationUtils.validateDocument
// allowlist (PDF/JPG/PNG/WebP, max 10 MB).
const ALLOWED_PROOF_EXT = ["pdf", "jpg", "jpeg", "png", "webp"];
const ALLOWED_PROOF_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
const MAX_PROOF_BYTES = 10 * 1024 * 1024;

function validateProofFile(file: File): string {
    const ext = file.name.includes(".") ? file.name.split(".").pop()!.toLowerCase() : "";
    if (!ALLOWED_PROOF_EXT.includes(ext) || !ALLOWED_PROOF_MIME.includes(file.type)) {
        return "Unsupported file type. Upload a PDF or image (PDF, JPG, PNG, or WebP).";
    }
    if (file.size > MAX_PROOF_BYTES) {
        return "The file is too large. The maximum allowed size is 10 MB.";
    }
    return "";
}

// ── Shared B2B quote pay panel ────────────────────────────────────────────────
// Renders a CARD / Tabby / Tamara selector (mirrors the consumer PaymentStep) and
// a Pay button for a QUOTED or ACCEPTED quote. On Pay we accept the quote first if
// it is still QUOTED, then supply the member's profile email + default address and
// call checkoutQuote — redirecting the browser to the returned Paymob checkoutUrl.
//
// The 5000 AED B2B credit is shown as a converted "coming soon" teaser only; it is
// NOT applied at checkout (credit is not live yet).

type GatewayMethod = "CARD" | "TABBY" | "TAMARA";
type MethodType = GatewayMethod | "BANK_TRANSFER";

const B2B_CREDIT_AED = 5000;

interface PaymentOption {
    id: MethodType;
    labelKey: string;
    labelFallback: string;
    badge: React.ReactNode;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
    { id: "CARD", labelKey: "payPanel.card", labelFallback: "Card", badge: null },
    {
        id: "TABBY",
        labelKey: "payPanel.tabby",
        labelFallback: "Tabby",
        badge: <Image src={TabbyLogo} alt="Tabby" className="h-5 w-auto object-contain" />,
    },
    {
        id: "TAMARA",
        labelKey: "payPanel.tamara",
        labelFallback: "Tamara",
        badge: <Image src={TamaraLogo} alt="Tamara" className="h-5 w-auto object-contain" />,
    },
    {
        id: "BANK_TRANSFER",
        labelKey: "payPanel.bankTransfer",
        labelFallback: "Bank transfer",
        badge: null,
    },
];

interface B2BQuotePayPanelProps {
    quote: B2bQuote;
    /** Called after a successful bank-transfer submission so the parent can refresh. */
    onUpdated?: (q: B2bQuote) => void;
}

export default function B2BQuotePayPanel({ quote, onUpdated }: B2BQuotePayPanelProps) {
    const { t } = useTranslation("b2b-rfq");
    const params = useParams();
    const lang = (params?.lang as Lang) ?? "en";
    const userId = useSelector((s: RootState) => s.auth.userId);
    const memberCurrency = useSelector(selectPreferredCurrency);

    const [method, setMethod] = useState<MethodType>("CARD");
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState("");

    const [proofFile, setProofFile] = useState<File | null>(null);
    const proofInputRef = useRef<HTMLInputElement>(null);

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);

    // Converted 5000 AED credit teaser (null → show plain "5000 AED").
    const [convertedCredit, setConvertedCredit] = useState<number | null>(null);

    // Load profile + addresses so checkout can supply a delivery address / email.
    useEffect(() => {
        if (!userId) return;
        Promise.all([getProfile(userId), getAddresses(userId)])
            .then(([prof, addrs]) => {
                setProfile(prof);
                setAddresses(addrs);
            })
            .catch(() => {
                /* non-blocking — checkout still works with defaults */
            });
    }, [userId]);

    // Convert the 5000 AED teaser into the member's region currency.
    useEffect(() => {
        const ccy = (memberCurrency ?? "AED").toUpperCase();
        if (ccy === "AED") {
            setConvertedCredit(null);
            return;
        }
        let alive = true;
        convertAmount(B2B_CREDIT_AED, "AED", ccy).then((v) => {
            if (alive) setConvertedCredit(v);
        });
        return () => {
            alive = false;
        };
    }, [memberCurrency]);

    const onPickProof = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const err = validateProofFile(file);
        if (err) {
            setError(err);
            setProofFile(null);
            if (proofInputRef.current) proofInputRef.current.value = "";
            return;
        }
        setError("");
        setProofFile(file);
    };

    const pay = async () => {
        setPaying(true);
        setError("");
        try {
            const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

            if (method === "BANK_TRANSFER") {
                if (!proofFile) {
                    setError(
                        t("payPanel.proofRequired", {
                            defaultValue: "Please upload your proof of payment.",
                        }),
                    );
                    setPaying(false);
                    return;
                }
                const updated = await submitBankTransfer(
                    quote.id,
                    { deliveryMethod: "DELIVERY", addressId: defaultAddr?.id },
                    proofFile,
                );
                setPaying(false);
                onUpdated?.(updated);
                return;
            }

            // Gateway methods: QUOTED must be accepted before checkout; ACCEPTED skips this.
            if (quote.status === "QUOTED") {
                await acceptQuote(quote.id);
            }
            const result = await checkoutQuote(quote.id, {
                methodType: method,
                deliveryMethod: "DELIVERY",
                addressId: defaultAddr?.id,
                customerEmail: profile?.email ?? undefined,
                redirectionUrl: `${SITE_URL}/${lang}/payment/callback`,
            });
            // Mirror the consumer checkout: redirect the browser to the payment URL.
            window.location.href = result.checkoutUrl;
        } catch {
            setError(t("payPanel.error"));
            setPaying(false);
        }
    };

    const memberCcy = (memberCurrency ?? "AED").toUpperCase();
    const creditNote =
        convertedCredit != null && memberCcy !== "AED"
            ? t("payPanel.creditComingSoonConverted", {
                  amount: `${B2B_CREDIT_AED} AED`,
                  converted: `${convertedCredit.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                  })} ${memberCcy}`,
              })
            : t("payPanel.creditComingSoon", { amount: `${B2B_CREDIT_AED} AED` });

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                {t("payPanel.payWith")}
            </h2>

            {/* Payment method selector */}
            <div className="flex flex-col gap-3">
                {PAYMENT_OPTIONS.map((option) => {
                    const isSelected = method === option.id;
                    return (
                        <label
                            key={option.id}
                            className={`flex items-center gap-3 rounded-xl border-2 p-4 transition-all ${
                                isSelected
                                    ? "cursor-pointer border-[#402F75] bg-[#EDE9FF]/40"
                                    : "cursor-pointer border-gray-100 bg-white hover:border-gray-200"
                            }`}
                        >
                            <div className="flex-shrink-0">
                                <input
                                    type="radio"
                                    name="b2bQuotePayment"
                                    value={option.id}
                                    checked={isSelected}
                                    onChange={() => setMethod(option.id)}
                                    className="sr-only"
                                />
                                <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${isSelected ? "border-[#402F75]" : "border-gray-300"}`}>
                                    {isSelected && <div className="h-2 w-2 rounded-full bg-[#402F75]" />}
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-2">
                                <span className={`text-[13px] font-bold ${isSelected ? "text-[#402F75]" : "text-gray-800"}`}>
                                    {t(option.labelKey, { defaultValue: option.labelFallback })}
                                </span>
                                {option.badge}
                            </div>
                        </label>
                    );
                })}
            </div>

            {/* Bank-transfer proof upload */}
            {method === "BANK_TRANSFER" && (
                <div className="mt-4 rounded-xl border border-[#402F75]/20 bg-[#FAF8FF] p-4">
                    <p className="text-[12px] leading-relaxed text-gray-600">
                        {t("payPanel.bankTransferHint", {
                            defaultValue:
                                "Transfer the total to our bank account, then upload your payment receipt below. Our procurement team will verify it and place your order.",
                        })}
                    </p>
                    <input
                        ref={proofInputRef}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                        onChange={onPickProof}
                        className="hidden"
                        id="b2b-proof-file"
                    />
                    <label
                        htmlFor="b2b-proof-file"
                        className={`mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-[12px] border px-4 py-3 text-sm transition-all ${
                            proofFile
                                ? "border-[#402F75] bg-white"
                                : "border-dashed border-gray-300 hover:border-[#402F75]"
                        }`}
                    >
                        <span className={`truncate ${proofFile ? "font-medium text-[#402F75]" : "text-gray-400"}`}>
                            {proofFile
                                ? proofFile.name
                                : t("payPanel.uploadProof", {
                                      defaultValue: "Upload proof of payment (PDF, JPG, PNG, WebP)",
                                  })}
                        </span>
                        <span className="shrink-0 text-[12px] font-semibold text-[#402F75]">
                            {proofFile
                                ? t("payPanel.change", { defaultValue: "Change" })
                                : t("payPanel.browse", { defaultValue: "Browse" })}
                        </span>
                    </label>
                    <p className="mt-1 text-[11px] text-gray-400">
                        {t("payPanel.proofMax", { defaultValue: "Required. Maximum size 10 MB." })}
                    </p>
                </div>
            )}

            {/* 5000 AED credit — coming soon teaser (NOT applied) */}
            {method !== "BANK_TRANSFER" && (
                <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-[#FBBB14]/40 bg-[#FFFBEF] px-3.5 py-3">
                    <span className="mt-0.5 inline-flex items-center rounded-md bg-[#FBBB14] px-2 py-[3px] text-[10px] font-extrabold uppercase tracking-wide text-[#3f2a02]">
                        {t("payPanel.comingSoon")}
                    </span>
                    <p className="text-[12px] font-medium leading-relaxed text-gray-600">{creditNote}</p>
                </div>
            )}

            {error && (
                <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
            )}

            <button
                onClick={pay}
                disabled={paying}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#FBBB14] px-8 py-[14px] text-[15px] font-bold text-gray-900 transition-all hover:bg-[#f0b000] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {paying ? (
                    <>
                        <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity="0.3" />
                            <path d="M21 12a9 9 0 00-9-9" />
                        </svg>
                        {t("payPanel.paying")}
                    </>
                ) : method === "BANK_TRANSFER" ? (
                    t("payPanel.submitProof", { defaultValue: "Submit proof of payment" })
                ) : (
                    t("payPanel.payNow")
                )}
            </button>
        </div>
    );
}
