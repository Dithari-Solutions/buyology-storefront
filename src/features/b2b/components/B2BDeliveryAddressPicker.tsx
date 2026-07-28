"use client";

import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import type { Address, AddressLabel, CreateAddressPayload } from "@/features/profile/types";
import { createAddress } from "@/features/profile/services/profile.api";
import { selectSelectedCountryCode } from "@/features/country/store/countrySlice";

const LocationPicker = dynamic(() => import("@/features/map/components/LocationPicker"), { ssr: false });

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

const LABEL_COLORS: Record<AddressLabel, string> = {
    HOME: "bg-blue-100 text-blue-700",
    WORK: "bg-purple-100 text-purple-700",
    OTHER: "bg-gray-100 text-gray-600",
};

const EMPTY_FORM: CreateAddressPayload = {
    label: "HOME",
    addressLine1: "",
    city: "",
    country: "",
    isDefault: false,
    latitude: null,
    longitude: null,
};

interface Props {
    userId: string | null;
    addresses: Address[];
    selectedAddressId: string | null;
    onSelect: (id: string) => void;
    /** Called after a new address is persisted so the parent can append + select it. */
    onAddressCreated: (addr: Address) => void;
    /** Notifies the parent when the add-address form opens/closes, so it can block Pay while open. */
    onAddFormChange?: (open: boolean) => void;
}

/**
 * Delivery-address selection for the B2B quote pay panel — mirrors the B2C ShippingStep:
 * pick a saved address (defaulting to the default/first) or add a new one via the map form.
 * The chosen addressId is what the panel sends to bank-transfer / gateway checkout, so a
 * member with no saved address can add one inline instead of hitting "addressId is required".
 */
