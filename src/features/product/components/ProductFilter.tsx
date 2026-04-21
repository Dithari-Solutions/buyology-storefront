'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import FilterIcon from '@/assets/icons/filter.png';
import {
  getProductFilters,
  type ProductFilters,
  type CategoryFilterOption,
  type BrandFilterOption,
  type SpecFilterOption,
} from '../services/productService';
import { selectSelectedCountryCode } from '@/features/country/store/countrySlice';
import type { Lang } from '@/config/pathSlugs';

// ── Sub-components ────────────────────────────────────────────────────────────

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    className="text-gray-500 flex-shrink-0"
  >
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];
const accordionVariants = {
  open:   { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: easing } },
  closed: { height: 0,      opacity: 0, transition: { duration: 0.25, ease: easing } },
};

function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#FBBB14] rounded-[12px] overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-[14px] py-[12px] bg-white hover:bg-gray-50 transition-colors">
        <span className="text-[14px] font-medium text-gray-800">{title}</span>
        <ChevronIcon open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial="closed" animate="open" exit="closed"
            variants={accordionVariants} style={{ overflow: 'hidden' }}>
            <div className="px-[14px] pb-[14px] pt-[2px]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-[10px] py-[5px] cursor-pointer group">
      <div onClick={onChange}
        className={`w-[16px] h-[16px] rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked ? 'bg-[#402F75] border-[#402F75]' : 'border-[#FBBB14] bg-white group-hover:border-[#402F75]'
        }`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-gray-700 select-none">{label}</span>
    </label>
  );
}

