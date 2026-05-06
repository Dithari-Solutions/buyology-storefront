"use client";

import { useEffect, useState } from "react";
import { b2bAccountApi, type CreditUsage, type CreditUsageStatus } from "./api";

const STATUS_CLASS: Record<CreditUsageStatus, string> = {
  OUTSTANDING: "bg-yellow-100 text-yellow-800",
  PARTIAL: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
};

export default function B2BAccountPage() {
  const [usages, setUsages] = useState<CreditUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyLifecycle, setBusyLifecycle] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const load = () => {
    setLoading(true);
    b2bAccountApi
      .listCreditUsages()
      .then(setUsages)
      .catch(() => setError("Could not load credit usages."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const payBack = async (usage: CreditUsage) => {
    setBusyId(usage.id);
    setError("");
    try {
      const result = await b2bAccountApi.initiatePayback(usage.id);
      // Redirect to Paymob checkout
      window.location.href = result.checkoutUrl;
    } catch (e: unknown) {
      setError((e as Error).message ?? "Payback initiation failed");
    } finally {
      setBusyId(null);
    }
  };

  const runLifecycle = async (op: "freeze" | "unfreeze" | "delete") => {
    if (op === "delete" && !confirm("Move your membership to trash? It will be permanently removed after 30 days unless restored.")) return;
    setBusyLifecycle(op);
    try {
      if (op === "freeze") await b2bAccountApi.freezeMembership();
      else if (op === "unfreeze") await b2bAccountApi.unfreezeMembership();
      else await b2bAccountApi.deleteMembership();
      alert(op + " complete");
    } catch (e: unknown) {
      alert((e as Error).message ?? "Action failed");
    } finally {
      setBusyLifecycle(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">B2B Membership</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage your B2B credit usages and account.
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-medium text-gray-900">Credit usages</h2>
        {error && <div className="mt-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="mt-6 text-sm text-gray-500">Loading…</div>
        ) : usages.length === 0 ? (
          <div className="mt-6 rounded-md border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
            You haven&apos;t used your B2B credit yet.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 rounded-md border border-gray-200">
            {usages.map((u) => {
              const outstanding = u.amount - (u.paidAmount ?? 0);
              return (
                <li key={u.id} className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[u.status]}`}>
                        {u.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Used {new Date(u.usedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-1 text-sm font-medium text-gray-900">
                      {u.amount.toLocaleString()} {u.currency}
                      {outstanding > 0 && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({outstanding.toLocaleString()} {u.currency} outstanding)
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      Due {new Date(u.dueAt).toLocaleDateString()} · Order{" "}
                      <span className="font-mono">{u.orderId.slice(0, 8)}…</span>
                    </div>
                  </div>
                  {u.status !== "PAID" && (
                    <button
                      onClick={() => payBack(u)}
                      disabled={busyId === u.id}
                      className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                      {busyId === u.id ? "Redirecting…" : "Pay back"}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium text-gray-900">Membership lifecycle</h2>
        <p className="mt-1 text-sm text-gray-500">
          Freeze your membership to pause it. Deleting moves it to trash; if not restored within 30
          days, it is permanently removed. You cannot delete a membership while you have outstanding
          credit.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={busyLifecycle !== null}
            onClick={() => runLifecycle("freeze")}
            className="rounded-md border border-yellow-400 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
          >
            {busyLifecycle === "freeze" ? "Freezing…" : "Freeze"}
          </button>
          <button
            disabled={busyLifecycle !== null}
            onClick={() => runLifecycle("unfreeze")}
            className="rounded-md border border-blue-400 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
          >
            {busyLifecycle === "unfreeze" ? "Unfreezing…" : "Unfreeze"}
          </button>
          <button
            disabled={busyLifecycle !== null}
            onClick={() => runLifecycle("delete")}
            className="rounded-md border border-red-400 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {busyLifecycle === "delete" ? "Deleting…" : "Delete membership"}
          </button>
        </div>
      </section>
    </div>
  );
}
