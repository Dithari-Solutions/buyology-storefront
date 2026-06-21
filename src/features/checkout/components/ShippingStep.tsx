"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { ShippingFormData } from "../types";
import type { Address, CreateAddressPayload, AddressLabel } from "@/features/profile/types";
import { CheckIcon } from "@/shared/icons";
import { selectSelectedCountryCode, selectSelectedCountry } from "@/features/country/store/countrySlice";
import PickupStoreSelector from "./PickupStoreSelector";
import dynamic from "next/dynamic";

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

const EMPTY_ADDRESS_FORM: CreateAddressPayload = {
    label: "HOME",
    addressLine1: "",
    city: "",
    country: "",
    isDefault: false,
    latitude: null,
    longitude: null,
};

export interface ShippingStepProps {
    onContinue: (data: ShippingFormData) => void;
    initialData?: ShippingFormData;
    savedAddresses: Address[];
    profilePhone?: string;
    profileEmail?: string;
    profileName?: string;
    phoneVerified?: boolean;
    /** Store pickup is offered for cart checkout only (not Buy Now). Defaults to true. */
    allowPickup?: boolean;
    /** Notifies the parent when the shopper switches between delivery and pickup (to update the summary live). */
    onFulfillmentChange?: (mode: "DELIVERY" | "PICKUP") => void;
    onSaveAddress: (payload: CreateAddressPayload) => Promise<Address>;
}

