import { apiClient } from "@/shared/lib/apiClient";

export type AppLanguage = "AZ" | "EN" | "AR";

export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
}

export interface StoryMedia {
    mediaType: "IMAGE" | "VIDEO";
    orderIndex: number;
    thumbnailUrl: string | null;
    url: string;
}

export interface StorySummaryResponse {
    id: string;
    title: string;
    thumbnailUrl: string;
    media: StoryMedia[];
}

export const getStories = async (
    language: AppLanguage = "AZ"
): Promise<StorySummaryResponse[]> => {
    const { data } = await apiClient.get<ApiResponse<StorySummaryResponse[]>>(
        "/api/story",
        { params: { language } }
    );

    if (!data?.data) {
        throw new Error("Invalid stories response format");
    }

    return data.data;
};
