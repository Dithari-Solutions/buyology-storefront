import { apiClient } from "@/shared/lib/apiClient";

/**
 * Convert an amount between currencies via the backend's live FX rates.
 * Returns the converted amount, or `null` when conversion isn't available
 * (so callers can fall back to the original value/currency).
 */
export async function convertAmount(
  amount: number,
  from: string,
  to: string
): Promise<number | null> {
  if (!to || from.toUpperCase() === to.toUpperCase()) return amount;
  try {
    const { data } = await apiClient.get<{ data: { amount: number; currency: string } | null }>(
      "/api/currency/convert",
      { params: { amount, from, to } }
    );
    const value = data?.data?.amount;
    return typeof value === "number" ? value : null;
  } catch {
    return null;
  }
}
