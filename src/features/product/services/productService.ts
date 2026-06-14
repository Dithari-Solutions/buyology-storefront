import { apiClient } from "@/shared/lib/apiClient";
import type { Lang } from "@/config/pathSlugs";
import { getImageUrl } from "@/shared/utils/imageUrl";

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
  /** Effective (discounted) price already converted to the display currency. */
  storePrice?: number | null;
  /** Pre-discount price (struck-through). Present only when the item is discounted. */
  originalPrice?: number | null;
  currency?: string | null;
  availableInSelectedCountry?: boolean | null;
  expressDelivery?: boolean | null;
  /** True when the product qualifies for free delivery (price ≥ 100-AED-equiv). */
  freeDelivery?: boolean | null;
  /** Delivery fee in the same currency as storePrice. 0 when freeDelivery. */
  deliveryFee?: number | null;
  /** Average review rating (0–5) from approved reviews. */
  averageRating?: number | null;
  /** Number of approved reviews. */
  totalReviews?: number | null;
  storeOptions?: Array<{
    storeId: string;
    storePrice: number;
    originalPrice?: number | null;
    currency: string;
    expressDelivery: boolean | null;
  }> | null;
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
  page?: number;
  size?: number;
  /** POPULAR | NEWEST | PRICE_ASC | PRICE_DESC */
  sort?: string;
}

function buildParams({ lang = "en", countryCode, currency, lat, lng, page, size, sort }: ProductQueryParams) {
  const params: Record<string, string> = { lang: LANG_PARAM[lang] };
  if (countryCode) params.countryCode = countryCode;
  if (currency) params.currency = currency;
  if (lat != null) params.lat = String(lat);
  if (lng != null) params.lng = String(lng);
  if (page != null) params.page = String(page);
  if (size != null) params.size = String(size);
  if (sort) params.sort = sort;
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
  // Resolve across languages on the backend: product slugs are per-language, so the slug in
  // the URL may belong to a different language than the one being requested.
  const { data } = await apiClient.get<{ data: ApiProduct }>("/api/product/by-slug", {
    params: { ...buildParams(params), slug },
  });
  return data.data;
}

export async function getPopularForYou(productIds: string[], params: ProductQueryParams = {}): Promise<ApiProduct[]> {
  if (!productIds || productIds.length === 0) return [];
  const baseParams = buildParams(params);
  const search = new URLSearchParams(baseParams);
  productIds.forEach((id) => search.append("productIds", id));
  const { data } = await apiClient.get<{ data: ApiProduct[] }>(`/api/product/popular-for-you?${search.toString()}`);
  return data.data ?? [];
}

export async function getSuperDealProducts(params: ProductQueryParams = {}): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product/super-deals", {
    params: buildParams(params),
  });
  return data.data;
}

export interface ProductSearchParams extends ProductQueryParams {
  query?: string;
  condition?: string;
  brandId?: string;
  availabilityStatus?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  processor?: string;
  screenSize?: string;
  touchableScreen?: string;
  operatingSystem?: string;
  keyboardLanguage?: string;
  /** additional dynamic spec filters keyed by spec code — multi-select (array of values) */
  specs?: Record<string, string[]>;
}

