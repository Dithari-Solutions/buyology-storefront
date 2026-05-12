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
    status: string;
    media: StoryMedia[];
    viewCount: number;
    likeCount: number;
    likedByMe: boolean;
}

export interface StoryLikeResponse {
    liked: boolean;
    likeCount: number;
}

export interface StoryViewResponseData {
    viewCount: number;
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

export const recordStoryView = async (
    storyId: string
): Promise<StoryViewResponseData> => {
    const { data } = await apiClient.post<ApiResponse<StoryViewResponseData>>(
        `/api/story/${storyId}/view`
    );
    return data.data;
};

export const likeStory = async (storyId: string): Promise<StoryLikeResponse> => {
    const { data } = await apiClient.post<ApiResponse<StoryLikeResponse>>(
        `/api/story/${storyId}/like`
    );
    return data.data;
};

export const unlikeStory = async (storyId: string): Promise<StoryLikeResponse> => {
    const { data } = await apiClient.delete<ApiResponse<StoryLikeResponse>>(
        `/api/story/${storyId}/like`
    );
    return data.data;
};
