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
  /** additional dynamic spec filters keyed by spec code */
  specs?: Record<string, string>;
}

export async function searchProducts(params: ProductSearchParams = {}): Promise<ApiProduct[]> {
  const { lang = 'en', countryCode, currency, lat, lng, specs, ...filterParams } = params;
  const queryParams: Record<string, string> = { lang: LANG_PARAM[lang] };
  if (countryCode) queryParams.countryCode = countryCode;
  if (currency) queryParams.currency = currency;
  if (lat != null) queryParams.lat = String(lat);
  if (lng != null) queryParams.lng = String(lng);

  // Standard filter params
  if (filterParams.query) queryParams.query = filterParams.query;
  if (filterParams.condition) queryParams.condition = filterParams.condition;
  if (filterParams.brandId) queryParams.brandId = filterParams.brandId;
  if (filterParams.availabilityStatus) queryParams.availabilityStatus = filterParams.availabilityStatus;
  if (filterParams.categoryId) queryParams.categoryId = filterParams.categoryId;
  if (filterParams.minPrice != null) queryParams.minPrice = String(filterParams.minPrice);
  if (filterParams.maxPrice != null) queryParams.maxPrice = String(filterParams.maxPrice);
  if (filterParams.ram) queryParams.ram = filterParams.ram;
  if (filterParams.storage) queryParams.storage = filterParams.storage;
  if (filterParams.processor) queryParams.processor = filterParams.processor;
  if (filterParams.screenSize) queryParams.screenSize = filterParams.screenSize;
  if (filterParams.touchableScreen) queryParams.touchableScreen = filterParams.touchableScreen;
  if (filterParams.operatingSystem) queryParams.operatingSystem = filterParams.operatingSystem;
  if (filterParams.keyboardLanguage) queryParams.keyboardLanguage = filterParams.keyboardLanguage;

  // Dynamic spec filters (map to known query param names by code)
  if (specs) {
    const CODE_TO_PARAM: Record<string, string> = {
      ram: 'ram', storage: 'storage', processor: 'processor', screen_size: 'screenSize',
      touchable_screen: 'touchableScreen', operating_system: 'operatingSystem',
      keyboard_language: 'keyboardLanguage',
    };
    for (const [code, val] of Object.entries(specs)) {
      if (val && CODE_TO_PARAM[code]) queryParams[CODE_TO_PARAM[code]] = val;
    }
  }

  const { data } = await apiClient.get<{ data: ApiProduct[] }>('/api/product/search', { params: queryParams });
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

export interface SpecFilterOption {
  code: string;
  label: string;
  values: string[];
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
  countryCode?: string
): Promise<ProductFilters> {
  const params: Record<string, string> = { lang: LANG_PARAM[lang] };
  if (countryCode) params.countryCode = countryCode;
  const { data } = await apiClient.get<{ data: ProductFilters }>('/api/product/filters', { params });
  return data.data;
}

export function getPrimaryImage(media: ApiProductMedia[]): string {
  const primary = media.find((m) => m.isPrimary) ?? media[0];
  return primary ? getImageUrl(primary.url) : "";
}
