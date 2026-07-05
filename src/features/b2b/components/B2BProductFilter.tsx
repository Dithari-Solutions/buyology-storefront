'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import FilterIcon from '@/assets/icons/filter.png';
import {
  getB2bFilters,
  type ProductFilters,
  type CategoryFilterOption,
  type BrandFilterOption,
  type SpecFilterOption,
} from '@/features/product/services/productService';
import { selectSelectedCountryCode, selectPreferredCurrency } from '@/features/country/store/countrySlice';
import { selectUserCoords } from '@/features/location/store/locationSlice';
import type { Lang } from '@/config/pathSlugs';

// B2B filter panel — mirrors the consumer ProductFilter but sources options from
// `/api/product/b2b/filters` and INTENTIONALLY OMITS the price slider: the B2B
// channel hides price (Request-a-Quote) and the backend returns priceRange {0,0}.

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

// ── Types ─────────────────────────────────────────────────────────────────────

/** Active B2B filter selections (no price — B2B hides pricing). */
export interface B2BActiveFilters {
  condition?: string;
  categoryId?: string;
  /** multi-select brand ids */
  brandIds?: string[];
  availabilityStatus?: string;
  /** spec code → selected values (multi-select) */
  specs: Record<string, string[]>;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function B2BProductFilter({ onFiltersChange, initialCategoryId }: {
  onFiltersChange?: (filters: B2BActiveFilters) => void;
  initialCategoryId?: string | null;
}) {
  const params = useParams();
  const lang = (params?.lang as Lang) ?? 'en';
  const { t } = useTranslation('product');
  const countryCode = useSelector(selectSelectedCountryCode);
  const currency = useSelector(selectPreferredCurrency);
  const coords = useSelector(selectUserCoords);

  const [filters, setFilters] = useState<ProductFilters | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const [condition, setCondition] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(initialCategoryId ?? null);

  useEffect(() => {
    setCategoryId(initialCategoryId ?? null);
  }, [initialCategoryId]);
  const [brandIds, setBrandIds] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string | null>(null);
  const [specSelections, setSpecSelections] = useState<Record<string, string[]>>({});

  // Fetch B2B filter options (priceRange comes back {0,0} → no slider).
  useEffect(() => {
    setLoading(true);
    getB2bFilters(lang, countryCode ?? undefined, currency ?? undefined, coords?.lat, coords?.lng)
      .then(setFilters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [lang, countryCode, currency, coords?.lat, coords?.lng]);

  const emitChanges = useCallback((overrides: Partial<{
    condition: string | null; categoryId: string | null;
    brandIds: string[]; availability: string | null; specSelections: Record<string, string[]>;
  }> = {}) => {
    if (!filters || !onFiltersChange) return;
    const cond   = overrides.condition      ?? condition;
    const cat    = overrides.categoryId     ?? categoryId;
    const brands = overrides.brandIds       ?? brandIds;
    const avail  = overrides.availability   ?? availability;
    const specs  = overrides.specSelections ?? specSelections;
    onFiltersChange({
      condition:          cond   ?? undefined,
      categoryId:         cat    ?? undefined,
      brandIds:           brands.length ? brands : undefined,
      availabilityStatus: avail  ?? undefined,
      specs,
    });
  }, [filters, condition, categoryId, brandIds, availability, specSelections, onFiltersChange]);

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

  const clearAll = () => {
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

  const activeCount =
    (condition ? 1 : 0) + (categoryId ? 1 : 0) + brandIds.length + (availability ? 1 : 0) +
    Object.values(specSelections).reduce((n, v) => n + (v?.length ?? 0), 0);

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

      {/* NB: no price slider on the B2B channel. */}

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

      {/* Dynamic spec filters */}
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
