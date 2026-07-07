'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import { getProducts, searchProducts, searchProductsElastic, getPrimaryImage, type ApiProduct } from '../services/productService';
import type { ActiveFilters } from './ProductFilter';
import { selectSelectedCountryCode, selectPreferredCurrency, selectSelectedCountry } from '@/features/country/store/countrySlice';
import { selectUserCoords } from '@/features/location/store/locationSlice';
import type { Lang } from '@/config/pathSlugs';

function ProductCardSkeleton() {
  return (
    <div className="p-[10px] bg-white rounded-[20px] w-full border border-[#FBBB14] animate-pulse">
      {/* Image area */}
      <div className="h-[200px] mb-[12px] rounded-[20px] bg-[#F6F4FF]" />

      {/* Title + rating */}
      <div className="flex items-start justify-between gap-[8px] mb-[10px]">
        <div className="h-[18px] w-[55%] bg-gray-200 rounded-full" />
        <div className="h-[22px] w-[44px] bg-gray-100 rounded-full flex-shrink-0" />
      </div>

      {/* Specs */}
      <div className="grid grid-cols-2 gap-[6px] mb-[10px]">
        <div className="h-[28px] bg-gray-100 rounded-[8px]" />
        <div className="h-[28px] bg-gray-100 rounded-[8px]" />
        <div className="h-[28px] bg-gray-100 rounded-[8px] col-span-2" />
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mb-[10px]" />

      {/* Price + button */}
      <div className="flex items-end justify-between gap-[8px]">
        <div className="flex flex-col gap-[5px]">
          <div className="h-[12px] w-[60px] bg-gray-100 rounded-full" />
          <div className="h-[22px] w-[70px] bg-gray-200 rounded-full" />
        </div>
        <div className="flex flex-col items-end gap-[5px]">
          <div className="h-[18px] w-[52px] bg-gray-100 rounded-[6px]" />
          <div className="h-[34px] w-[110px] bg-[#FBBB14]/30 rounded-[30px]" />
        </div>
      </div>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

function Pagination({ page, total, setPage }: { page: number; total: number; setPage: (p: number) => void }) {
  const pages = getPageNumbers(page, total);

  return (
    <div className="flex items-center justify-center gap-[6px] flex-wrap">
      <button
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
        className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] border border-gray-200 bg-white text-gray-500 hover:border-[#402F75] hover:text-[#402F75] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="flex items-center justify-center w-[36px] h-[36px] text-[13px] text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`flex items-center justify-center w-[36px] h-[36px] rounded-[10px] text-[13px] font-semibold border transition-colors ${
              p === page
                ? 'bg-[#402F75] text-white border-[#402F75]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#402F75] hover:text-[#402F75]'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => setPage(page + 1)}
        disabled={page === total}
        className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] border border-gray-200 bg-white text-gray-500 hover:border-[#402F75] hover:text-[#402F75] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}

const GridIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
    <rect x="11" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
    <rect x="1" y="11" width="6" height="6" rx="1.5" fill="currentColor" />
    <rect x="11" y="11" width="6" height="6" rx="1.5" fill="currentColor" />
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="1" y="2" width="16" height="3" rx="1.5" fill="currentColor" />
    <rect x="1" y="7.5" width="16" height="3" rx="1.5" fill="currentColor" />
    <rect x="1" y="13" width="16" height="3" rx="1.5" fill="currentColor" />
  </svg>
);

const SortIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M5 3V15M5 15L2 12M5 15L8 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13 15V3M13 3L10 6M13 3L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SORT_OPTIONS: { value: string; key: string; fallback: string }[] = [
  { value: 'POPULAR', key: 'shop.sort.POPULAR', fallback: 'Most Popular' },
  { value: 'NEWEST', key: 'shop.sort.NEWEST', fallback: 'Newest' },
  { value: 'PRICE_ASC', key: 'shop.sort.PRICE_ASC', fallback: 'Price: Low to High' },
  { value: 'PRICE_DESC', key: 'shop.sort.PRICE_DESC', fallback: 'Price: High to Low' },
];
const PER_PAGE = 12;

function getSpecValue(product: ApiProduct, code: string): string {
  const spec = product.specs.find((s) => s.code === code);
  if (!spec || spec.options.length === 0) return '';
  const opt = spec.options[0];
  // Never emit "undefined" when a spec has no unit.
  return opt.unit ? `${opt.value} ${opt.unit}` : opt.value;
}

export default function Products({ onFilterToggle, filterOpen, activeFilters }: {
  onFilterToggle?: () => void;
  filterOpen?: boolean;
  activeFilters?: ActiveFilters;
}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const lang = (params?.lang as Lang) ?? 'en';
  const { t } = useTranslation('product');

  const countryCode = useSelector(selectSelectedCountryCode);
  const currency = useSelector(selectPreferredCurrency);
  const selectedCountry = useSelector(selectSelectedCountry);
  const coords = useSelector(selectUserCoords);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('POPULAR');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const base = { lang, countryCode, currency, lat: coords?.lat, lng: coords?.lng };
    
    const hasActiveFilters = !!activeFilters && (
      activeFilters.minPrice != null || activeFilters.maxPrice != null ||
      activeFilters.condition || activeFilters.categoryId ||
      (activeFilters.brandIds && activeFilters.brandIds.length > 0) ||
      activeFilters.availabilityStatus ||
      Object.values(activeFilters.specs ?? {}).some((v) => v && v.length > 0)
    );

    let fetchPromise;
    if (query && !hasActiveFilters) {
      // Pure text search → Elastic for best relevance (no filters to honor).
      fetchPromise = searchProductsElastic({ ...base, query });
    } else if (hasActiveFilters) {
      // Filters active (with or without a text term) → /api/product/search, which
      // applies the price/spec/condition filters AND the text query (bound as `q`).
      // The elastic endpoint IGNORES price params, so a filtered search must never
      // route there — doing so dropped the price cap and leaked out-of-budget items.
      fetchPromise = searchProducts({ ...base, ...activeFilters, specs: activeFilters!.specs, sort, query: query ?? undefined });
    } else {
      // No query, no filters → full catalog. Backend paginates /api/product
      // (default 60); the grid paginates client-side, so request the whole
      // catalog (backend is batch-loaded → fast).
      fetchPromise = getProducts({ ...base, size: 1000, sort });
    }

    // Price cap must hold on the PRICE ACTUALLY SHOWN. The backend can include a product
    // when ANY of its stores is in budget, but the card shows the primary (express-first)
    // store's price, which may exceed the cap → those leak in (e.g. a 1600 card under a
    // 1200 max). Guard client-side on the displayed price so the range is always honored,
    // regardless of how the backend resolved it.
    const minP = activeFilters?.minPrice;
    const maxP = activeFilters?.maxPrice;
    const withinRange = (p: ApiProduct) => {
      if (minP == null && maxP == null) return true;
      const price = p.storePrice ?? p.effectivePrice ?? 0;
      return (minP == null || price >= minP) && (maxP == null || price <= maxP);
    };

    fetchPromise
      .then((items) =>
        setProducts(
          items
            // Hide products not available in the selected country (no "browse only" in lists).
            .filter((p) => (countryCode ? p.availableInSelectedCountry !== false : true))
            .filter(withinRange)
        )
      )
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang, countryCode, currency, coords, activeFilters, query, sort]);

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const startItem = products.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, products.length);
  const pageProducts = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 flex flex-col gap-[16px] min-w-0">
      {/* Search status */}
      {query && (
        <div className="flex items-center justify-between bg-[#FBBB14]/10 border border-[#FBBB14]/30 rounded-[16px] px-[20px] py-[12px]">
          <div className="flex items-center gap-[8px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p className="text-[14px] font-medium text-[#402F75]">
              {t('shop.products.searchResults', { defaultValue: 'Search results for' })}: <span className="font-bold">&ldquo;{query}&rdquo;</span>
            </p>
          </div>
          <button
            onClick={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('q');
              router.push(url.pathname);
            }}
            className="text-[12px] font-bold text-[#402F75] hover:underline cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[14px] flex flex-wrap items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[10px] flex-wrap">
          <p className="text-[13px] text-gray-500">
            {loading ? (
              t('shop.products.loading', { defaultValue: 'Loading products…' })
            ) : (
              <>
                {t('shop.products.showing', { defaultValue: 'Showing' })}{' '}
                <span className="font-medium text-gray-800">{startItem}–{endItem}</span>{' '}
                {t('shop.products.of', { defaultValue: 'of' })}{' '}
                <span className="font-medium text-gray-800">{products.length}</span>{' '}
                {t('shop.products.items', { defaultValue: 'products' })}
              </>
            )}
          </p>
          {selectedCountry && (
            <span className="inline-flex items-center gap-[5px] bg-[#F6F4FF] border border-[#402F75]/20 rounded-full px-[10px] py-[3px] text-[11px] font-semibold text-[#402F75]">
              {selectedCountry.name} · {currency}
            </span>
          )}
        </div>

        <div className="flex items-center gap-[12px] flex-wrap">
          {/* Filter toggle - mobile only */}
          <button
            onClick={onFilterToggle}
            className="md:hidden flex items-center gap-[6px] border border-gray-200 rounded-[10px] px-[12px] py-[7px] text-[13px] font-medium text-gray-700 hover:border-gray-300 transition-colors bg-white"
          >
            <FilterIcon />
            {t('shop.filters.title', { defaultValue: 'Filters' })}
            {filterOpen && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 7L5 4L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="flex items-center gap-[8px]">
            <span className="hidden sm:block"><SortIcon /></span>
            <div className="relative">
              <button
                onClick={() => setSortOpen((v) => !v)}
                className="flex items-center gap-[8px] border border-gray-200 rounded-[10px] px-[14px] py-[7px] text-[13px] font-medium text-gray-700 hover:border-gray-300 transition-colors bg-white"
              >
                <span className="hidden sm:inline">
                  {(() => { const o = SORT_OPTIONS.find((s) => s.value === sort); return o ? t(o.key, { defaultValue: o.fallback }) : ''; })()}
                </span>
                <span className="sm:hidden">{t('shop.sort.label', { defaultValue: 'Sort' })}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-200 ${sortOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {sortOpen && (
                <div className="absolute end-0 top-[calc(100%+6px)] z-20 bg-white border border-gray-100 rounded-[12px] shadow-lg py-[6px] min-w-[180px]">
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => { setSort(option.value); setSortOpen(false); }}
                      className={`w-full text-start px-[14px] py-[8px] text-[13px] hover:bg-gray-50 transition-colors ${sort === option.value ? 'font-semibold text-[#402F75]' : 'text-gray-700'}`}
                    >
                      {t(option.key, { defaultValue: option.fallback })}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* View toggles */}
          <div className="relative flex items-center border border-gray-200 p-[2px] rounded-[20px]">
            <div
              className="absolute bg-[#402F75] rounded-full transition-transform duration-300 ease-in-out"
              style={{
                top: '2px',
                bottom: '2px',
                left: '2px',
                width: 'calc(50% - 2px)',
                transform: view === 'list' ? 'translateX(calc(100%))' : 'translateX(0)',
              }}
            />
            <button
              onClick={() => setView('grid')}
              className={`relative z-10 p-[8px] rounded-full cursor-pointer transition-colors duration-300 ${view === 'grid' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <GridIcon />
            </button>
            <button
              onClick={() => setView('list')}
              className={`relative z-10 p-[8px] rounded-full cursor-pointer transition-colors duration-300 ${view === 'list' ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Product grid / list */}
      {loading ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </section>
      ) : (
        <section className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px]' : 'flex flex-col gap-[12px]'}>
          {pageProducts.map((product) => {
            const slugs = { en: product.slug, az: product.slug, ar: product.slug };
            const ram = getSpecValue(product, 'ram');
            const storage = getSpecValue(product, 'storage');
            const processor = getSpecValue(product, 'processor');
            const displayPrice = product.storePrice ?? product.effectivePrice ?? 0;
            const displayCurrency = product.currency ?? currency;
            // Original (pre-discount) price comes from the store-scoped originalPrice
            // (set by the backend only when discounted). discount = amount off.
            const rawOriginal = product.originalPrice ?? null;
            const activeMin = activeFilters?.minPrice;
            const activeMax = activeFilters?.maxPrice;
            // When a max-price filter is active, hide the struck-through original
            // (and the discount badge) if the original exceeds the cap. The item is
            // in budget by its sale price — the filter correctly keeps it — but a
            // >max original just reads as an out-of-range product leaking in.
            const original = activeMax != null && rawOriginal != null && rawOriginal > activeMax
              ? null
              : rawOriginal;
            const discountAmount = original != null && original > displayPrice
              ? original - displayPrice
              : 0;
            // The backend only price-filters the primary (headline) storePrice, but a
            // multi-store product (e.g. UAE express + standard) also surfaces sibling
            // store options whose prices aren't capped. Drop any option outside the
            // selected range so an out-of-budget price (e.g. 1600 when max is 1200)
            // can't leak onto an in-budget card. The primary always passes the range,
            // so it's never removed.
            const visibleStoreOptions =
              (activeMin == null && activeMax == null) || !product.storeOptions
                ? product.storeOptions
                : product.storeOptions.filter(
                    (o) =>
                      (activeMin == null || o.storePrice >= activeMin) &&
                      (activeMax == null || o.storePrice <= activeMax)
                  );
            return (
              <ProductCard
                key={product.id}
                view={view}
                slugs={slugs}
                productId={product.id}
                storeId={product.storeId ?? undefined}
                title={product.title}
                description={product.description}
                price={displayPrice}
                originalPrice={original ?? 0}
                discount={discountAmount}
                currency={displayCurrency}
                processor={processor || undefined}
                ram={ram ? `${ram} RAM` : undefined}
                storage={storage ? `${storage} SSD` : undefined}
                imageUrl={getPrimaryImage(product.media)}
                expressDelivery={product.expressDelivery}
                storeOptions={visibleStoreOptions}
                availableInSelectedCountry={product.availableInSelectedCountry}
                rating={Number(product.averageRating ?? 0)}
                isSuperDeal={product.isSuperDeal}
                availabilityStatus={product.availabilityStatus}
                stockQuantity={product.stockQuantity}
              />
            );
          })}
        </section>
      )}

      {/* Pagination */}
      {!loading && products.length > PER_PAGE && (
        <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[14px]">
          <Pagination
            page={page}
            total={totalPages}
            setPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        </div>
      )}
    </div>
  );
}
