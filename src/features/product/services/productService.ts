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
  basePrice?: number;
  effectivePrice?: number;
  discountType?: string | null;
  discountValue?: number | null;
  availabilityStatus: string;
  isRefurbished: boolean;
  refurbGrade: string | null;
  isSuperDeal?: boolean;
  isLimitedStock?: boolean;
  brandId?: string | null;
  brandName?: string | null;
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
  // Country-scoped pricing (present when countryCode param is passed)
  storeId?: string | null;
  storePrice?: number | null;
  currency?: string | null;
  availableInSelectedCountry?: boolean | null;
  expressDelivery?: boolean | null;
}

const LANG_PARAM: Record<Lang, string> = {
  en: "EN",
  az: "AZ",
  ar: "AR",
};

export interface ProductQueryParams {
  lang?: Lang;
  countryCode?: string;
  currency?: string;
  lat?: number;
  lng?: number;
}

function buildParams({ lang = "en", countryCode, currency, lat, lng }: ProductQueryParams) {
  const params: Record<string, string> = { lang: LANG_PARAM[lang] };
  if (countryCode) params.countryCode = countryCode;
  if (currency) params.currency = currency;
  if (lat != null) params.lat = String(lat);
  if (lng != null) params.lng = String(lng);
  return params;
}

export async function getProducts(params: ProductQueryParams = {}): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product", {
    params: buildParams(params),
  });
  return data.data;
}

export async function getProductById(id: string, params: ProductQueryParams = {}): Promise<ApiProduct> {
  const { data } = await apiClient.get<{ data: ApiProduct }>(`/api/product/${id}`, {
    params: buildParams(params),
  });
  return data.data;
}

export async function getProductBySlug(slug: string, params: ProductQueryParams = {}): Promise<ApiProduct> {
  const products = await getProducts(params);
  const match = products.find((p) => p.slug === slug);
  if (!match) throw new Error(`Product with slug "${slug}" not found`);
  return getProductById(match.id, params);
}

export async function getSuperDealProducts(params: ProductQueryParams = {}): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product/super-deals", {
    params: buildParams(params),
  });
  return data.data;
}

export async function getLimitedStockProducts(params: ProductQueryParams = {}): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product/limited-stock", {
    params: buildParams(params),
  });
  return data.data;
}

export function getImageUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}${path}`;
}

export function getPrimaryImage(media: ApiProductMedia[]): string {
  const primary = media.find((m) => m.isPrimary) ?? media[0];
  return primary ? getImageUrl(primary.url) : "";
}
