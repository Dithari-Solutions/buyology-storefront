import { apiClient } from "@/shared/lib/apiClient";

// ── B2B Product-Sourcing Request — member API ───────────────────────────────
// Lets an ACTIVE B2B member ask Buyology to source a product that isn't in the
// catalog. Member endpoints under `/api/b2b/product-requests` (auth + ACTIVE
// B2bMembership; the backend returns 403 for non-members). All responses are
// wrapped in the standard ApiResponse envelope — unwrap `.data.data`.

/** Minimum quantity for a product request — enforced client-side + by the backend (400 below this). */
export const B2B_PRODUCT_REQUEST_MIN_QTY = 5;

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

function unwrap<T>(res: { data: ApiResponse<T> }): T {
  return res.data.data;
}

export type B2bProductRequestStatus =
  | "NEW"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "REJECTED";

export interface B2bProductRequest {
  id: string;
  productName: string;
  quantity: number;
  message: string | null;
  /** Presigned GET url — backend converts the stored image key on read. */
  imageUrl: string | null;
  status: B2bProductRequestStatus;
  procurementNote: string | null;
  memberName: string | null;
  contactEmail: string | null;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export interface SubmitProductRequestPayload {
  productName: string;
  quantity: number;
  message?: string;
  /** Optional single reference image — sent as multipart/form-data. */
  image?: File;
}

/**
 * Submit a new product-sourcing request. Builds multipart/form-data appending
 * each scalar field individually + the optional image, mirroring the review
 * service. quantity must be >= {@link B2B_PRODUCT_REQUEST_MIN_QTY}.
 */
export async function submitProductRequest(
  payload: SubmitProductRequestPayload,
): Promise<B2bProductRequest> {
  const formData = new FormData();
  formData.append("productName", payload.productName);
  formData.append("quantity", String(payload.quantity));
  if (payload.message) formData.append("message", payload.message);
  if (payload.image) formData.append("image", payload.image);

  return unwrap(
    await apiClient.post<ApiResponse<B2bProductRequest>>(
      "/api/b2b/product-requests",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    ),
  );
}