export default function ShippingStep({
    onContinue,
    initialData,
    savedAddresses,
    profilePhone,
    profileEmail,
    profileName,
    phoneVerified,
    allowPickup = true,
    onFulfillmentChange,
    onSaveAddress,
}: ShippingStepProps) {
    const { t } = useTranslation("checkout");

    // Fulfillment mode: deliver to an address, or pick up from a store.
    const selectedCountryCode = useSelector(selectSelectedCountryCode);
    const selectedCountry = useSelector(selectSelectedCountry);
    const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">(initialData?.fulfillment ?? "DELIVERY");
    const [pickupStoreId, setPickupStoreId] = useState<string | null>(initialData?.pickupStoreId ?? null);
    const [pickupError, setPickupError] = useState("");

    function changeFulfillment(mode: "DELIVERY" | "PICKUP") {
        setFulfillment(mode);
        onFulfillmentChange?.(mode);
    }

    // Sync the initial mode up to the parent so the summary reflects it on first render
    // (e.g. when returning to this step with a previously-chosen pickup).
    useEffect(() => {
        onFulfillmentChange?.(fulfillment);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Contact — prefilled from the user's profile (they confirm or edit).
    const [email, setEmail] = useState(initialData?.email ?? profileEmail ?? "");
    const [emailError, setEmailError] = useState("");
    const [editContact, setEditContact] = useState(false);

    // The profile loads asynchronously in the parent, so profileEmail is usually
    // undefined on first render. Adopt it once it arrives (unless the user already
    // typed an email) so the prefilled account email is used automatically and the
    // "email is required" guard doesn't fire on Continue.
    useEffect(() => {
        if (profileEmail) {
            setEmail((prev) => prev || profileEmail);
            setEmailError("");
        }
    }, [profileEmail]);

    // Saved address selection
    const defaultAddr = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
        initialData ? null : defaultAddr?.id ?? null
    );
    const [showAddForm, setShowAddForm] = useState(
        savedAddresses.length === 0 || !!initialData
    );

    // New address form (simplified: a single line + map pin; name/phone come from the profile)
    const [addrForm, setAddrForm] = useState<CreateAddressPayload>(
        initialData
            ? {
                  label: "HOME",
                  addressLine1: initialData.streetAddress,
                  city: initialData.city,
                  state: initialData.state,
                  postalCode: initialData.postalCode,
                  country: initialData.country || selectedCountryCode,
                  isDefault: false,
                  latitude: initialData.latitude ?? null,
                  longitude: initialData.longitude ?? null,
              }
            : { ...EMPTY_ADDRESS_FORM, country: selectedCountryCode }
    );
    const [addrErrors, setAddrErrors] = useState<Partial<Record<keyof CreateAddressPayload, string>>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    function setAddrField<K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) {
        setAddrForm((p) => ({ ...p, [key]: value }));
        if (addrErrors[key]) setAddrErrors((p) => ({ ...p, [key]: undefined }));
    }

    function validateAddr(): boolean {
        const e: Partial<Record<keyof CreateAddressPayload, string>> = {};
        if (!addrForm.addressLine1?.trim()) e.addressLine1 = t("validation.required");
        if (!addrForm.city?.trim()) e.city = t("validation.required");
        setAddrErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setEmailError("");
        setPickupError("");

        if (!email.trim()) { setEmailError(t("validation.required")); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError(t("validation.invalidEmail")); return; }

        // ── Store pickup: no address required, just a chosen store ──
        if (fulfillment === "PICKUP") {
            if (!pickupStoreId) {
                setPickupError(t("pickup.selectError", { defaultValue: "Please choose a store to pick up from." }));
                return;
            }
            const [pf, ...pl] = (profileName ?? "").trim().split(" ");
            onContinue({
                email,
                phone: profilePhone ?? "",
                firstName: pf ?? "",
                lastName: pl.join(" "),
                streetAddress: "",
                apartment: "",
                country: selectedCountryCode,
                city: "",
                state: "",
                postalCode: "",
                saveInfo: false,
                addressId: undefined,
                latitude: null,
                longitude: null,
                fulfillment: "PICKUP",
                pickupStoreId,
            });
            return;
        }

        if (showAddForm) {
            // Validate new address form
            if (!validateAddr()) return;

            setIsSaving(true);
            setSaveError(null);
            try {
                // Always persist the address so the order has a real addressId. Name + phone
                // are filled server-side from the profile, so we don't collect them here.
                const savedAddr = await onSaveAddress({
                    label: addrForm.label ?? "HOME",
                    addressLine1: addrForm.addressLine1,
                    city: addrForm.city || undefined,
                    state: addrForm.state || undefined,
                    postalCode: addrForm.postalCode || undefined,
                    country: addrForm.country || selectedCountryCode || "AE",
                    latitude: addrForm.latitude,
                    longitude: addrForm.longitude,
                    isDefault: savedAddresses.length === 0,
                });

                const [pf, ...pl] = (profileName ?? "").trim().split(" ");
                onContinue({
                    email,
                    phone: savedAddr.phoneNumber || profilePhone || "",
                    firstName: savedAddr.firstName || pf || "",
                    lastName: savedAddr.lastName || pl.join(" "),
                    streetAddress: savedAddr.addressLine1,
                    apartment: savedAddr.addressLine2 ?? "",
                    country: savedAddr.country,
                    city: savedAddr.city,
                    state: savedAddr.state ?? "",
                    postalCode: savedAddr.postalCode ?? "",
                    saveInfo: true,
                    addressId: savedAddr.id,
                    latitude: savedAddr.latitude,
                    longitude: savedAddr.longitude,
                    fulfillment: "DELIVERY",
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
                state: selected.state ?? "",
                postalCode: selected.postalCode ?? "",
                saveInfo: false,
                addressId: selected.id,
                latitude: selected.latitude,
                longitude: selected.longitude,
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
                <div className="flex flex-col gap-3 max-w-sm">
                    {!editContact && (profileName || email || profilePhone) ? (
                        // Prefilled from the profile — confirm or edit.
                        <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-1.5">
                            {profileName && <p className="text-[14px] font-semibold text-gray-900">{profileName}</p>}
                            {email && <p className="text-[13px] text-gray-600 break-all">{email}</p>}
                            {profilePhone && (
                                <p className="text-[13px] text-gray-600 flex items-center gap-2 flex-wrap">
                                    {profilePhone}
                                    {phoneVerified ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            <CheckIcon className="w-3 h-3" /> {t("contact.verified", { defaultValue: "Verified" })}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                            {t("contact.unverified", { defaultValue: "Not verified" })}
                                        </span>
                                    )}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={() => setEditContact(true)}
                                className="text-[12px] font-semibold text-[#402F75] hover:underline self-start mt-1"
                            >
                                {t("contact.edit", { defaultValue: "Edit" })}
                            </button>
                            {emailError && <p className="text-[11px] text-red-500">{emailError}</p>}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
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
                    )}
                </div>
            </div>

            {/* ── Delivery Address ─────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                {/* Fulfillment toggle: deliver vs pick up from store */}
                {allowPickup && (
                <div className="flex gap-2 mb-5">
                    {([
                        ["DELIVERY", t("fulfillment.delivery", { defaultValue: "Deliver to me" })],
                        ["PICKUP", t("fulfillment.pickup", { defaultValue: "Pick up from store" })],
                    ] as const).map(([mode, label]) => (
                        <button
                            key={mode}
                            type="button"
                            onClick={() => changeFulfillment(mode)}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all cursor-pointer ${
                                fulfillment === mode
                                    ? "bg-[#402F75] text-white border-[#402F75]"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-[#402F75]"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                )}

                <h2 className="text-[16px] font-bold text-gray-900 mb-5">
                    {fulfillment === "PICKUP"
                        ? t("pickup.heading", { defaultValue: "Choose a pickup store" })
                        : t("address.heading")}
                </h2>

                {fulfillment === "PICKUP" ? (
                    <div className="flex flex-col gap-3">
                        <p className="text-[13px] text-gray-500">
                            {t("pickup.subheading", { defaultValue: "Collect your order from one of our stores in your country — no delivery fee." })}
                        </p>
                        <PickupStoreSelector
                            countryCode={selectedCountryCode}
                            countryName={selectedCountry?.name}
                            selectedStoreId={pickupStoreId}
                            onSelect={(id) => { setPickupStoreId(id); setPickupError(""); }}
                        />
                        {pickupError && <p className="text-[12px] text-red-500">{pickupError}</p>}
                    </div>
                ) : (
                <>
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
                            {t("address.addNew", { defaultValue: "Add new address" })}
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
                                {t("address.useSaved", { defaultValue: "Use saved address" })}
                            </button>
                        )}

                        {/* Location picker — "Use my location" / dragging the pin auto-fills the address */}
                        <LocationPicker
                            initialCoords={
                                addrForm.latitude && addrForm.longitude
                                    ? { lat: addrForm.latitude, lng: addrForm.longitude }
                                    : undefined
                            }
                            onChange={(coords) => {
                                setAddrField("latitude", coords.lat);
                                setAddrField("longitude", coords.lng);
                            }}
                            onResolved={(info) => {
                                setAddrForm((p) => ({
                                    ...p,
                                    latitude: info.lat,
                                    longitude: info.lng,
                                    addressLine1: info.line || p.addressLine1,
                                    city: info.city || p.city,
                                    state: info.state || p.state,
                                    postalCode: info.postalCode || p.postalCode,
                                    country: info.countryCode || p.country || selectedCountryCode,
                                }));
                                setAddrErrors((p) => ({ ...p, addressLine1: undefined, city: undefined }));
                            }}
                        />

                        {/* Address line — auto-filled from the map, editable */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[13px] font-semibold text-gray-700">
                                {t("address.addressLine", { defaultValue: "Address" })}<span className="text-red-400 ml-0.5">*</span>
                            </label>
                            <input
                                type="text"
                                value={addrForm.addressLine1}
                                onChange={(e) => setAddrField("addressLine1", e.target.value)}
                                placeholder={t("address.addressLinePlaceholder", { defaultValue: "Building, street, area…" })}
                                className={addrErrors.addressLine1 ? inpErr : inp}
                            />
                            {addrErrors.addressLine1 && <p className="text-[11px] text-red-500">{addrErrors.addressLine1}</p>}
                        </div>

                        {/* City / State / Postal — auto-filled from the map, editable */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.city", { defaultValue: "City" })}<span className="text-red-400 ml-0.5">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.city ?? ""}
                                    onChange={(e) => setAddrField("city", e.target.value)}
                                    placeholder={t("address.cityPlaceholder", { defaultValue: "City" })}
                                    className={addrErrors.city ? inpErr : inp}
                                />
                                {addrErrors.city && <p className="text-[11px] text-red-500">{addrErrors.city}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.state", { defaultValue: "State / Region" })}
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.state ?? ""}
                                    onChange={(e) => setAddrField("state", e.target.value)}
                                    placeholder={t("address.statePlaceholder", { defaultValue: "Region" })}
                                    className={inp}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[13px] font-semibold text-gray-700">
                                    {t("address.postalCode", { defaultValue: "Postal code" })}
                                </label>
                                <input
                                    type="text"
                                    value={addrForm.postalCode ?? ""}
                                    onChange={(e) => setAddrField("postalCode", e.target.value)}
                                    placeholder={t("address.postalPlaceholder", { defaultValue: "Postal code" })}
                                    className={inp}
                                />
                            </div>
                        </div>
                        <p className="text-[11px] text-gray-400">
                            {t("address.autoFillHint", { defaultValue: "Set the pin and we'll fill these in — edit anything that's off. Name & verified phone come from your profile." })}
                        </p>

                        {saveError && <p className="text-[12px] text-red-500">{saveError}</p>}
                    </div>
                )}
                </>
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
