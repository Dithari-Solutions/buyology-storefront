"use client";

import { useEffect, useState } from "react";
import { b2bAccountApi } from "@/features/b2b/account/api";

interface Props {
  userId: string;
  orderTotal: number;
  orderCurrency: string;
  /** Called whenever the user changes the credit amount (in wallet currency). 0 = don't use credit. */
  onChange: (amount: number, walletCurrency: string | null) => void;
}

export default function B2bCreditPanel({ userId, orderTotal, orderCurrency, onChange }: Props) {
  const [wallet, setWallet] = useState<{
    balance: number;
    currency: string;
    creditLimit?: number;
    minOrderAmount?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<"full" | "partial">("full");
  const [partialInput, setPartialInput] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    b2bAccountApi
      .getMyWallet(userId)
      .then((w) => {
        if (!cancelled) setWallet(w);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Re-emit chosen credit amount whenever inputs change.
  useEffect(() => {
    if (!wallet) {
      onChange(0, null);
      return;
    }
    if (!enabled) {
      onChange(0, wallet.currency);
      return;
    }
    // Convert order total to wallet currency only if currencies match — otherwise
    // we just cap by the wallet balance and let the backend do its conversion.
    const sameCcy = orderCurrency.toUpperCase() === wallet.currency.toUpperCase();
    const max = sameCcy
      ? Math.min(orderTotal, wallet.balance)
      : wallet.balance; // backend converts and caps further
    if (mode === "full") {
      onChange(max, wallet.currency);
    } else {
      const n = parseFloat(partialInput);
      if (Number.isFinite(n) && n > 0) {
        onChange(Math.min(n, max), wallet.currency);
      } else {
        onChange(0, wallet.currency);
      }
    }
  }, [enabled, mode, partialInput, wallet, orderTotal, orderCurrency, onChange]);

  if (loading) return null;
  if (!wallet || wallet.balance <= 0) return null;

  const sameCcy = orderCurrency.toUpperCase() === wallet.currency.toUpperCase();
  const belowMin = sameCcy
    && wallet.minOrderAmount != null
    && orderTotal < wallet.minOrderAmount;
  const blockedReason = belowMin
    ? `Minimum order of ${wallet.minOrderAmount!.toLocaleString(undefined, {
        minimumFractionDigits: 2, maximumFractionDigits: 2,
      })} ${wallet.currency} required to pay with credit.`
    : null;

  return (
    <div className="rounded-2xl border border-[#402F75]/30 bg-[#FAF8FF] p-5">
      <div className="flex items-start gap-3">
        <input
          id="b2b-credit-toggle"
          type="checkbox"
          checked={enabled}
          disabled={blockedReason !== null}
          onChange={(e) => setEnabled(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <label htmlFor="b2b-credit-toggle" className="flex-1 cursor-pointer">
          <div className="font-semibold text-[#402F75]">Use B2B credit</div>
          <div className="mt-0.5 text-xs text-gray-600">
            Available: <strong>{wallet.balance.toLocaleString()} {wallet.currency}</strong>
            {wallet.creditLimit != null && (
              <span className="ml-1 text-gray-400">/ {wallet.creditLimit.toLocaleString()} {wallet.currency}</span>
            )}
          </div>
        </label>
      </div>

      {blockedReason && (
        <p className="mt-2 text-xs font-medium text-amber-700">{blockedReason}</p>
      )}

      {enabled && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                mode === "full"
                  ? "border-[#402F75] bg-[#402F75] text-white"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              Use full credit
            </button>
            <button
              type="button"
              onClick={() => setMode("partial")}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                mode === "partial"
                  ? "border-[#402F75] bg-[#402F75] text-white"
                  : "border-gray-300 bg-white text-gray-700"
              }`}
            >
              Specify amount
            </button>
          </div>

          {mode === "partial" && (
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Amount in {wallet.currency}
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min={0}
                max={wallet.balance}
                value={partialInput}
                onChange={(e) => setPartialInput(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#402F75] focus:outline-none focus:ring-1 focus:ring-[#402F75]"
              />
            </div>
          )}

          <div className="rounded-md bg-white px-3 py-2 text-xs text-gray-600">
            {wallet.minOrderAmount != null ? (
              <>Eligible orders: <strong>{wallet.minOrderAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {wallet.currency}+</strong>.</>
            ) : (
              <>Eligible orders: <strong>AED 20,000+</strong> (or local-currency equivalent set by admin).</>
            )}
            {orderCurrency.toUpperCase() !== wallet.currency.toUpperCase() && (
              <span className="ml-1">Order currency ({orderCurrency}) will be converted to wallet currency ({wallet.currency}) at live FX.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
