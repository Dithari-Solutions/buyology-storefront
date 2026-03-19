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
  userId: string;
  rating: number;
  title?: string;
  body?: string;
  orderItemId?: string;
  media?: { url: string; mediaType: "IMAGE" | "VIDEO"; sortOrder: number }[];
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
  const { data } = await apiClient.post<{ data: ReviewResponse }>("/api/reviews", payload);
  return data.data;
}

export async function voteReview(
  reviewId: string,
  userId: string,
  isHelpful: boolean
): Promise<void> {
  await apiClient.post(`/api/reviews/${reviewId}/vote`, { userId, isHelpful });
}

export async function removeReviewVote(reviewId: string, userId: string): Promise<void> {
  await apiClient.delete(`/api/reviews/${reviewId}/vote`, { params: { userId } });
}
