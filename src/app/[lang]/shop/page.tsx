'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import ProductFilter, { type ActiveFilters } from '@/features/product/components/ProductFilter';
import Products from '@/features/product/components/Products';
import Footer from '@/shared/components/Footer';
import Header from '@/shared/components/Header';
import RegionGate from '@/features/location/components/RegionGate';
import { PATH_SLUGS, type Lang } from '@/config/pathSlugs';

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];

function ShopContent() {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const shopSlug = PATH_SLUGS['shop']?.[lang] ?? 'shop';
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const categoryName = searchParams.get('categoryName');

  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    specs: {},
    categoryId: categoryId ?? undefined,
  });

  // Re-apply when the category in the URL changes (e.g. picking another from the header menu).
  useEffect(() => {
    setActiveFilters((prev) => ({ ...prev, categoryId: categoryId ?? undefined }));
  }, [categoryId]);

  const handleFiltersChange = useCallback((filters: ActiveFilters) => {
    setActiveFilters(filters);
  }, []);

  return (
    <main className="w-[90%] mx-auto py-[40px]">
      {/* Whole browsing surface (filters + grid) is gated on store availability
          for the visitor's region — unserved regions get the notice + picker. */}
      <RegionGate variant="page">
      {categoryName && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-[20px] md:text-[24px] font-bold text-[#402F75]">{categoryName}</h1>
          <Link href={`/${lang}/${shopSlug}`} className="text-[13px] font-semibold text-[#402F75] hover:underline whitespace-nowrap">
            View all products
          </Link>
        </div>
      )}
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
              <ProductFilter onFiltersChange={handleFiltersChange} initialCategoryId={categoryId} />
            </div>
          </motion.div>
          {/* Desktop: always visible */}
          <div className="hidden md:block">
            <ProductFilter onFiltersChange={handleFiltersChange} initialCategoryId={categoryId} />
          </div>
        </div>
        <Products
          onFilterToggle={() => setFilterOpen((v) => !v)}
          filterOpen={filterOpen}
          activeFilters={activeFilters}
        />
      </div>
      </RegionGate>
    </main>
  );
}

export default function ShopPage() {
  return (
    <>
      <Header />
      <Suspense fallback={null}>
        <ShopContent />
      </Suspense>
      <Footer />
    </>
  );
}
