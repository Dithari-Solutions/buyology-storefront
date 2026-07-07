'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import B2BProductCard from './B2BProductCard';
import B2BCreditBanner from './B2BCreditBanner';
import type { B2BActiveFilters } from './B2BProductFilter';
import { getB2bProducts, searchB2bProducts, getPrimaryImage, type ApiProduct } from '@/features/product/services/productService';
import { selectSelectedCountryCode, selectPreferredCurrency, selectSelectedCountry } from '@/features/country/store/countrySlice';
import { selectUserCoords } from '@/features/location/store/locationSlice';
import { useB2bMembership } from '@/features/b2b/hooks/useB2bMembership';
import { useB2bRegion } from '@/features/b2b/hooks/useB2bRegion';
import { PATH_SLUGS, type Lang } from '@/config/pathSlugs';

function CardSkeleton() {
  return (
    <div className="p-[12px] bg-white rounded-[24px] w-full border border-gray-100 animate-pulse">
      <div className="h-[200px] mb-[14px] rounded-[18px] bg-[#F6F4FF]" />
      <div className="flex items-start justify-between gap-[8px] mb-[10px]">
        <div className="h-[18px] w-[55%] bg-gray-200 rounded-full" />
        <div className="h-[22px] w-[44px] bg-gray-100 rounded-full flex-shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-[6px] mb-[10px]">
        <div className="h-[28px] bg-gray-100 rounded-[8px]" />
        <div className="h-[28px] bg-gray-100 rounded-[8px]" />
        <div className="h-[28px] bg-gray-100 rounded-[8px] col-span-2" />
      </div>
      <div className="h-px bg-gray-100 mb-[10px]" />
      <div className="flex items-end justify-between gap-[8px]">
        <div className="h-[22px] w-[100px] bg-gray-200 rounded-full" />
        <div className="h-[34px] w-[120px] bg-[#402F75]/20 rounded-[30px]" />
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
          <span key={`dots-${i}`} className="flex items-center justify-center w-[36px] h-[36px] text-[13px] text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`flex items-center justify-center w-[36px] h-[36px] rounded-[10px] text-[13px] font-semibold border transition-colors ${
              p === page ? 'bg-[#402F75] text-white border-[#402F75]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#402F75] hover:text-[#402F75]'
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
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PER_PAGE = 12;

function getSpecValue(product: ApiProduct, code: string): string {
  const spec = product.specs.find((s) => s.code === code);
  if (!spec || spec.options.length === 0) return '';
  const opt = spec.options[0];
  return opt.unit ? `${opt.value} ${opt.unit}` : opt.value;
}

export default function B2BProducts({ onFilterToggle, filterOpen, activeFilters }: {
  onFilterToggle?: () => void;
  filterOpen?: boolean;
  activeFilters?: B2BActiveFilters;
}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const lang = (params?.lang as Lang) ?? 'en';
  const { t } = useTranslation('b2b');
  const { t: tp } = useTranslation('product');

  const selectedCountryCode = useSelector(selectSelectedCountryCode);
  const preferredCurrency = useSelector(selectPreferredCurrency);
  const selectedCountry = useSelector(selectSelectedCountry);
  const coords = useSelector(selectUserCoords);

  // B2B-only regions aren't in the B2C selection, so resolve the region from
  // the b2b-active list (selected or IP-detected) and scope the catalog to it.
  const { region, regionCode } = useB2bRegion();
  const countryCode = regionCode ?? selectedCountryCode;
  const currency = region?.currency ?? preferredCurrency;

  const { isActiveMember, loading: membershipLoading } = useB2bMembership();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    // Only NEWEST sort is honored on the B2B channel.
    const base = { lang, countryCode, currency, lat: coords?.lat, lng: coords?.lng };

    const hasActiveFilters = !!activeFilters && (
      !!activeFilters.condition || !!activeFilters.categoryId ||
      (activeFilters.brandIds && activeFilters.brandIds.length > 0) ||
      !!activeFilters.availabilityStatus ||
      Object.values(activeFilters.specs ?? {}).some((v) => v && v.length > 0)
    );

    let fetchPromise;
    if (query || hasActiveFilters) {
      // Search endpoint honors the text query (bound as `q`) + spec/brand/category filters.
      fetchPromise = searchB2bProducts({
        ...base,
        ...activeFilters,
        specs: activeFilters?.specs,
        query: query ?? undefined,
        sort: 'NEWEST',
      });
    } else {
      fetchPromise = getB2bProducts({ ...base, size: 1000, sort: 'NEWEST' });
    }

    fetchPromise
      .then((items) => setProducts(items))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang, countryCode, currency, coords, activeFilters, query]);

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const startItem = products.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, products.length);
  const pageProducts = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 flex flex-col gap-[16px] min-w-0">
      {/* Product-sourcing request CTA → dedicated page + credit banner (everyone) */}
      <Link
        href={`/${lang}/${PATH_SLUGS.b2b[lang] ?? 'b2b'}/request-product`}
        className="group flex flex-wrap items-center justify-between gap-[12px] bg-white rounded-[16px] border border-gray-100 shadow-sm px-[20px] py-[16px] hover:border-[#402F75]/40 transition-colors"
      >
        <div className="flex items-start gap-[12px]">
          <span className="w-10 h-10 rounded-full bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
            </svg>
          </span>
          <div>
            <p className="text-[14px] font-bold text-[#402F75]">{t('productRequest.title', { defaultValue: "Can't find it? Request a product" })}</p>
            <p className="text-[12.5px] text-gray-500">{t('productRequest.subtitle', { defaultValue: 'Tell us what you need and our procurement team will source it for you.' })}</p>
          </div>
        </div>
        <span className="whitespace-nowrap rounded-full bg-[#402F75] group-hover:bg-[#352566] text-white text-[13px] font-bold px-[18px] py-[9px] transition-colors">
          {t('productRequest.openCta', { defaultValue: 'Request a product' })}
        </span>
      </Link>
      <B2BCreditBanner />

      {/* Search status */}
      {query && (
        <div className="flex items-center justify-between bg-[#402F75]/5 border border-[#402F75]/20 rounded-[16px] px-[20px] py-[12px]">
          <div className="flex items-center gap-[8px]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p className="text-[14px] font-medium text-[#402F75]">
              {tp('shop.products.searchResults', { defaultValue: 'Search results for' })}: <span className="font-bold">&ldquo;{query}&rdquo;</span>
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
            {t('browse.clear', { defaultValue: 'Clear' })}
          </button>
        </div>
      )}

      {/* Non-member banner */}
      {!membershipLoading && !isActiveMember && (
        <div className="flex flex-wrap items-center justify-between gap-[12px] bg-[#FFF9EC] border border-[#FBBB14]/40 rounded-[16px] px-[20px] py-[14px]">
          <div className="flex items-start gap-[10px]">
            <span className="text-[20px] leading-none">🏢</span>
            <div>
              <p className="text-[14px] font-bold text-[#402F75]">{t('browse.memberGate.title', { defaultValue: 'Ordering is for B2B members' })}</p>
              <p className="text-[12.5px] text-gray-600">{t('browse.memberGate.subtitle', { defaultValue: 'Browse freely — apply for a free B2B membership to request quotes and order in bulk.' })}</p>
            </div>
          </div>
          <Link
            href={`/${lang}/${PATH_SLUGS.b2b[lang] ?? 'b2b'}/apply`}
            className="whitespace-nowrap rounded-full bg-[#402F75] text-white text-[13px] font-bold px-[18px] py-[9px] hover:bg-[#352566] transition-colors"
          >
            {t('browse.memberGate.cta', { defaultValue: 'Apply for B2B membership' })}
          </Link>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm px-[20px] py-[14px] flex flex-wrap items-center justify-between gap-[10px]">
        <div className="flex items-center gap-[10px] flex-wrap">
          <p className="text-[13px] text-gray-500">
            {loading ? (
              tp('shop.products.loading', { defaultValue: 'Loading products…' })
            ) : (
              <>
                {tp('shop.products.showing', { defaultValue: 'Showing' })}{' '}
                <span className="font-medium text-gray-800">{startItem}–{endItem}</span>{' '}
                {tp('shop.products.of', { defaultValue: 'of' })}{' '}
                <span className="font-medium text-gray-800">{products.length}</span>{' '}
                {tp('shop.products.items', { defaultValue: 'products' })}
              </>
            )}
          </p>
          {(region || selectedCountry) && (
            <span className="inline-flex items-center gap-[5px] bg-[#F6F4FF] border border-[#402F75]/20 rounded-full px-[10px] py-[3px] text-[11px] font-semibold text-[#402F75]">
              {region?.name ?? selectedCountry?.name}
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
            {tp('shop.filters.title', { defaultValue: 'Filters' })}
            {filterOpen && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 7L5 4L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          {/* View toggles */}
          <div className="relative flex items-center border border-gray-200 p-[2px] rounded-[20px]">
            <div
              className="absolute bg-[#402F75] rounded-full transition-transform duration-300 ease-in-out"
              style={{ top: '2px', bottom: '2px', left: '2px', width: 'calc(50% - 2px)', transform: view === 'list' ? 'translateX(calc(100%))' : 'translateX(0)' }}
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
            <CardSkeleton key={i} />
          ))}
        </section>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm px-[20px] py-[48px] text-center">
          <p className="text-[15px] font-semibold text-gray-700">{t('browse.empty.title', { defaultValue: 'No B2B products here yet' })}</p>
          <p className="text-[13px] text-gray-500 mt-[4px]">{t('browse.empty.subtitle', { defaultValue: 'Try a different filter or check back soon.' })}</p>
        </div>
      ) : (
        <section className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-[16px]' : 'flex flex-col gap-[12px]'}>
          {pageProducts.map((product) => {
            const ram = getSpecValue(product, 'ram');
            const storage = getSpecValue(product, 'storage');
            const processor = getSpecValue(product, 'processor');
            return (
              <B2BProductCard
                key={product.id}
                view={view}
                slug={product.slug}
                storeProductId={product.storeProductId ?? undefined}
                title={product.title}
                description={product.description}
                processor={processor || undefined}
                ram={ram ? `${ram} RAM` : undefined}
                storage={storage ? `${storage} SSD` : undefined}
                imageUrl={getPrimaryImage(product.media)}
                rating={Number(product.averageRating ?? 0)}
                availabilityStatus={product.availabilityStatus}
                stockQuantity={product.stockQuantity}
                isActiveMember={isActiveMember}
                membershipLoading={membershipLoading}
              />
            );
          })}
        </section>
      )}

      {/* Pagination */}
      {!loading && products.length > PER_PAGE && (
        <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm px-[20px] py-[14px]">
          <Pagination page={page} total={totalPages} setPage={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </div>
      )}
    </div>
  );
}
