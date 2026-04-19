'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { getProductFilters, type CategoryFilterOption } from '../services/productService';
import { selectSelectedCountryCode } from '@/features/country/store/countrySlice';
import type { Lang } from '@/config/pathSlugs';

const CATEGORY_COLORS = [
  '#EDE9FF', '#FFF7E0', '#E8F5ED', '#FFF0F0',
  '#E0F0FF', '#FFF3E0', '#F0F4FF', '#FDF0FF',
];
const CATEGORY_TEXT_COLORS = [
  '#402F75', '#8B6200', '#1A6B3C', '#B91C1C',
  '#1D4ED8', '#C2410C', '#3730A3', '#7E22CE',
];

interface Props {
  onSelect: (categoryId: string, categoryName: string) => void;
}

export default function CategoryGrid({ onSelect }: Props) {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const countryCode = useSelector(selectSelectedCountryCode) as string | undefined;

  const [categories, setCategories] = useState<CategoryFilterOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductFilters(lang, countryCode ?? undefined)
      .then((f) => setCategories(f.categories.filter((c) => !c.parentId)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lang, countryCode]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-[120px] rounded-[20px] bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-gray-400 text-[14px] text-center py-12">No categories found.</p>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-[22px] sm:text-[28px] font-bold text-gray-900 mb-6">
        Shop by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat, i) => {
          const bg = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          const textColor = CATEGORY_TEXT_COLORS[i % CATEGORY_TEXT_COLORS.length];
          return (
            <motion.button
              key={cat.id}
              onClick={() => onSelect(cat.id, cat.name)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-start justify-end h-[120px] rounded-[20px] p-5 text-left transition-shadow hover:shadow-md"
              style={{ backgroundColor: bg }}
            >
              <span
                className="text-[15px] font-bold leading-tight"
                style={{ color: textColor }}
              >
                {cat.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
