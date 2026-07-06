'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import B2BProductFilter, { type B2BActiveFilters } from '@/features/b2b/components/B2BProductFilter';
import B2BProducts from '@/features/b2b/components/B2BProducts';
import Footer from '@/shared/components/Footer';
import Header from '@/shared/components/Header';
import { PATH_SLUGS, type Lang } from '@/config/pathSlugs';

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];

function B2BShopContent() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const b2bSlug = PATH_SLUGS.b2b[lang] ?? 'b2b';
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const { t } = useTranslation('b2b');

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<B2BActiveFilters>({
    specs: {},
    categoryId: categoryId ?? undefined,
  });

  useEffect(() => {
    setActiveFilters((prev) => ({ ...prev, categoryId: categoryId ?? undefined }));
  }, [categoryId]);

  const handleFiltersChange = useCallback((filters: B2BActiveFilters) => {
    setActiveFilters(filters);
  }, []);

  return (
    <main className="w-[90%] mx-auto py-[40px]">
      {/* Heading */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#402F75] bg-[#402F75]/8 px-3 py-[5px] rounded-full mb-2">
            {t('badge', { defaultValue: 'B2B Wholesale' })}
          </span>
          <h1 className="text-[22px] md:text-[28px] font-extrabold text-[#402F75] leading-tight">
            {t('browse.title', { defaultValue: 'B2B Catalog' })}
          </h1>
          <p className="text-[13px] text-gray-500 mt-[2px] max-w-[560px]">
            {t('browse.subtitle', { defaultValue: 'Browse products available for bulk orders. Request a quote — our procurement team prices each order for you.' })}
          </p>
        </div>
        <Link
          href={`/${lang}/${b2bSlug}`}
          className="text-[13px] font-semibold text-[#402F75] hover:underline whitespace-nowrap"
        >
          {t('browse.backToB2b', { defaultValue: 'B2B overview' })}
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-start gap-[24px]">
        <div className="w-full md:w-auto md:sticky md:top-[24px] md:self-start">
          {/* Mobile: slide animation */}
          <motion.div
            initial={false}
            animate={filterOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: easing }}
            style={{ overflow: 'hidden' }}
            className="md:!hidden"
          >
            <div className="pb-[4px]">
              <B2BProductFilter onFiltersChange={handleFiltersChange} initialCategoryId={categoryId} />
            </div>
          </motion.div>
          {/* Desktop: always visible */}
          <div className="hidden md:block">
            <B2BProductFilter onFiltersChange={handleFiltersChange} initialCategoryId={categoryId} />
          </div>
        </div>
        <B2BProducts
          onFilterToggle={() => setFilterOpen((v) => !v)}
          filterOpen={filterOpen}
          activeFilters={activeFilters}
        />
      </div>
    </main>
  );
}

export default function B2BProductsPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <B2BShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