export default function B2BDeliveryAddressPicker({
    userId,
    addresses,
    selectedAddressId,
    onSelect,
    onAddressCreated,
    onAddFormChange,
}: Props) {
    const { t } = useTranslation("b2b-rfq");
    const selectedCountryCode = useSelector(selectSelectedCountryCode);

    // Show the add form automatically when there are no saved addresses.
    const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
    // True once the member explicitly taps "Add new address" (so the sync effect below won't
    // yank them back to the list).
    const userOpenedForm = useRef(false);

    // Saved addresses load after this panel mounts (they start empty), so once they arrive show
    // the LIST rather than leaving a member who has addresses stuck on the add-new form.
    useEffect(() => {
        if (addresses.length > 0 && !userOpenedForm.current) {
            setShowAddForm(false);
        }
    }, [addresses.length]);

    // Keep the parent in sync with whether the add-form is open, so it can block Pay (an unsaved
    // typed address must not be silently ignored in favour of the previously-selected one).
    useEffect(() => {
        onAddFormChange?.(showAddForm);
    }, [showAddForm, onAddFormChange]);

    const [form, setForm] = useState<CreateAddressPayload>({ ...EMPTY_FORM, country: selectedCountryCode });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateAddressPayload, string>>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    function setField<K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) {
        setForm((p) => ({ ...p, [key]: value }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    }

    function validate(): boolean {
        const e: Partial<Record<keyof CreateAddressPayload, string>> = {};
        if (!form.addressLine1?.trim()) e.addressLine1 = t("address.required", { defaultValue: "Required" });
        if (!form.city?.trim()) e.city = t("address.required", { defaultValue: "Required" });
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!userId) {
            setSaveError(t("address.noUser", { defaultValue: "Please sign in again to add an address." }));
            return;
        }
        if (!validate()) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            const created = await createAddress(userId, {
                label: form.label ?? "HOME",
                addressLine1: form.addressLine1,
                city: form.city || undefined,
                state: form.state || undefined,
                postalCode: form.postalCode || undefined,
                country: form.country || selectedCountryCode || "AE",
                latitude: form.latitude,
                longitude: form.longitude,
                isDefault: addresses.length === 0,
            });
            onAddressCreated(created);
            userOpenedForm.current = false;
            setShowAddForm(false);
            setForm({ ...EMPTY_FORM, country: selectedCountryCode });
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : t("address.saveFailed", { defaultValue: "Failed to save address." }));
        } finally {
            setIsSaving(false);
        }
    }

    const inp =
        "w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300";
    const inpErr =
        "w-full border border-red-300 rounded-[10px] px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-red-400 transition-colors";

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-[16px] font-bold text-gray-900">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                </svg>
                {t("address.deliverTo", { defaultValue: "Deliver to" })}
            </h2>

            {/* Saved address cards */}
            {addresses.length > 0 && !showAddForm && (
                <div className="flex flex-col gap-3">
                    {addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        const countryName = COUNTRIES.find((c) => c.code === addr.country)?.name ?? addr.country;
                        return (
                            <button
                                key={addr.id}
                                type="button"
                                onClick={() => onSelect(addr.id)}
                                className={`w-full text-left rounded-[14px] border-2 p-4 transition-all cursor-pointer ${
                                    isSelected ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-100 bg-gray-50 hover:border-gray-300"
                                }`}
                            >
                                <div className="mb-2 flex items-center gap-2">
                                    <div className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-[#402F75]" : "border-gray-300"}`}>
                                        {isSelected && <div className="h-2 w-2 rounded-full bg-[#402F75]" />}
                                    </div>
                                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${LABEL_COLORS[addr.label]}`}>{addr.label}</span>
                                    {addr.isDefault && (
                                        <span className="rounded-full bg-[#EDE9FF] px-2.5 py-0.5 text-[11px] font-bold text-[#402F75]">
                                            {t("address.default", { defaultValue: "Default" })}
                                        </span>
                                    )}
                                </div>
                                <p className="ml-6 text-[14px] font-semibold text-gray-800">{addr.firstName} {addr.lastName}</p>
                                <p className="ml-6 text-[13px] text-gray-500">
                                    {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                                </p>
                                <p className="ml-6 text-[13px] text-gray-500">{[addr.city, addr.state, countryName].filter(Boolean).join(", ")}</p>
                                {addr.phoneNumber && <p className="ml-6 mt-0.5 text-[12px] text-gray-400">{addr.phoneNumber}</p>}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => { userOpenedForm.current = true; setShowAddForm(true); }}
                        className="mt-1 flex items-center gap-2 text-[13px] font-semibold text-[#402F75] hover:underline cursor-pointer"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        {t("address.addNew", { defaultValue: "Add new address" })}
                    </button>
                </div>
            )}

            {/* New address form */}
            {showAddForm && (
                <form onSubmit={handleSave} noValidate className="flex flex-col gap-4">
                    {addresses.length > 0 && (
                        <button
                            type="button"
                            onClick={() => { userOpenedForm.current = false; setShowAddForm(false); setSaveError(null); }}
                            className="flex items-center gap-1.5 self-start text-[13px] text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 5l-7 7 7 7" />
                            </svg>
                            {t("address.useSaved", { defaultValue: "Use saved address" })}
                        </button>
                    )}

                    <LocationPicker
                        initialCoords={form.latitude && form.longitude ? { lat: form.latitude, lng: form.longitude } : undefined}
                        onChange={(coords) => {
                            setField("latitude", coords.lat);
                            setField("longitude", coords.lng);
                        }}
                        onResolved={(info) => {
                            setForm((p) => ({
                                ...p,
                                latitude: info.lat,
                                longitude: info.lng,
                                addressLine1: info.line || p.addressLine1,
                                city: info.city || p.city,
                                state: info.state || p.state,
                                postalCode: info.postalCode || p.postalCode,
                                country: info.countryCode || p.country || selectedCountryCode,
                            }));
                            setErrors((p) => ({ ...p, addressLine1: undefined, city: undefined }));
                        }}
                    />

                    <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                            {t("address.addressLine", { defaultValue: "Address" })} <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.addressLine1}
                            onChange={(e) => setField("addressLine1", e.target.value)}
                            placeholder={t("address.addressPlaceholder", { defaultValue: "Building, street, area…" })}
                            className={errors.addressLine1 ? inpErr : inp}
                        />
                        {errors.addressLine1 && <p className="mt-0.5 text-[11px] text-red-500">{errors.addressLine1}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-gray-600">
                                {t("address.city", { defaultValue: "City" })} <span className="text-red-400">*</span>
                            </label>
                            <input type="text" value={form.city ?? ""} onChange={(e) => setField("city", e.target.value)} placeholder={t("address.city", { defaultValue: "City" })} className={errors.city ? inpErr : inp} />
                            {errors.city && <p className="mt-0.5 text-[11px] text-red-500">{errors.city}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-gray-600">{t("address.state", { defaultValue: "State / Region" })}</label>
                            <input type="text" value={form.state ?? ""} onChange={(e) => setField("state", e.target.value)} placeholder={t("address.region", { defaultValue: "Region" })} className={inp} />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-[13px] font-medium text-gray-600">{t("address.postalCode", { defaultValue: "Postal code" })}</label>
                            <input type="text" value={form.postalCode ?? ""} onChange={(e) => setField("postalCode", e.target.value)} placeholder={t("address.postalCode", { defaultValue: "Postal code" })} className={inp} />
                        </div>
                    </div>
                    <p className="text-[11px] text-gray-400">
                        {t("address.autoFillHint", { defaultValue: "Set the pin and we'll fill these in — edit anything that's off. Name & verified phone come from your profile." })}
                    </p>

                    {saveError && <p className="text-[12px] text-red-500">{saveError}</p>}

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex items-center justify-center gap-2 rounded-[10px] bg-[#402F75] py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#2e2156] disabled:opacity-50"
                    >
                        {isSaving && <div className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                        {t("address.saveAndUse", { defaultValue: "Save & use this address" })}
                    </button>
                </form>
            )}
        </div>
    );
}
