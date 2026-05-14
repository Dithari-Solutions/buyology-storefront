import { apiClient } from "@/shared/lib/apiClient";
import type { Lang } from "@/config/pathSlugs";

export interface ApiBanner {
  id: string;
  backgroundImageUrl: string;
  text?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  sortOrder: number;
  status: string;
  createdAt: string;
}

interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

const LANG_PARAM: Record<Lang, string> = {
  en: "EN",
  az: "AZ",
  ar: "AR",
};

export async function getBanners(lang: Lang = "en"): Promise<ApiBanner[]> {
  const res = await apiClient.get<ApiResponse<ApiBanner[]>>("/api/banner", {
    params: { language: LANG_PARAM[lang] },
  });
  return res.data?.data ?? [];
}
