'use client';

import Image from 'next/image';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterIcon from '@/assets/icons/filter.png';

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-gray-500 flex-shrink-0"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </motion.svg>
);

const easing = [0.04, 0.62, 0.23, 0.98] as [number, number, number, number];

const accordionVariants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: easing },
  },
  closed: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.25, ease: easing },
  },
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-[#FBBB14] rounded-[12px] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-[14px] py-[12px] bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-[14px] font-medium text-gray-800">{title}</span>
        <ChevronIcon open={open} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={accordionVariants}
            style={{ overflow: 'hidden' }}
          >
            <div className="px-[14px] pb-[14px] pt-[2px]">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxItem({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-[10px] py-[5px] cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-[16px] h-[16px] rounded-[4px] border flex-shrink-0 flex items-center justify-center transition-colors ${
          checked
            ? 'bg-[#402F75] border-[#402F75]'
            : 'border-[#FBBB14] bg-white group-hover:border-[#402F75]'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-gray-700 select-none">{label}</span>
    </label>
  );
}

// Dual range slider
function PriceRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const toPercent = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div className="pt-[6px] pb-[4px]">
      <div className="relative h-[4px] mx-[8px] my-[16px]">
        <div className="absolute inset-0 rounded-full bg-gray-200" />
        <div
          className="absolute h-full rounded-full bg-[#402F75]"
          style={{
            left: `${toPercent(value[0])}%`,
            right: `${100 - toPercent(value[1])}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[0]}
          onChange={(e) => {
            const v = Math.min(Number(e.target.value), value[1] - 50);
            onChange([v, value[1]]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={value[1]}
          onChange={(e) => {
            const v = Math.max(Number(e.target.value), value[0] + 50);
            onChange([value[0], v]);
          }}
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ pointerEvents: 'auto' }}
        />
        {/* Visual thumbs */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-[#402F75] border-[3px] border-white shadow-md -translate-x-1/2 pointer-events-none"
          style={{ left: `${toPercent(value[0])}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-[#402F75] border-[3px] border-white shadow-md -translate-x-1/2 pointer-events-none"
          style={{ left: `${toPercent(value[1])}%` }}
        />
      </div>
      <div className="flex justify-between mt-[10px]">
        <span className="text-[12px] text-gray-500">${value[0].toLocaleString()}</span>
        <span className="text-[12px] text-gray-500">${value[1].toLocaleString()}</span>
      </div>
    </div>
  );
}

const FILTER_DATA = {
  condition: ['New', 'Used'],
  category: ['Desktops', 'Laptops'],
  subcategory: ['Budget', 'Business', 'Compact', 'Gaming', 'Home', 'Professional', 'Ultrabooks'],
  brand: ['ASUS', 'Acer', 'Apple', 'Dell', 'HP', 'Lenovo', 'Microsoft'],
  availability: ['In Stock', 'Out of Stock', 'Pre-Order'],
  processor: [
    'AMD Ryzen 5',
    'AMD Ryzen 7',
    'AMD Ryzen 9',
    'Apple M2',
    'Apple M3',
    'Intel Core i3',
    'Intel Core i5',
    'Intel Core i7',
    'Intel Core i9',
  ],
};

type CheckboxState = Record<string, Record<string, boolean>>;

function initCheckboxes(): CheckboxState {
  return Object.fromEntries(
    Object.entries(FILTER_DATA).map(([key, items]) => [
      key,
      Object.fromEntries(items.map((item) => [item, false])),
    ])
  );
}

export default function ProductFilter() {
  const [price, setPrice] = useState<[number, number]>([499, 3499]);
  const [checks, setChecks] = useState<CheckboxState>(initCheckboxes);

  const toggle = useCallback((group: string, item: string) => {
    setChecks((prev) => ({
      ...prev,
      [group]: { ...prev[group], [item]: !prev[group][item] },
    }));
  }, []);

  return (
    <aside className="bg-white rounded-[20px] border border-[#FBBB14] p-[14px] w-full md:w-[280px] flex-shrink-0 flex flex-col gap-[10px]">
      {/* Header */}
      <div className="flex items-center gap-[10px] px-[2px] pb-[4px]">
        <Image src={FilterIcon} alt="Filter" width={20} height={20} />
        <h2 className="text-[18px] font-medium">Filters</h2>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <PriceRange min={0} max={5000} value={price} onChange={setPrice} />
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition">
        {FILTER_DATA.condition.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={checks.condition[item]}
            onChange={() => toggle('condition', item)}
          />
        ))}
      </FilterSection>

      {/* Category */}
      <FilterSection title="Category">
        {FILTER_DATA.category.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={checks.category[item]}
            onChange={() => toggle('category', item)}
          />
        ))}
      </FilterSection>

      {/* Subcategory */}
      <FilterSection title="Subcategory">
        {FILTER_DATA.subcategory.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={checks.subcategory[item]}
            onChange={() => toggle('subcategory', item)}
          />
        ))}
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        {FILTER_DATA.brand.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={checks.brand[item]}
            onChange={() => toggle('brand', item)}
          />
        ))}
      </FilterSection>

      {/* Availability Status */}
      <FilterSection title="Availability Status">
        {FILTER_DATA.availability.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={checks.availability[item]}
            onChange={() => toggle('availability', item)}
          />
        ))}
      </FilterSection>

      {/* Processor Type */}
      <FilterSection title="Processor Type">
        {FILTER_DATA.processor.map((item) => (
          <CheckboxItem
            key={item}
            label={item}
            checked={checks.processor[item]}
            onChange={() => toggle('processor', item)}
          />
        ))}
      </FilterSection>
    </aside>
  );
}
