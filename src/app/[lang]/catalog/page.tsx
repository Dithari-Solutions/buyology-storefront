'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import ProductFilter, { type ActiveFilters } from '@/features/product/components/ProductFilter';
import Products from '@/features/product/components/Products';
import CategoryGrid from '@/features/product/components/CategoryGrid';
import Footer from '@/shared/components/Footer';
import Header from '@/shared/components/Header';

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];

export default function CatalogPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ specs: {} });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');

  const handleFiltersChange = useCallback((filters: ActiveFilters) => {
    setActiveFilters(filters);
  }, []);

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    setActiveFilters({ specs: {}, categoryId });
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedCategoryName('');
    setActiveFilters({ specs: {} });
  };

  return (
    <>
      <Header />
      <main className='w-[90%] mx-auto py-[40px]'>
        {selectedCategoryId === null ? (
          /* ── Category grid view ── */
          <CategoryGrid onSelect={handleCategorySelect} />
        ) : (
          /* ── Product list view with back button ── */
          <div className='flex flex-col md:flex-row items-start gap-[24px]'>
            <div className="w-full md:w-auto md:sticky md:top-[24px] md:self-start">
              <button
                onClick={handleBackToCategories}
                className="flex items-center gap-2 mb-4 text-[14px] font-semibold text-[#402F75] hover:underline"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                All Categories
              </button>
              <p className="text-[13px] text-gray-400 mb-4 font-medium">{selectedCategoryName}</p>

              {/* Mobile: slide animation */}
              <motion.div
                initial={false}
                animate={filterOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: easing }}
                style={{ overflow: 'hidden' }}
                className="md:!hidden"
              >
                <div className="pb-[4px]">
                  <ProductFilter onFiltersChange={handleFiltersChange} />
                </div>
              </motion.div>
              {/* Desktop: always visible */}
              <div className="hidden md:block">
                <ProductFilter onFiltersChange={handleFiltersChange} />
              </div>
            </div>
            <Products
              onFilterToggle={() => setFilterOpen(v => !v)}
              filterOpen={filterOpen}
              activeFilters={activeFilters}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
