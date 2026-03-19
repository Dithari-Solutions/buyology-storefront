import { apiClient } from "@/shared/lib/apiClient";

export interface ReviewMedia {
  id: string;
  url: string;
  mediaType: "IMAGE" | "VIDEO";
  sortOrder: number;
  createdAt: string;
}

export interface ReviewReplyDto {
  id: string;
  adminId: string;
  adminFirstName: string;
  adminLastName: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewResponse {
  id: string;
  productId: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  rating: number;
  title: string | null;
  body: string | null;
  isVerifiedPurchase: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  helpfulCount: number;
  notHelpfulCount: number;
  media: ReviewMedia[];
  reply: ReviewReplyDto | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  productId: string;
  totalReviews: number;
  averageRating: string;
  rating1Count: number;
  rating2Count: number;
  rating3Count: number;
  rating4Count: number;
  rating5Count: number;
  updatedAt: string;
}

export interface SubmitReviewPayload {
  productId: string;
  /** JWT sub claim value (AuthCredentials ID) */
  authCredentialId: string;
  rating: number;
  title?: string;
  body?: string;
  /** Up to 2 image files — sent as multipart/form-data */
  images?: File[];
}

const PAGE_SIZE = 10;

export async function getProductReviews(
  productId: string,
  page = 0,
  size = PAGE_SIZE
): Promise<ReviewResponse[]> {
  const { data } = await apiClient.get<{ data: ReviewResponse[] }>(
    `/api/reviews/product/${productId}`,
    { params: { page, size } }
  );
  return data.data ?? [];
}

export async function getReviewStats(productId: string): Promise<ReviewStats> {
  const { data } = await apiClient.get<{ data: ReviewStats }>(
    `/api/reviews/product/${productId}/stats`
  );
  return data.data;
}

export async function submitReview(payload: SubmitReviewPayload): Promise<ReviewResponse> {
  const { images, ...requestFields } = payload;

  const formData = new FormData();
  formData.append("request", JSON.stringify(requestFields));

  if (images) {
    images.slice(0, 2).forEach((file) => formData.append("images", file));
  }

  const { data } = await apiClient.post<{ data: ReviewResponse }>("/api/reviews", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data;
}

export async function voteReview(
  reviewId: string,
  authCredentialId: string,
  isHelpful: boolean
): Promise<void> {
  await apiClient.post(`/api/reviews/${reviewId}/vote`, { authCredentialId, isHelpful });
}

export async function removeReviewVote(reviewId: string, authCredentialId: string): Promise<void> {
  await apiClient.delete(`/api/reviews/${reviewId}/vote`, { params: { authCredentialId } });
}
