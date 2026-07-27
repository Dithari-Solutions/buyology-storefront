import { apiClient } from "@/shared/lib/apiClient";

// ── RFQ (Request-for-Quote) — B2B member quote/cart API ─────────────────────
// Member endpoints under `/api/b2b/quote` (auth + ACTIVE B2bMembership; the
// backend returns 403 for non-members). The DRAFT quote IS the B2B cart. All
// responses are wrapped in the standard ApiResponse envelope.

/** Minimum quantity per B2B quote line — enforced by the backend (400 below this). */
export const B2B_MIN_QTY_PER_LINE = 5;

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

export type B2bQuoteStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "QUOTED"
  | "ACCEPTED"
  | "AWAITING_PAYMENT_VERIFICATION"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELLED"
  | "ORDERED";

export interface B2bQuoteItem {
  id: string;
  storeProductId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  productTitle: string | null;
  sku: string | null;
  /** Lead time set by procurement at pricing (e.g. "2–3 weeks"). */
  leadTime: string | null;
  /** Optional line description set by procurement at pricing. */
  description: string | null;
  /** null until the quote is QUOTED by procurement. */
  quotedUnitPrice: number | null;
  /** quantity * quotedUnitPrice; null until QUOTED. */
  quotedLineTotal: number | null;
  /** true when quantity < {@link B2B_MIN_QTY_PER_LINE}. */
  belowMinimum: boolean;
}

export interface B2bQuote {
  id: string;
  status: B2bQuoteStatus;
  countryCode: string;
  currency: string;
  memberNote: string | null;
  procurementNote: string | null;
  /** Payment terms set by procurement (shown to the member + on the order email). */
  paymentTerms: string | null;
  /** Terms & conditions set by procurement. */
  termsAndConditions: string | null;
  /** "BANK_TRANSFER" once the member submits a bank-transfer proof. */
  paymentMethod: string | null;
  /** Presigned URL of the uploaded bank-transfer proof; null if none. */
  proofOfPaymentFileUrl: string | null;
  proofUploadedAt: string | null;
  paymentVerifiedAt: string | null;
  submittedAt: string | null;
  quotedAt: string | null;
  validUntil: string | null;
  acceptedAt: string | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Always 5 — the enforced per-line minimum. */
  minQtyPerLine: number;
  /** true when any line is below the minimum (blocks submit/checkout). */
  belowMinimum: boolean;
  /** Sum of quoted line totals; null until QUOTED. */
  quotedSubtotal: number | null;
  items: B2bQuoteItem[];
}

/** Payment-initiation response returned by checkout (redirect the user to checkoutUrl). */
export interface B2bQuotePaymentInitiated {
  transactionId: string;
  methodType: "CARD" | "TABBY" | "TAMARA";
  amount: number;
  currency: string;
  clientSecret: string;
  checkoutUrl: string;
}

export interface AddQuoteItemRequest {
  storeProductId: string;
  variantId?: string;
  quantity: number;
}

export interface CheckoutQuoteRequest {
  /** "PICKUP" collects from a store; anything else is treated as DELIVERY. */
  deliveryMethod?: "PICKUP" | "DELIVERY";
  addressId?: string;
  pickupStoreId?: string;
  methodType: "CARD" | "TABBY" | "TAMARA";
  customerEmail?: string;
  redirectionUrl?: string;
}

/** Delivery target for a bank-transfer checkout (no gateway method — paid externally). */
export interface BankTransferCheckoutRequest {
  deliveryMethod?: "PICKUP" | "DELIVERY";
  addressId?: string;
  pickupStoreId?: string;
}

/** GET current DRAFT quote (the B2B cart); the backend creates an empty draft if none exists. */
export async function getQuoteCart(): Promise<B2bQuote> {
  return unwrap(await apiClient.get<ApiResponse<B2bQuote>>("/api/b2b/quote/cart"));
}

/** Add (or upsert) a line to the B2B cart. quantity must be >= {@link B2B_MIN_QTY_PER_LINE}. */
export async function addQuoteItem(req: AddQuoteItemRequest): Promise<B2bQuote> {
  return unwrap(await apiClient.post<ApiResponse<B2bQuote>>("/api/b2b/quote/cart/items", req));
}

/** Update a line's quantity (>= {@link B2B_MIN_QTY_PER_LINE}). */
export async function updateQuoteItem(
  itemId: string,
  req: { quantity: number },
): Promise<B2bQuote> {
  return unwrap(
    await apiClient.patch<ApiResponse<B2bQuote>>(`/api/b2b/quote/cart/items/${itemId}`, req),
  );
}

/** Remove a line from the B2B cart. */
export async function removeQuoteItem(itemId: string): Promise<B2bQuote> {
  return unwrap(
    await apiClient.delete<ApiResponse<B2bQuote>>(`/api/b2b/quote/cart/items/${itemId}`),
  );
}

/** Submit the DRAFT cart for pricing (DRAFT → SUBMITTED). Requires all lines >= min. */
export async function submitQuote(req: { memberNote?: string } = {}): Promise<B2bQuote> {
  return unwrap(await apiClient.post<ApiResponse<B2bQuote>>("/api/b2b/quote/cart/submit", req));
}

/** My quote history (all statuses). */
export async function listMyQuotes(): Promise<B2bQuote[]> {
  return unwrap(await apiClient.get<ApiResponse<B2bQuote[]>>("/api/b2b/quote")) ?? [];
}

/** Quote detail (owner only). */
export async function getQuote(id: string): Promise<B2bQuote> {
  return unwrap(await apiClient.get<ApiResponse<B2bQuote>>(`/api/b2b/quote/${id}`));
}

/** Accept a QUOTED quote (QUOTED → ACCEPTED). 400 if past validUntil. Enables checkout. */
export async function acceptQuote(id: string): Promise<B2bQuote> {
  return unwrap(await apiClient.post<ApiResponse<B2bQuote>>(`/api/b2b/quote/${id}/accept`));
}

/** Cancel a quote (DRAFT/SUBMITTED/QUOTED → CANCELLED). */
export async function cancelQuote(id: string): Promise<B2bQuote> {
  return unwrap(await apiClient.post<ApiResponse<B2bQuote>>(`/api/b2b/quote/${id}/cancel`));
}

/** Check out an ACCEPTED quote → creates the order + initiates payment. Redirect to checkoutUrl. */
export async function checkoutQuote(
  id: string,
  body: CheckoutQuoteRequest,
): Promise<B2bQuotePaymentInitiated> {
  return unwrap(
    await apiClient.post<ApiResponse<B2bQuotePaymentInitiated>>(
      `/api/b2b/quote/${id}/checkout`,
      body,
    ),
  );
}

/**
 * Pay an accepted quote by bank transfer, uploading proof of payment. The order is
 * created and the quote moves to AWAITING_PAYMENT_VERIFICATION until procurement
 * validates the proof. Sent as multipart: a JSON `data` part + the `proof` file.
 */
export async function submitBankTransfer(
  id: string,
  body: BankTransferCheckoutRequest,
  proof: File,
): Promise<B2bQuote> {
  const form = new FormData();
  form.append("data", new Blob([JSON.stringify(body)], { type: "application/json" }));
  form.append("proof", proof);
  return unwrap(
    await apiClient.post<ApiResponse<B2bQuote>>(`/api/b2b/quote/${id}/bank-transfer`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );
}
