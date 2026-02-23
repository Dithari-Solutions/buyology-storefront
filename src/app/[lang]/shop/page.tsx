'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ProductFilter from '@/features/product/components/ProductFilter'
import Products from '@/features/product/components/Products'
import Footer from '@/shared/components/Footer'
import Header from '@/shared/components/Header'

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];

export default function page() {
  const [filterOpen, setFilterOpen] = useState(false);

  return (
    <>
      <Header />
      <main className='w-[90%] mx-auto py-[40px] flex flex-col md:flex-row items-start gap-[24px]'>
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
              <ProductFilter />
            </div>
          </motion.div>
          {/* Desktop: always visible */}
          <div className="hidden md:block">
            <ProductFilter />
          </div>
        </div>
        <Products
          onFilterToggle={() => setFilterOpen(v => !v)}
          filterOpen={filterOpen}
        />
      </main>
      <Footer />
    </>
  )
}
