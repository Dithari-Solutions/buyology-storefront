"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ShippingFormData } from "../types";
import type { Address, CreateAddressPayload, AddressLabel } from "@/features/profile/types";

const COUNTRIES = [
    { code: "AE", name: "United Arab Emirates" },
    { code: "SA", name: "Saudi Arabia" },
    { code: "EG", name: "Egypt" },
    { code: "AZ", name: "Azerbaijan" },
    { code: "TR", name: "Turkey" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "GB", name: "United Kingdom" },
    { code: "US", name: "United States" },
    { code: "RU", name: "Russia" },
];

const LABEL_OPTIONS: AddressLabel[] = ["HOME", "WORK", "OTHER"];

const LABEL_COLORS: Record<AddressLabel, string> = {
    HOME: "bg-blue-100 text-blue-700",
    WORK: "bg-purple-100 text-purple-700",
    OTHER: "bg-gray-100 text-gray-600",
};

const EMPTY_ADDRESS_FORM: CreateAddressPayload = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    label: "HOME",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "AE",
    postalCode: "",
    isDefault: false,
};

export interface ShippingStepProps {
    onContinue: (data: ShippingFormData) => void;
    initialData?: ShippingFormData;
    savedAddresses: Address[];
    profilePhone?: string;
    onSaveAddress: (payload: CreateAddressPayload) => Promise<Address>;
}

