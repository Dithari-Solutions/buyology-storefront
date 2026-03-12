import { apiClient } from "@/shared/lib/apiClient";
import type { Lang } from "@/config/pathSlugs";

export interface ApiProductMedia {
  id: string;
  mediaType: string;
  url: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
  orderIndex: number;
}

export interface ApiSpecOption {
  id: string;
  value: string;
  unit: string;
  additionalPrice: number;
}

export interface ApiSpec {
  id: string;
  code: string;
  name: string;
  options: ApiSpecOption[];
}

export interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  effectivePrice: number;
  discountType: string | null;
  discountValue: number | null;
  isRefurbished: boolean;
  refurbGrade: string | null;
  productType: string;
  sku: string;
  categoryId: string;
  colors: string[];
  accessoryIds: string[];
  media: ApiProductMedia[];
  specs: ApiSpec[];
  variants: unknown[];
  createdAt: string;
  updatedAt: string;
}

const LANG_PARAM: Record<Lang, string> = {
  en: "EN",
  az: "AZ",
  ar: "AR",
};

export async function getProducts(lang: Lang = "en"): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product", {
    params: { lang: LANG_PARAM[lang] },
  });
  return data.data;
}

export async function getProductById(id: string, lang: Lang = "en"): Promise<ApiProduct> {
  const { data } = await apiClient.get<{ data: ApiProduct }>(`/api/product/${id}`, {
    params: { lang: LANG_PARAM[lang] },
  });
  return data.data;
}

export async function getProductBySlug(slug: string, lang: Lang = "en"): Promise<ApiProduct> {
  const products = await getProducts(lang);
  const match = products.find((p) => p.slug === slug);
  if (!match) throw new Error(`Product with slug "${slug}" not found`);
  return getProductById(match.id, lang);
}

export function getImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}${path}`;
}

export function getPrimaryImage(media: ApiProductMedia[]): string {
  const primary = media.find((m) => m.isPrimary) ?? media[0];
  return primary ? getImageUrl(primary.url) : "";
}
