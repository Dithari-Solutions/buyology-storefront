"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getPublicStores, type PublicStore, type PublicStoreLocation } from "@/features/contact/services/storeService";
import { aliasesFor } from "@/features/country/lib/match";

const ORDERED_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;
const DAY_LABELS: Record<string, string> = {
    MONDAY: "Mon", TUESDAY: "Tue", WEDNESDAY: "Wed", THURSDAY: "Thu", FRIDAY: "Fri", SATURDAY: "Sat", SUNDAY: "Sun",
};
const norm = (s: string | null | undefined) => (s ?? "").trim().toLowerCase();
const fmtTime = (t: string | null) => (t ? t.slice(0, 5) : "");

/** Pick the branch in the customer's country, else the primary/first one. */
function pickLocation(store: PublicStore, tokens: Set<string>): PublicStoreLocation | undefined {
    return (store.locations ?? []).find((l) => tokens.has(norm(l.country)))
        ?? (store.locations ?? []).find((l) => l.isPrimary)
        ?? store.locations?.[0];
}

export interface PickupStoreSelectorProps {
    /** Detected/selected country (ISO code, e.g. "AE"). */
    countryCode: string;
    countryName?: string | null;
    selectedStoreId: string | null;
    onSelect: (storeId: string) => void;
}

/**
 * Lets the shopper choose a store branch to collect their order from. Only stores in the
 * customer's detected country are shown, each with its address, contact, and weekly opening
 * hours — mirroring the contact page. The selected store's id is lifted to the checkout.
 */
export default function PickupStoreSelector({
    countryCode,
    countryName,
    selectedStoreId,
    onSelect,
}: PickupStoreSelectorProps) {
    const { t } = useTranslation("checkout");
    const [stores, setStores] = useState<PublicStore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getPublicStores()
            .then((s) => { if (active) setStores(s); })
            .catch(() => { /* non-blocking */ })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, []);

    // Tokens that identify the customer's country (ISO aliases + the country name).
    const tokens = useMemo(() => {
        const set = new Set<string>(aliasesFor(countryCode).map((a) => a.toLowerCase()));
        if (countryName) set.add(norm(countryName));
        if (countryCode) set.add(norm(countryCode));
        return set;
    }, [countryCode, countryName]);

    // Stores that have a presence in the customer's country.
    const inCountry = useMemo(
        () =>
            stores.filter(
                (store) =>
                    tokens.has(norm(store.countryName)) ||
                    (store.locations ?? []).some((l) => tokens.has(norm(l.country)))
            ),
        [stores, tokens]
    );

    if (loading) {
        return (
            <div className="flex items-center gap-2 text-[13px] text-gray-400 py-4">
                <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
                {t("pickup.loading", { defaultValue: "Loading nearby stores…" })}
            </div>
        );
    }

    if (inCountry.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-center">
                <p className="text-[13px] text-gray-500">
                    {t("pickup.none", { defaultValue: "No pickup stores are available in your country right now. Please choose delivery instead." })}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {inCountry.map((store) => {
                const loc = pickLocation(store, tokens);
                const isSelected = selectedStoreId === store.id;
                const addressParts = [loc?.branchName, loc?.address, loc?.city, loc?.country].filter(Boolean) as string[];
                const hours = loc?.operatingHours ?? null;
                return (
                    <button
                        key={store.id}
                        type="button"
                        onClick={() => onSelect(store.id)}
                        className={`w-full text-left rounded-[14px] border-2 p-4 transition-all cursor-pointer ${
                            isSelected ? "border-[#402F75] bg-[#F8F6FF]" : "border-gray-100 bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                        <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-[#402F75]" : "border-gray-300"}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-[#402F75]" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[14px] font-semibold text-gray-900">{store.name}</p>
                                {addressParts.length > 0 && (
                                    <p className="text-[13px] text-gray-500 mt-0.5">{addressParts.join(", ")}</p>
                                )}
                                <div className="mt-1 flex flex-col gap-0.5 text-[12px] text-gray-400">
                                    {store.contactPhone && <span>{store.contactPhone}</span>}
                                    {store.contactEmail && <span className="break-all">{store.contactEmail}</span>}
                                </div>

                                {hours && hours.length > 0 && (
                                    <div className="mt-3 border-t border-gray-100 pt-2.5">
                                        <p className="text-[11px] font-bold uppercase tracking-wide text-[#402F75] mb-1.5">
                                            {t("pickup.hours", { defaultValue: "Opening hours" })}
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                                            {ORDERED_DAYS.map((day) => {
                                                const h = hours.find((x) => x.dayOfWeek === day);
                                                const closed = !h || h.isClosed || !h.openTime || !h.closeTime;
                                                return (
                                                    <div key={day} className="flex items-center justify-between text-[12px]">
                                                        <span className="text-gray-500">
                                                            {t(`days.${day.toLowerCase()}`, { defaultValue: DAY_LABELS[day] })}
                                                        </span>
                                                        <span className={closed ? "text-gray-400" : "text-gray-700 font-medium"}>
                                                            {closed
                                                                ? t("pickup.closed", { defaultValue: "Closed" })
                                                                : `${fmtTime(h!.openTime)} – ${fmtTime(h!.closeTime)}`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
