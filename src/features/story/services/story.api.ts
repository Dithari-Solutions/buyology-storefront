import { apiClient } from "@/shared/lib/apiClient";

/**
 * Supported languages for API requests
 */
export type AppLanguage = "AZ" | "EN" | "AR";

/**
 * Generic API wrapper type
 */
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success?: boolean;
}

/**
 * Story summary model
 */
export interface StorySummaryResponse {
    id: string;
    title: string;
    thumbnailUrl: string;
    createdAt: string;
}

/**
 * Fetch all stories
 */
export const getStories = async (
    language: AppLanguage = "AZ"
): Promise<StorySummaryResponse[]> => {
    const { data } = await apiClient.get<ApiResponse<StorySummaryResponse[]>>(
        "/api/story",
        {
            params: { language },
        }
    );

    // Defensive safety check
    if (!data?.data) {
        throw new Error("Invalid stories response format");
    }

    return data.data;
};
