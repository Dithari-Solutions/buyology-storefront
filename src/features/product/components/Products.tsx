'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from './ProductCard';
import { getProducts, getPrimaryImage, type ApiProduct } from '../services/productService';
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

const SORT_OPTIONS = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Top Rated'];
const PER_PAGE = 12;

function getSpecValue(product: ApiProduct, code: string): string {
  const spec = product.specs.find((s) => s.code === code);
  if (!spec || spec.options.length === 0) return '';
  const opt = spec.options[0];
  return `${opt.value}${opt.unit}`;
}

export default function Products({ onFilterToggle, filterOpen }: {
  onFilterToggle?: () => void;
  filterOpen?: boolean;
}) {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState('Most Popular');
  const [sortOpen, setSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    getProducts(lang)
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang]);

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const startItem = products.length === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, products.length);
  const pageProducts = products.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex-1 flex flex-col gap-[16px] min-w-0">
      {/* Toolbar */}
      <div className="bg-white rounded-[16px] border border-[#FBBB14] px-[20px] py-[14px] flex flex-wrap items-center justify-between gap-[10px]">
        <p className="text-[13px] text-gray-500">
          {loading ? (
            'Loading products…'
          ) : (
            <>
              Showing <span className="font-medium text-gray-800">{startItem}–{endItem}</span> of{' '}
              <span className="font-medium text-gray-800">{products.length}</span> products
            </>
          )}
        </p>

        <div className="flex items-center gap-[12px] flex-wrap">
          {/* Filter toggle - mobile only */}
          <button
            onClick={onFilterToggle}
            className="md:hidden flex items-center gap-[6px] border border-gray-200 rounded-[10px] px-[12px] py-[7px] text-[13px] font-medium text-gray-700 hover:border-gray-300 transition-colors bg-white"
          >
            <FilterIcon />
            Filters
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
                <span className="hidden sm:inline">{sort}</span>
                <span className="sm:hidden">Sort</span>
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
                      key={option}
                      onClick={() => { setSort(option); setSortOpen(false); }}
                      className={`w-full text-start px-[14px] py-[8px] text-[13px] hover:bg-gray-50 transition-colors ${sort === option ? 'font-semibold text-[#402F75]' : 'text-gray-700'}`}
                    >
                      {option}
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
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[16px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </section>
      ) : (
        <section className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-[16px]' : 'flex flex-col gap-[12px]'}>
          {pageProducts.map((product) => {
            const slugs = { en: product.slug, az: product.slug, ar: product.slug };
            const ram = getSpecValue(product, 'ram');
            const storage = getSpecValue(product, 'storage');
            return (
              <ProductCard
                key={product.id}
                view={view}
                slugs={slugs}
                productId={product.id}
                title={product.title}
                price={product.effectivePrice}
                originalPrice={product.basePrice}
                discount={product.discountValue ?? 0}
                ram={ram ? `${ram} RAM` : undefined}
                storage={storage ? `${storage} SSD` : undefined}
                imageUrl={getPrimaryImage(product.media)}
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
