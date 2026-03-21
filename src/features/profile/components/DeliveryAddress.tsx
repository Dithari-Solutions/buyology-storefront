"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState } from "@/store";
import type { Address, AddressLabel, CreateAddressPayload } from "../types";
import { getAddresses, createAddress, deleteAddress, setDefaultAddress } from "../services/profile.api";

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

const EMPTY_FORM: CreateAddressPayload = {
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

function AddressForm({
    initial,
    onSave,
    onCancel,
    isSaving,
    error,
}: {
    initial?: Partial<CreateAddressPayload>;
    onSave: (payload: CreateAddressPayload) => void;
    onCancel: () => void;
    isSaving: boolean;
    error: string | null;
}) {
    const { t } = useTranslation("profile");
    const [form, setForm] = useState<CreateAddressPayload>({ ...EMPTY_FORM, ...initial });
    const [errors, setErrors] = useState<Partial<Record<keyof CreateAddressPayload, string>>>({});

    function setField<K extends keyof CreateAddressPayload>(key: K, value: CreateAddressPayload[K]) {
        setForm((p) => ({ ...p, [key]: value }));
        if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
    }

    function validate() {
        const e: Partial<Record<keyof CreateAddressPayload, string>> = {};
        if (!form.firstName.trim()) e.firstName = "Required";
        if (!form.lastName.trim()) e.lastName = "Required";
        if (!form.phoneNumber.trim()) e.phoneNumber = "Required";
        if (!form.addressLine1.trim()) e.addressLine1 = "Required";
        if (!form.city.trim()) e.city = "Required";
        if (!form.country.trim()) e.country = "Required";
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (validate()) onSave(form);
    }

    const inp = "w-full border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-[#402F75] transition-colors placeholder:text-gray-300";
    const inpErr = "w-full border border-red-300 rounded-[10px] px-3.5 py-2.5 text-[13px] text-gray-700 outline-none focus:border-red-400 transition-colors";

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Label selector */}
            <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-2">Address Type</label>
                <div className="flex gap-2">
                    {LABEL_OPTIONS.map((lbl) => (
                        <button
                            key={lbl}
                            type="button"
                            onClick={() => setField("label", lbl)}
                            className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all cursor-pointer ${
                                form.label === lbl
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
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">First Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} placeholder="Ahmed" maxLength={100} className={errors.firstName ? inpErr : inp} />
                    {errors.firstName && <p className="text-[11px] text-red-500 mt-0.5">{errors.firstName}</p>}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Last Name <span className="text-red-400">*</span></label>
                    <input type="text" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} placeholder="Al Mansouri" maxLength={100} className={errors.lastName ? inpErr : inp} />
                    {errors.lastName && <p className="text-[11px] text-red-500 mt-0.5">{errors.lastName}</p>}
                </div>
            </div>

            {/* Phone */}
            <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Phone <span className="text-red-400">*</span></label>
                <input type="tel" value={form.phoneNumber} onChange={(e) => setField("phoneNumber", e.target.value)} placeholder="+971501234567" className={errors.phoneNumber ? inpErr : inp} />
                {errors.phoneNumber && <p className="text-[11px] text-red-500 mt-0.5">{errors.phoneNumber}</p>}
            </div>

            {/* Address line 1 */}
            <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Address Line 1 <span className="text-red-400">*</span></label>
                <input type="text" value={form.addressLine1} onChange={(e) => setField("addressLine1", e.target.value)} placeholder="Building 5, Sheikh Zayed Road" className={errors.addressLine1 ? inpErr : inp} />
                {errors.addressLine1 && <p className="text-[11px] text-red-500 mt-0.5">{errors.addressLine1}</p>}
            </div>

            {/* Address line 2 */}
            <div>
                <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Address Line 2 <span className="text-[12px] text-gray-400">(optional)</span></label>
                <input type="text" value={form.addressLine2 ?? ""} onChange={(e) => setField("addressLine2", e.target.value)} placeholder="Apartment 4B, Floor 2" className={inp} />
            </div>

            {/* City / State / Country / Postal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">City <span className="text-red-400">*</span></label>
                    <input type="text" value={form.city} onChange={(e) => setField("city", e.target.value)} placeholder="Dubai" className={errors.city ? inpErr : inp} />
                    {errors.city && <p className="text-[11px] text-red-500 mt-0.5">{errors.city}</p>}
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">State / Emirate <span className="text-[12px] text-gray-400">(optional)</span></label>
                    <input type="text" value={form.state ?? ""} onChange={(e) => setField("state", e.target.value)} placeholder="Dubai" className={inp} />
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Country <span className="text-red-400">*</span></label>
                    <div className="relative">
                        <select value={form.country} onChange={(e) => setField("country", e.target.value)} className={`${inp} appearance-none pr-8 cursor-pointer`}>
                            {COUNTRIES.map((c) => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                        <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>
                <div>
                    <label className="block text-[13px] font-medium text-gray-600 mb-1.5">Postal Code <span className="text-[12px] text-gray-400">(optional)</span></label>
                    <input type="text" value={form.postalCode ?? ""} onChange={(e) => setField("postalCode", e.target.value)} placeholder="00000" className={inp} />
                </div>
            </div>

            {/* Set as default */}
            <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={form.isDefault ?? false}
                    onChange={(e) => setField("isDefault", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 accent-[#402F75] cursor-pointer"
                />
                <span className="text-[13px] text-gray-600">Set as default address</span>
            </label>

            {error && <p className="text-[12px] text-red-500">{error}</p>}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-[10px] border border-gray-200 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {t("deliveryAddress.cancelButton")}
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-[10px] bg-[#402F75] text-white text-[13px] font-semibold hover:bg-[#2e2156] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSaving && <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />}
                    {t("deliveryAddress.saveButton")}
                </button>
            </div>
        </form>
    );
}

function AddressCard({
    address,
    onDelete,
    onSetDefault,
    isDeleting,
    isSettingDefault,
}: {
    address: Address;
    onDelete: (id: string) => void;
    onSetDefault: (id: string) => void;
    isDeleting: boolean;
    isSettingDefault: boolean;
}) {
    const countryName = COUNTRIES.find((c) => c.code === address.country)?.name ?? address.country;

    return (
        <div className={`relative rounded-[14px] border-2 p-4 transition-all ${address.isDefault ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-100 bg-white"}`}>
            {/* Label + Default badge */}
            <div className="flex items-center gap-2 mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${LABEL_COLORS[address.label]}`}>
                    {address.label}
                </span>
                {address.isDefault && (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EDE9FF] text-[#402F75]">
                        Default
                    </span>
                )}
            </div>

            {/* Name + phone */}
            <p className="text-[14px] font-semibold text-gray-800">{address.firstName} {address.lastName}</p>
            <p className="text-[13px] text-gray-500 mt-0.5">{address.phoneNumber}</p>

            {/* Address lines */}
            <p className="text-[13px] text-gray-600 mt-2">{address.addressLine1}</p>
            {address.addressLine2 && <p className="text-[13px] text-gray-500">{address.addressLine2}</p>}
            <p className="text-[13px] text-gray-500">
                {[address.city, address.state, countryName].filter(Boolean).join(", ")}
                {address.postalCode ? ` ${address.postalCode}` : ""}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                {!address.isDefault && (
                    <button
                        onClick={() => onSetDefault(address.id)}
                        disabled={isSettingDefault}
                        className="text-[12px] font-semibold text-[#402F75] hover:underline cursor-pointer disabled:opacity-50"
                    >
                        {isSettingDefault ? "Setting…" : "Set as default"}
                    </button>
                )}
                <button
                    onClick={() => onDelete(address.id)}
                    disabled={isDeleting}
                    className="ml-auto flex items-center gap-1.5 text-[12px] text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {isDeleting ? (
                        <div className="w-3 h-3 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                    )}
                    Delete
                </button>
            </div>
        </div>
    );
}

export default function DeliveryAddress() {
    const { t } = useTranslation("profile");
    const userId = useSelector((state: RootState) => state.auth.userId);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        setIsLoading(true);
        getAddresses(userId)
            .then(setAddresses)
            .catch(() => setLoadError("Failed to load addresses."))
            .finally(() => setIsLoading(false));
    }, [userId]);

    async function handleAddAddress(payload: CreateAddressPayload) {
        if (!userId) return;
        setIsSaving(true);
        setSaveError(null);
        try {
            const created = await createAddress(userId, payload);
            setAddresses((prev) => {
                const updated = payload.isDefault
                    ? prev.map((a) => ({ ...a, isDefault: false }))
                    : prev;
                return [...updated, created];
            });
            setShowAddForm(false);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to save address.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDelete(addressId: string) {
        if (!userId) return;
        setDeletingId(addressId);
        try {
            await deleteAddress(userId, addressId);
            setAddresses((prev) => prev.filter((a) => a.id !== addressId));
        } catch {
            // silent
        } finally {
            setDeletingId(null);
        }
    }

    async function handleSetDefault(addressId: string) {
        if (!userId) return;
        setSettingDefaultId(addressId);
        try {
            await setDefaultAddress(userId, addressId);
            setAddresses((prev) =>
                prev.map((a) => ({ ...a, isDefault: a.id === addressId }))
            );
        } catch {
            // silent
        } finally {
            setSettingDefaultId(null);
        }
    }

    return (
        <div className="bg-white rounded-[20px] p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    <h2 className="font-bold text-[18px] text-gray-800">{t("deliveryAddress.heading")}</h2>
                </div>

                {!showAddForm && (
                    <button
                        onClick={() => { setShowAddForm(true); setSaveError(null); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FBBB14] text-gray-900 text-[13px] font-semibold hover:bg-[#e6a800] transition-colors cursor-pointer"
                    >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Address
                    </button>
                )}
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 rounded-full border-2 border-[#402F75] border-t-transparent animate-spin" />
                </div>
            )}

            {/* Load error */}
            {loadError && (
                <p className="text-[13px] text-red-500 text-center py-6">{loadError}</p>
            )}

            {/* Address cards grid */}
            {!isLoading && !loadError && (
                <>
                    {addresses.length === 0 && !showAddForm && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-14 h-14 rounded-full bg-[#EDE9FF] flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                    <circle cx="12" cy="10" r="3" />
                                </svg>
                            </div>
                            <p className="text-[14px] text-gray-500">No saved addresses yet</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="text-[13px] font-semibold text-[#402F75] hover:underline cursor-pointer"
                            >
                                Add your first address
                            </button>
                        </div>
                    )}

                    {addresses.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {addresses.map((addr) => (
                                <AddressCard
                                    key={addr.id}
                                    address={addr}
                                    onDelete={handleDelete}
                                    onSetDefault={handleSetDefault}
                                    isDeleting={deletingId === addr.id}
                                    isSettingDefault={settingDefaultId === addr.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add form */}
                    {showAddForm && (
                        <div className="mt-2 pt-4 border-t border-gray-100">
                            <h3 className="text-[15px] font-bold text-gray-800 mb-4">New Address</h3>
                            <AddressForm
                                onSave={handleAddAddress}
                                onCancel={() => { setShowAddForm(false); setSaveError(null); }}
                                isSaving={isSaving}
                                error={saveError}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Privacy note */}
            <div className="mt-6 bg-[#EDE9FF] rounded-[12px] px-4 py-3 flex items-start gap-3">
                <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <p className="text-[12px] text-[#402F75]">{t("deliveryAddress.privacyNote")}</p>
            </div>
        </div>
    );
}
