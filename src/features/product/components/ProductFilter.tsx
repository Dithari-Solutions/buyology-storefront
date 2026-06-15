'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FilterIcon from '@/assets/icons/filter.png';
import {
  getProductFilters,
  type ProductFilters,
  type CategoryFilterOption,
  type BrandFilterOption,
  type SpecFilterOption,
} from '../services/productService';
import { selectSelectedCountryCode, selectPreferredCurrency } from '@/features/country/store/countrySlice';
import type { Lang } from '@/config/pathSlugs';

// ── Sub-components ────────────────────────────────────────────────────────────

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    className="text-gray-400 flex-shrink-0"
  >
    <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </motion.svg>
);

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];
const accordionVariants = {
  open:   { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: easing } },
  closed: { height: 0,      opacity: 0, transition: { duration: 0.25, ease: easing } },
};

function FilterSection({ title, count = 0, children, defaultOpen = false }: {
  title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-[14px] border border-gray-100 bg-white overflow-hidden transition-colors hover:border-gray-200">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-[14px] py-[11px] hover:bg-gray-50/70 transition-colors">
        <span className="flex items-center gap-2 text-[13.5px] font-semibold text-gray-800">
          {title}
          {count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#402F75] text-white text-[10px] font-bold leading-none">
              {count}
            </span>
          )}
        </span>
        <ChevronIcon open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="content" initial="closed" animate="open" exit="closed"
            variants={accordionVariants} style={{ overflow: 'hidden' }}>
            <div className="px-[12px] pb-[12px] pt-[2px]">{children}</div>
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
    <button type="button" onClick={onChange}
      className="flex items-center gap-[10px] w-full py-[6px] px-[8px] -mx-[2px] rounded-[8px] hover:bg-gray-50 transition-colors text-left group">
      <span className={`w-[18px] h-[18px] rounded-[6px] border flex-shrink-0 flex items-center justify-center transition-all ${
        checked ? 'bg-[#402F75] border-[#402F75]' : 'border-gray-300 bg-white group-hover:border-[#402F75]'
      }`}>
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={`text-[13px] select-none truncate ${checked ? 'text-gray-900 font-semibold' : 'text-gray-600'}`}>{label}</span>
    </button>
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
      <div ref={trackRef} className="relative h-[5px] mx-[8px] my-[16px]">
        <div className="absolute inset-0 rounded-full bg-gray-200" />
        <div className="absolute h-full rounded-full bg-gradient-to-r from-[#402F75] to-purple-500"
          style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }} />
        {/* Min thumb */}
        <div
          onMouseDown={startDrag('min')}
          onTouchStart={startDrag('min')}
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white border-[3px] border-[#402F75] shadow-md -translate-x-1/2 cursor-grab active:cursor-grabbing select-none"
          style={{ left: `${minPct}%`, zIndex: minPct >= maxPct - 1 ? 3 : 2 }}
        />
        {/* Max thumb */}
        <div
          onMouseDown={startDrag('max')}
          onTouchStart={startDrag('max')}
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white border-[3px] border-[#402F75] shadow-md -translate-x-1/2 cursor-grab active:cursor-grabbing select-none"
          style={{ left: `${maxPct}%`, zIndex: minPct >= maxPct - 1 ? 2 : 3 }}
        />
      </div>
      <div className="flex justify-between mt-[10px]">
        <span className="text-[12px] font-semibold text-gray-700 bg-gray-50 rounded-md px-2 py-0.5">{value[0].toLocaleString()}</span>
        <span className="text-[12px] font-semibold text-gray-700 bg-gray-50 rounded-md px-2 py-0.5">{value[1].toLocaleString()}</span>
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
  /** multi-select brand ids */
  brandIds?: string[];
  availabilityStatus?: string;
  /** spec code → selected values (multi-select) */
  specs: Record<string, string[]>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProductFilter({ onFiltersChange, initialCategoryId }: {
  onFiltersChange?: (filters: ActiveFilters) => void;
  initialCategoryId?: string | null;
}) {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const { t } = useTranslation('product');
  const countryCode = useSelector(selectSelectedCountryCode);
  const currency = useSelector(selectPreferredCurrency);

  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Selection state
  const [price, setPrice] = useState<[number, number]>([0, 0]);
  const [condition, setCondition] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId ?? null);

  // Keep the selected category in sync with the URL (e.g. picking another category from the header).
  useEffect(() => {
    setCategoryId(initialCategoryId ?? null);
  }, [initialCategoryId]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string | null>(null);
  const [specSelections, setSpecSelections] = useState<Record<string, string[]>>({});

  // Fetch filter options from API
  useEffect(() => {
    setLoading(true);
    getProductFilters(lang, countryCode ?? undefined, currency ?? undefined)
      .then(data => {
        setFilters(data);
        // Price range always starts at 0 (not the cheapest product's price).
        const max = Math.ceil(data.priceRange.max);
        setPrice([0, max]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang, countryCode, currency]);

  // Emit changes whenever any selection changes
  const emitChanges = useCallback((overrides: Partial<{
    price: [number, number]; condition: string | null; categoryId: string | null;
    brandIds: string[]; availability: string | null; specSelections: Record<string, string[]>;
  }> = {}) => {
    if (!filters || !onFiltersChange) return;
    const p     = overrides.price          ?? price;
    const cond  = overrides.condition      ?? condition;
    const cat   = overrides.categoryId     ?? categoryId;
    const brands = overrides.brandIds      ?? brandIds;
    const avail = overrides.availability   ?? availability;
    const specs = overrides.specSelections ?? specSelections;
    const priceMin = filters.priceRange.min;
    const priceMax = filters.priceRange.max;
    onFiltersChange({
      minPrice:           p[0] > priceMin ? p[0] : undefined,
      maxPrice:           p[1] < priceMax ? p[1] : undefined,
      condition:          cond   ?? undefined,
      categoryId:         cat    ?? undefined,
      brandIds:           brands.length ? brands : undefined,
      availabilityStatus: avail  ?? undefined,
      specs,
    });
  }, [filters, price, condition, categoryId, brandIds, availability, specSelections, onFiltersChange]);

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
    const next = brandIds.includes(id) ? brandIds.filter(b => b !== id) : [...brandIds, id];
    setBrandIds(next); emitChanges({ brandIds: next });
  };
  const handleAvailability = (val: string) => {
    const next = availability === val ? null : val;
    setAvailability(next); emitChanges({ availability: next });
  };
  const handleSpec = (code: string, val: string) => {
    const current = specSelections[code] ?? [];
    const nextVals = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
    const next = { ...specSelections, [code]: nextVals };
    setSpecSelections(next); emitChanges({ specSelections: next });
  };

  // Reset every filter back to defaults.
  const clearAll = () => {
    const max = filters ? Math.ceil(filters.priceRange.max) : 0;
    setPrice([0, max]);
    setCondition(null);
    setCategoryId(null);
    setBrandIds([]);
    setAvailability(null);
    setSpecSelections({});
    onFiltersChange?.({ specs: {} });
  };

  const AVAILABILITY_LABELS: Record<string, string> = {
    IN_STOCK: t('shop.availability.IN_STOCK', { defaultValue: 'In Stock' }),
    OUT_OF_STOCK: t('shop.availability.OUT_OF_STOCK', { defaultValue: 'Out of Stock' }),
    PRE_ORDER: t('shop.availability.PRE_ORDER', { defaultValue: 'Pre-Order' }),
  };
  const CONDITION_LABELS: Record<string, string> = {
    NEW: t('shop.condition.NEW', { defaultValue: 'New' }),
    REFURBISHED: t('shop.condition.REFURBISHED', { defaultValue: 'Refurbished' }),
  };

  // Separate root categories and subcategories
  const rootCategories = filters?.categories.filter(c => !c.parentId) ?? [];
  const subCategories  = filters?.categories.filter(c =>  c.parentId) ?? [];

  if (loading) {
    return (
      <aside className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-[14px] w-full md:w-[280px] flex-shrink-0 flex flex-col gap-[10px] animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[44px] rounded-[14px] bg-gray-100" />
        ))}
      </aside>
    );
  }

  if (!filters) return null;

  const priceMin = 0;
  const priceMax = Math.ceil(filters.priceRange.max);

  // Total active filters for the "Clear all" affordance.
  const activeCount =
    (condition ? 1 : 0) + (categoryId ? 1 : 0) + brandIds.length + (availability ? 1 : 0) +
    Object.values(specSelections).reduce((n, v) => n + (v?.length ?? 0), 0) +
    ((price[0] > priceMin || price[1] < priceMax) ? 1 : 0);

  const specCount = (code: string) => specSelections[code]?.length ?? 0;
  const totalSpecSelected = Object.values(specSelections).reduce((n, v) => n + (v?.length ?? 0), 0);

  return (
    <aside className="bg-white rounded-[20px] border border-gray-100 shadow-sm p-[14px] w-full md:w-[280px] flex-shrink-0 flex flex-col gap-[10px]">
      {/* Header */}
      <div className="flex items-center justify-between px-[2px] pb-[6px] border-b border-gray-100">
        <div className="flex items-center gap-[10px]">
          <Image src={FilterIcon} alt="Filter" width={18} height={18} />
          <h2 className="text-[17px] font-bold text-gray-900">{t('shop.filters.title', { defaultValue: 'Filters' })}</h2>
        </div>
        {activeCount > 0 && (
          <button type="button" onClick={clearAll}
            className="text-[12px] font-semibold text-[#402F75] hover:underline">
            {t('shop.filters.clearAll', { defaultValue: 'Clear all' })} ({activeCount})
          </button>
        )}
      </div>

      {/* Price Range */}
      {priceMax > 0 && (
        <FilterSection title={t('shop.filters.priceRange', { defaultValue: 'Price Range' })} defaultOpen>
          <PriceRange min={priceMin} max={priceMax} value={price} onChange={handlePrice} />
        </FilterSection>
      )}

      {/* Condition */}
      {filters.conditions.length > 0 && (
        <FilterSection title={t('shop.filters.condition', { defaultValue: 'Condition' })} count={condition ? 1 : 0} defaultOpen>
          {filters.conditions.map(val => (
            <CheckboxItem key={val} label={CONDITION_LABELS[val] ?? val}
              checked={condition === val} onChange={() => handleCondition(val)} />
          ))}
        </FilterSection>
      )}

      {/* Category */}
      {rootCategories.length > 0 && (
        <FilterSection title={t('shop.filters.category', { defaultValue: 'Category' })} count={categoryId && rootCategories.some(c => c.id === categoryId) ? 1 : 0} defaultOpen>
          {rootCategories.map((cat: CategoryFilterOption) => (
            <CheckboxItem key={cat.id} label={cat.name}
              checked={categoryId === cat.id} onChange={() => handleCategory(cat.id)} />
          ))}
        </FilterSection>
      )}

      {/* Subcategory */}
      {subCategories.length > 0 && (
        <FilterSection title={t('shop.filters.subcategory', { defaultValue: 'Subcategory' })} count={categoryId && subCategories.some(c => c.id === categoryId) ? 1 : 0}>
          {subCategories.map((cat: CategoryFilterOption) => (
            <CheckboxItem key={cat.id} label={cat.name}
              checked={categoryId === cat.id} onChange={() => handleCategory(cat.id)} />
          ))}
        </FilterSection>
      )}

      {/* Brand — multi-select */}
      {filters.brands.length > 0 && (
        <FilterSection title={t('shop.filters.brand', { defaultValue: 'Brand' })} count={brandIds.length} defaultOpen>
          {filters.brands.map((b: BrandFilterOption) => (
            <CheckboxItem key={b.id} label={b.name}
              checked={brandIds.includes(b.id)} onChange={() => handleBrand(b.id)} />
          ))}
        </FilterSection>
      )}

      {/* Availability */}
      {filters.availabilityStatuses.length > 0 && (
        <FilterSection title={t('shop.filters.availability', { defaultValue: 'Availability Status' })} count={availability ? 1 : 0} defaultOpen>
          {filters.availabilityStatuses.map(val => (
            <CheckboxItem key={val} label={AVAILABILITY_LABELS[val] ?? val}
              checked={availability === val} onChange={() => handleAvailability(val)} />
          ))}
        </FilterSection>
      )}

      {/* Dynamic spec filters — hidden behind a toggle so the panel stays clean.
          Each spec is multi-select; values show their unit ("8 GB"). */}
      {filters.specs.length > 0 && (
        <>
          <button type="button" onClick={() => setShowAllSpecs(v => !v)}
            className="flex items-center justify-center gap-2 w-full py-[11px] rounded-[14px] border border-[#402F75]/25 bg-[#F6F4FF] text-[#402F75] text-[13px] font-bold hover:bg-[#402F75] hover:text-white transition-colors">
            {showAllSpecs
              ? t('shop.filters.hideSpecs', { defaultValue: 'Hide specifications' })
              : t('shop.filters.seeAllSpecs', { defaultValue: 'See all specifications' })}
            {totalSpecSelected > 0 && !showAllSpecs && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[#FBBB14] text-white text-[10px] font-bold leading-none">
                {totalSpecSelected}
              </span>
            )}
            <ChevronIcon open={showAllSpecs} />
          </button>

          <AnimatePresence initial={false}>
            {showAllSpecs && (
              <motion.div key="specs" initial="closed" animate="open" exit="closed"
                variants={accordionVariants} style={{ overflow: 'hidden' }}>
                <div className="flex flex-col gap-[10px]">
                  {filters.specs.map((spec: SpecFilterOption) => (
                    <FilterSection key={spec.code} title={spec.label} count={specCount(spec.code)}>
                      {spec.values.map(v => (
                        <CheckboxItem key={v.value} label={v.unit ? `${v.value} ${v.unit}` : v.value}
                          checked={(specSelections[spec.code] ?? []).includes(v.value)}
                          onChange={() => handleSpec(spec.code, v.value)} />
                      ))}
                    </FilterSection>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </aside>
  );
}