function PriceRange({ min, max, value, onChange }: {
  min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const toPercent = (v: number) => max === min ? 0 : ((v - min) / (max - min)) * 100;
  const minPct = toPercent(value[0]);
  const maxPct = toPercent(value[1]);

  function getValueFromClientX(clientX: number): number {
    const rect = trackRef.current!.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + pct * (max - min));
  }

  function startDrag(thumb: 'min' | 'max') {
    return (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const move = (ev: MouseEvent | TouchEvent) => {
        const clientX = 'touches' in ev ? ev.touches[0].clientX : ev.clientX;
        const v = getValueFromClientX(clientX);
        const [curMin, curMax] = valueRef.current;
        if (thumb === 'min') {
          onChange([Math.max(min, Math.min(v, curMax - 1)), curMax]);
        } else {
          onChange([curMin, Math.min(max, Math.max(v, curMin + 1))]);
        }
      };
      const up = () => {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('touchmove', move);
        document.removeEventListener('mouseup', up);
        document.removeEventListener('touchend', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('touchmove', move, { passive: false });
      document.addEventListener('mouseup', up);
      document.addEventListener('touchend', up);
    };
  }

  return (
    <div className="pt-[6px] pb-[4px]">
      <div ref={trackRef} className="relative h-[4px] mx-[8px] my-[16px]">
        <div className="absolute inset-0 rounded-full bg-gray-200" />
        <div className="absolute h-full rounded-full bg-[#402F75]"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }} />
        {/* Min thumb */}
        <div
          onMouseDown={startDrag('min')}
          onTouchStart={startDrag('min')}
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-[#402F75] border-[3px] border-white shadow-md -translate-x-1/2 cursor-grab active:cursor-grabbing select-none"
          style={{ left: `${minPct}%`, zIndex: minPct >= maxPct - 1 ? 3 : 2 }}
        />
        {/* Max thumb */}
        <div
          onMouseDown={startDrag('max')}
          onTouchStart={startDrag('max')}
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-[#402F75] border-[3px] border-white shadow-md -translate-x-1/2 cursor-grab active:cursor-grabbing select-none"
          style={{ left: `${maxPct}%`, zIndex: minPct >= maxPct - 1 ? 2 : 3 }}
        />
      </div>
      <div className="flex justify-between mt-[10px]">
        <span className="text-[12px] text-gray-500">{value[0].toLocaleString()}</span>
        <span className="text-[12px] text-gray-500">{value[1].toLocaleString()}</span>
      </div>
    </div>
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ActiveFilters {
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  categoryId?: string;
  brandId?: string;
  availabilityStatus?: string;
  /** spec code → selected value */
  specs: Record<string, string>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductFilter({ onFiltersChange }: {
  onFiltersChange?: (filters: ActiveFilters) => void;
}) {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const countryCode = useSelector(selectSelectedCountryCode);

  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [price, setPrice] = useState<[number, number]>([0, 0]);
  const [condition, setCondition] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [availability, setAvailability] = useState<string | null>(null);
  const [specSelections, setSpecSelections] = useState<Record<string, string>>({});

  // Fetch filter options from API
  useEffect(() => {
    setLoading(true);
    getProductFilters(lang, countryCode ?? undefined)
      .then(data => {
        setFilters(data);
        const min = Math.floor(data.priceRange.min);
        const max = Math.ceil(data.priceRange.max);
        setPrice([min, max]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang, countryCode]);

  // Emit changes whenever any selection changes
  const emitChanges = useCallback((overrides: Partial<{
    price: [number, number]; condition: string | null; categoryId: string | null;
    brandId: string | null; availability: string | null; specSelections: Record<string, string>;
  }> = {}) => {
    if (!filters || !onFiltersChange) return;
    const p     = overrides.price          ?? price;
    const cond  = overrides.condition      ?? condition;
    const cat   = overrides.categoryId     ?? categoryId;
    const brand = overrides.brandId        ?? brandId;
    const avail = overrides.availability   ?? availability;
    const specs = overrides.specSelections ?? specSelections;
    const priceMin = filters.priceRange.min;
    const priceMax = filters.priceRange.max;
    onFiltersChange({
      minPrice:           p[0] > priceMin ? p[0] : undefined,
      maxPrice:           p[1] < priceMax ? p[1] : undefined,
      condition:          cond   ?? undefined,
      categoryId:         cat    ?? undefined,
      brandId:            brand  ?? undefined,
      availabilityStatus: avail  ?? undefined,
      specs,
    });
  }, [filters, price, condition, categoryId, brandId, availability, specSelections, onFiltersChange]);

  const handlePrice = (v: [number, number]) => { setPrice(v); emitChanges({ price: v }); };
  const handleCondition = (val: string) => {
    const next = condition === val ? null : val;
    setCondition(next); emitChanges({ condition: next });
  };
  const handleCategory = (id: string) => {
    const next = categoryId === id ? null : id;
    setCategoryId(next); emitChanges({ categoryId: next });
  };
  const handleBrand = (id: string) => {
    const next = brandId === id ? null : id;
    setBrandId(next); emitChanges({ brandId: next });
  };
  const handleAvailability = (val: string) => {
    const next = availability === val ? null : val;
    setAvailability(next); emitChanges({ availability: next });
  };
  const handleSpec = (code: string, val: string) => {
    const next = { ...specSelections, [code]: specSelections[code] === val ? '' : val };
    setSpecSelections(next); emitChanges({ specSelections: next });
  };

  const AVAILABILITY_LABELS: Record<string, string> = {
    IN_STOCK: 'In Stock', OUT_OF_STOCK: 'Out of Stock', PRE_ORDER: 'Pre-Order',
  };
  const CONDITION_LABELS: Record<string, string> = { NEW: 'New', REFURBISHED: 'Refurbished' };

  // Separate root categories and subcategories
  const rootCategories = filters?.categories.filter(c => !c.parentId) ?? [];
  const subCategories  = filters?.categories.filter(c =>  c.parentId) ?? [];

  if (loading) {
    return (
      <aside className="bg-white rounded-[20px] border border-[#FBBB14] p-[14px] w-full md:w-[280px] flex-shrink-0 flex flex-col gap-[10px] animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[44px] rounded-[12px] bg-gray-100" />
        ))}
      </aside>
    );
  }

  if (!filters) return null;

  const priceMin = Math.floor(filters.priceRange.min);
  const priceMax = Math.ceil(filters.priceRange.max);

  return (
    <aside className="bg-white rounded-[20px] border border-[#FBBB14] p-[14px] w-full md:w-[280px] flex-shrink-0 flex flex-col gap-[10px]">
      <div className="flex items-center gap-[10px] px-[2px] pb-[4px]">
        <Image src={FilterIcon} alt="Filter" width={20} height={20} />
        <h2 className="text-[18px] font-medium">Filters</h2>
      </div>

      {/* Price Range */}
      {priceMax > 0 && (
        <FilterSection title="Price Range">
          <PriceRange min={priceMin} max={priceMax} value={price} onChange={handlePrice} />
        </FilterSection>
      )}

      {/* Condition */}
      {filters.conditions.length > 0 && (
        <FilterSection title="Condition">
          {filters.conditions.map(val => (
            <CheckboxItem key={val} label={CONDITION_LABELS[val] ?? val}
              checked={condition === val} onChange={() => handleCondition(val)} />
          ))}
        </FilterSection>
      )}

      {/* Category */}
      {rootCategories.length > 0 && (
        <FilterSection title="Category">
          {rootCategories.map((cat: CategoryFilterOption) => (
            <CheckboxItem key={cat.id} label={cat.name}
              checked={categoryId === cat.id} onChange={() => handleCategory(cat.id)} />
          ))}
        </FilterSection>
      )}

      {/* Subcategory */}
      {subCategories.length > 0 && (
        <FilterSection title="Subcategory">
          {subCategories.map((cat: CategoryFilterOption) => (
            <CheckboxItem key={cat.id} label={cat.name}
              checked={categoryId === cat.id} onChange={() => handleCategory(cat.id)} />
          ))}
        </FilterSection>
      )}

      {/* Brand */}
      {filters.brands.length > 0 && (
        <FilterSection title="Brand">
          {filters.brands.map((b: BrandFilterOption) => (
            <CheckboxItem key={b.id} label={b.name}
              checked={brandId === b.id} onChange={() => handleBrand(b.id)} />
          ))}
        </FilterSection>
      )}

      {/* Availability */}
      {filters.availabilityStatuses.length > 0 && (
        <FilterSection title="Availability Status">
          {filters.availabilityStatuses.map(val => (
            <CheckboxItem key={val} label={AVAILABILITY_LABELS[val] ?? val}
              checked={availability === val} onChange={() => handleAvailability(val)} />
          ))}
        </FilterSection>
      )}

      {/* Dynamic spec filters */}
      {filters.specs.map((spec: SpecFilterOption) => (
        <FilterSection key={spec.code} title={spec.label} defaultOpen={spec.code === 'processor'}>
          {spec.values.map(val => (
            <CheckboxItem key={val} label={val}
              checked={specSelections[spec.code] === val}
              onChange={() => handleSpec(spec.code, val)} />
          ))}
        </FilterSection>
      ))}
    </aside>
  );
}