export default function ShippingStep({
    onContinue,
    initialData,
    savedAddresses,
    profilePhone,
    onSaveAddress,
}: ShippingStepProps) {
    const { t } = useTranslation("checkout");

    // Contact
    const [email, setEmail] = useState(initialData?.email ?? "");
    const [emailError, setEmailError] = useState("");

    // Saved address selection
    const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        initialData ? null : defaultAddr?.id ?? null
    );
    const [showAddForm, setShowAddForm] = useState(
        savedAddresses.length === 0 || !!initialData
    );

    // New address form
    const [addrForm, setAddrForm] = useState<CreateAddressPayload>(
        initialData
            ? {
                  firstName: initialData.firstName,
                  lastName: initialData.lastName,
                  phoneNumber: initialData.phone || profilePhone || "",
                  label: "HOME",
                  addressLine1: initialData.streetAddress,
                  addressLine2: initialData.apartment || "",
                  city: initialData.city,
                  state: "",
                  country: initialData.country,
                  postalCode: initialData.postalCode || "",
                  isDefault: false,
              }
            : { ...EMPTY_ADDRESS_FORM, phoneNumber: profilePhone ?? "" }
    );
    const [addrErrors, setAddrErrors] = useState<Partial<Record<keyof CreateAddressPayload, string>>>({});
    const [saveForLater, setSaveForLater] = useState(initialData?.saveInfo ?? false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    function setAddrField<K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) {
        setAddrForm((p) => ({ ...p, [key]: value }));
        if (addrErrors[key]) setAddrErrors((p) => ({ ...p, [key]: undefined }));
    }

    function validateAddr(): boolean {
        const e: Partial<Record<keyof CreateAddressPayload, string>> = {};
        if (!addrForm.firstName.trim()) e.firstName = t("validation.required");
        if (!addrForm.lastName.trim()) e.lastName = t("validation.required");
        if (!addrForm.phoneNumber.trim()) e.phoneNumber = t("validation.required");
        if (!addrForm.addressLine1.trim()) e.addressLine1 = t("validation.required");
        if (!addrForm.city.trim()) e.city = t("validation.required");
        setAddrErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setEmailError("");

        if (!email.trim()) { setEmailError(t("validation.required")); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(t("validation.invalidEmail")); return; }

        if (showAddForm) {
            // Validate new address form
            if (!validateAddr()) return;

            setIsSaving(true);
            setSaveError(null);
            try {
                let savedAddr: Address | null = null;
                if (saveForLater) {
                    savedAddr = await onSaveAddress({ ...addrForm, isDefault: addrForm.isDefault ?? false });
                }

                const addr = savedAddr ?? addrForm;
                onContinue({
                    email,
                    phone: "phoneNumber" in addr ? addr.phoneNumber : addrForm.phoneNumber,
                    firstName: "firstName" in addr ? addr.firstName : addrForm.firstName,
                    lastName: "lastName" in addr ? addr.lastName : addrForm.lastName,
                    streetAddress: "addressLine1" in addr ? addr.addressLine1 : addrForm.addressLine1,
                    apartment: ("addressLine2" in addr ? addr.addressLine2 : addrForm.addressLine2) ?? "",
                    country: "country" in addr ? addr.country : addrForm.country,
                    city: "city" in addr ? addr.city : addrForm.city,
                    postalCode: ("postalCode" in addr ? addr.postalCode : addrForm.postalCode) ?? "",
                    saveInfo: saveForLater,
                });
            } catch (err) {
                setSaveError(err instanceof Error ? err.message : "Failed to save address.");
                setIsSaving(false);
            }
        } else {
            // Use selected saved address
            const selected = savedAddresses.find((a) => a.id === selectedAddressId);
            if (!selected) return;
            onContinue({
                email,
                phone: selected.phoneNumber,
                firstName: selected.firstName,
                lastName: selected.lastName,
                streetAddress: selected.addressLine1,
                apartment: selected.addressLine2 ?? "",
                country: selected.country,
                city: selected.city,
                postalCode: selected.postalCode ?? "",
                saveInfo: false,
            });
        }
    }

    const inp = "border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 transition-all border-gray-200 focus:border-[#402F75] focus:ring-[#402F75]/10";
    const inpErr = "border rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 placeholder-gray-400 outline-none focus:ring-2 transition-all border-red-400 focus:border-red-400 focus:ring-red-100";

    return (
        <form onSubmit={handleSubmit} noValidate>
            {/* ── Contact ──────────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 mb-5">{t("contact.heading")}</h2>
                <div className="flex flex-col gap-1.5 max-w-sm">
                    <label htmlFor="email" className="text-[13px] font-semibold text-gray-700">
                        {t("contact.email")}<span className="text-red-400 ml-0.5">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder={t("contact.emailPlaceholder")}
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                        className={emailError ? inpErr : inp}
                    />
                    {emailError && <p className="text-[11px] text-red-500 mt-0.5">{emailError}</p>}
                </div>
            </div>

            {/* ── Delivery Address ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <h2 className="text-[16px] font-bold text-gray-900 mb-5">{t("address.heading")}</h2>

                {/* Saved address cards */}
                {savedAddresses.length > 0 && !showAddForm && (
                    <div className="flex flex-col gap-3 mb-4">
                        {savedAddresses.map((addr) => {
                            const isSelected = selectedAddressId === addr.id;
                            const countryName = COUNTRIES.find((c) => c.code === addr.country)?.name ?? addr.country;
                            return (
                                <button
                                    key={addr.id}
                                    type="button"
                                    onClick={() => setSelectedAddressId(addr.id)}
                                    className={`w-full text-left rounded-[14px] border-2 p-4 transition-all cursor-pointer ${
                                        isSelected
                                            ? "border-[#402F75] bg-[#F8F6FF]"
                                            : "border-gray-100 bg-gray-50 hover:border-gray-300"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-[#402F75]" : "border-gray-300"}`}>
                                            {isSelected && <div className="w-2 h-2 rounded-full bg-[#402F75]" />}
                                        </div>
                                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${LABEL_COLORS[addr.label]}`}>
                                            {addr.label}
                                        </span>
                                        {addr.isDefault && (
                                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE9FF] text-[#402F75]">Default</span>
                                        )}
                                    </div>
                                    <p className="text-[14px] font-semibold text-gray-800 ml-6">{addr.firstName} {addr.lastName}</p>
                                    <p className="text-[13px] text-gray-500 ml-6">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                                    <p className="text-[13px] text-gray-500 ml-6">
                                        {[addr.city, addr.state, countryName].filter(Boolean).join(", ")}
                                    </p>
                                    <p className="text-[12px] text-gray-400 ml-6 mt-0.5">{addr.phoneNumber}</p>
                                </button>
                            );
                        })}

                        {/* Add new address toggle */}
                        <button
                            type="button"
                            onClick={() => { setShowAddForm(true); setSelectedAddressId(null); }}
                            className="flex items-center gap-2 text-[13px] font-semibold text-[#402F75] hover:underline cursor-pointer mt-1"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add new address
                        </button>
                    </div>
                )}

                {/* New address form */}
                {showAddForm && (
                    <div className="flex flex-col gap-4">
                        {/* Back to saved addresses */}
                        {savedAddresses.length > 0 && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setSelectedAddressId(defaultAddr?.id ?? savedAddresses[0]?.id ?? null);
                                }}
                                className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer self-start"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 12H5M12 5l-7 7 7 7" />
                                </svg>
                                Use saved address
                            </button>
                        )}

                        {/* Label selector */}
                        <div>
                            <label className="block text-[13px] font-semibold text-gray-700 mb-2">Address Type</label>
                            <div className="flex gap-2 flex-wrap">
                                {LABEL_OPTIONS.map((lbl) => (
                                    <button
                                        key={lbl}
                                        type="button"
                                        onClick={() => setAddrField("label", lbl)}
                                        className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
                                            addrForm.label === lbl
                                                ? "bg-[#402F75] text-white border-[#402F75]"
                                                : "bg-white text-gray-500 border-gray-200 hover:border-[#402F75]"
                                        }`}
                                    >
                                        {lbl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.firstName")}<span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.firstName}
                                    onChange={(e) => setAddrField("firstName", e.target.value)}
                                    placeholder={t("address.placeholder")}
                                    className={addrErrors.firstName ? inpErr : inp}
                                />
                                {addrErrors.firstName && <p className="text-[11px] text-red-500">{addrErrors.firstName}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.lastName")}<span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.lastName}
                                    onChange={(e) => setAddrField("lastName", e.target.value)}
                                    placeholder={t("address.placeholder")}
                                    className={addrErrors.lastName ? inpErr : inp}
                                />
                                {addrErrors.lastName && <p className="text-[11px] text-red-500">{addrErrors.lastName}</p>}
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-gray-700">
                                {t("contact.phone")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                type="tel"
                                value={addrForm.phoneNumber}
                                onChange={(e) => setAddrField("phoneNumber", e.target.value)}
                                placeholder="+971501234567"
                                className={addrErrors.phoneNumber ? inpErr : inp}
                            />
                            {addrErrors.phoneNumber && <p className="text-[11px] text-red-500">{addrErrors.phoneNumber}</p>}
                        </div>

                        {/* Street */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-gray-700">
                                {t("address.street")}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                type="text"
                                value={addrForm.addressLine1}
                                onChange={(e) => setAddrField("addressLine1", e.target.value)}
                                placeholder={t("address.placeholder")}
                                className={addrErrors.addressLine1 ? inpErr : inp}
                            />
                            {addrErrors.addressLine1 && <p className="text-[11px] text-red-500">{addrErrors.addressLine1}</p>}
                        </div>

                        {/* Apartment */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-gray-700">
                                {t("address.apartment")}
                            </label>
                            <input
                                type="text"
                                value={addrForm.addressLine2 ?? ""}
                                onChange={(e) => setAddrField("addressLine2", e.target.value)}
                                placeholder={t("address.placeholder")}
                                className={inp}
                            />
                        </div>

                        {/* Country / City / Postal */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.country")}<span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={addrForm.country}
                                        onChange={(e) => setAddrField("country", e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#402F75] focus:ring-2 focus:ring-[#402F75]/10 transition-all appearance-none bg-white cursor-pointer pr-9"
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c.code} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.city")}<span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.city}
                                    onChange={(e) => setAddrField("city", e.target.value)}
                                    placeholder={t("address.placeholder")}
                                    className={addrErrors.city ? inpErr : inp}
                                />
                                {addrErrors.city && <p className="text-[11px] text-red-500">{addrErrors.city}</p>}
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.postalCode")}
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.postalCode ?? ""}
                                    onChange={(e) => setAddrField("postalCode", e.target.value)}
                                    placeholder={t("address.placeholder")}
                                    className={inp}
                                />
                            </div>
                        </div>

                        {/* Save for later */}
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={saveForLater}
                                onChange={(e) => setSaveForLater(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 accent-[#402F75] cursor-pointer"
                            />
                            <span className="text-[13px] text-gray-600">{t("address.saveInfo")}</span>
                        </label>

                        {saveError && <p className="text-[12px] text-red-500">{saveError}</p>}
                    </div>
                )}
            </div>

            {/* ── CTA ──────────────────────────────────────────────────────── */}
            <button
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#FBBB14] hover:bg-[#f0b000] active:scale-[0.98] transition-all py-[14px] rounded-xl font-bold text-[15px] text-gray-900 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
                {isSaving ? (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
                ) : (
                    <>
                        {t("cta.continueToPayment")}
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </>
                )}
            </button>
        </form>
    );
}