export async function searchProducts(params: ProductSearchParams = {}): Promise<ApiProduct[]> {
  const { lang = 'en', countryCode, currency, lat, lng, specs, sort, ...filterParams } = params;
  // URLSearchParams so multi-select specs serialize as repeated keys (ram=8&ram=16),
  // which Spring binds to List<String>. (axios' default array form uses ram[]=.)
  const sp = new URLSearchParams();
  sp.set('lang', LANG_PARAM[lang]);
  if (countryCode) sp.set('countryCode', countryCode);
  if (currency) sp.set('currency', currency);
  if (lat != null) sp.set('lat', String(lat));
  if (lng != null) sp.set('lng', String(lng));
  if (sort) sp.set('sort', sort);

  if (filterParams.query) sp.set('query', filterParams.query);
  if (filterParams.condition) sp.set('condition', filterParams.condition);
  if (filterParams.brandId) sp.set('brandId', filterParams.brandId);
  if (filterParams.availabilityStatus) sp.set('availabilityStatus', filterParams.availabilityStatus);
  if (filterParams.categoryId) sp.set('categoryId', filterParams.categoryId);
  if (filterParams.minPrice != null) sp.set('minPrice', String(filterParams.minPrice));
  if (filterParams.maxPrice != null) sp.set('maxPrice', String(filterParams.maxPrice));

  // Dynamic multi-select spec filters (map spec code → backend param name, repeated per value)
  if (specs) {
    const CODE_TO_PARAM: Record<string, string> = {
      ram: 'ram', storage: 'storage', processor: 'processor', screen_size: 'screenSize',
      touchable_screen: 'touchableScreen', operating_system: 'operatingSystem',
      keyboard_language: 'keyboardLanguage',
    };
    for (const [code, vals] of Object.entries(specs)) {
      const param = CODE_TO_PARAM[code];
      if (!param || !vals) continue;
      for (const v of vals) if (v) sp.append(param, v);
    }
  }

  const { data } = await apiClient.get<{ data: ApiProduct[] }>(`/api/product/search?${sp.toString()}`);
  return data.data;
}

export async function searchProductsElastic(params: ProductSearchParams = {}): Promise<ApiProduct[]> {
    const { lang = 'en', countryCode, currency, lat, lng, query } = params;
    const queryParams: Record<string, string> = { lang: LANG_PARAM[lang] };
    if (countryCode) queryParams.countryCode = countryCode;
    if (currency) queryParams.currency = currency;
    if (lat != null) queryParams.lat = String(lat);
    if (lng != null) queryParams.lng = String(lng);
    if (query) queryParams.query = query;

    const { data } = await apiClient.get<{ data: ApiProduct[] }>('/api/product/search-elastic', { params: queryParams });
    return data.data;
}

export async function getLimitedStockProducts(params: ProductQueryParams = {}): Promise<ApiProduct[]> {
  const { data } = await apiClient.get<{ data: ApiProduct[] }>("/api/product/limited-stock", {
    params: buildParams(params),
  });
  return data.data;
}

// ── Filter options API ────────────────────────────────────────────────────────

export interface PriceRange { min: number; max: number }

export interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
}

export interface BrandFilterOption {
  id: string;
  name: string;
}

export interface SpecFilterValue {
  value: string;
  unit?: string | null;
}

export interface SpecFilterOption {
  code: string;
  label: string;
  values: SpecFilterValue[];
}

export interface ProductFilters {
  priceRange: PriceRange;
  conditions: string[];
  categories: CategoryFilterOption[];
  brands: BrandFilterOption[];
  availabilityStatuses: string[];
  specs: SpecFilterOption[];
}

export async function getProductFilters(
  lang: Lang = 'en',
  countryCode?: string,
  currency?: string
): Promise<ProductFilters> {
  const params: Record<string, string> = { lang: LANG_PARAM[lang] };
  if (countryCode) params.countryCode = countryCode;
  if (currency) params.currency = currency;
  const { data } = await apiClient.get<{ data: ProductFilters }>('/api/product/filters', { params });
  return data.data;
}

export interface AllCategory {
  id: string;
  parentId: string | null;
  status: string;
  icon?: string | null;
  name: string;
  slug: string;
}

/**
 * All categories (localized), independent of whether they currently have products —
 * used by the header Shop menu. Unlike the filters endpoint, this returns the full set.
 */
export async function getAllCategories(lang: Lang = 'en'): Promise<AllCategory[]> {
  const { data } = await apiClient.get<{ data: AllCategory[] }>('/api/category', {
    params: { lang: LANG_PARAM[lang] },
  });
  return data.data ?? [];
}

export function getPrimaryImage(media: ApiProductMedia[]): string {
  const primary = media.find((m) => m.isPrimary) ?? media[0];
  return primary ? getImageUrl(primary.url) : "";
}
