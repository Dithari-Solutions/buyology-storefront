import { apiClient } from "@/shared/lib/apiClient";

export interface QuestionAnswerDto {
  id: string;
  adminId: string;
  adminFirstName: string;
  adminLastName: string;
  body: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  id: string;
  productId: string;
  userId: string;
  userFirstName: string;
  userLastName: string;
  body: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  helpfulCount: number;
  answer: QuestionAnswerDto | null;
  createdAt: string;
  updatedAt: string;
}

const PAGE_SIZE = 10;

export async function getProductQuestions(
  productId: string,
  page = 0,
  size = PAGE_SIZE
): Promise<QuestionResponse[]> {
  const { data } = await apiClient.get<{ data: QuestionResponse[] }>(
    `/api/questions/product/${productId}`,
    { params: { page, size } }
  );
  return data.data ?? [];
}

export async function askQuestion(payload: {
  productId: string;
  userId: string;
  body: string;
}): Promise<QuestionResponse> {
  const { data } = await apiClient.post<{ data: QuestionResponse }>("/api/questions", payload);
  return data.data;
}

export async function voteQuestion(questionId: string, userId: string): Promise<void> {
  await apiClient.post(`/api/questions/${questionId}/vote`, { userId });
}

export async function removeQuestionVote(questionId: string, userId: string): Promise<void> {
  await apiClient.delete(`/api/questions/${questionId}/vote`, { params: { userId } });
}
