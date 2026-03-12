"use client";

import { useState } from "react";
import ProductDetailImage from "./ProductDetailImage";
import ProductFeaturesBadges from "./ProductFeaturesBadges";
import ProductActions from "./ProductActions";
import ProductReviews from "./ProductReviews";
import type { Review } from "../types";
import type { ApiProduct, ApiSpec, ApiSpecOption } from "../services/productService";

interface ProductDetailClientProps {
  product: ApiProduct;
  images: string[];
  reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const empty = 5 - Math.ceil(rating);
  const hasHalf = rating % 1 !== 0;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <svg key={`f${i}`} width="16" height="16" viewBox="0 0 24 24" fill="#FBBB14">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      {hasHalf && (
        <svg width="16" height="16" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#FBBB14" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#half)" stroke="#FBBB14" strokeWidth="1.5" />
        </svg>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <svg key={`e${i}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FBBB14" strokeWidth="1.5">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function SpecSelector({
  spec,
  selectedOptionId,
  onSelect,
}: {
  spec: ApiSpec;
  selectedOptionId: string;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-gray-900">{spec.name}</span>
      <div className="flex flex-wrap gap-2">
        {spec.options.map((option: ApiSpecOption) => {
          const isSelected = selectedOptionId === option.id;
          const hasExtra = option.additionalPrice > 0;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                isSelected
                  ? "bg-purple-100 text-[#402F75] border-[#402F75]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              <span>{option.value} {option.unit}</span>
              {hasExtra && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-[#402F75] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  +${option.additionalPrice}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProductDetailClient({ product, images, reviews }: ProductDetailClientProps) {
  // Initialize selections to first option of each spec
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => Object.fromEntries(product.specs.map((s) => [s.id, s.options[0]?.id ?? ""]))
  );

  function handleSelect(specId: string, optionId: string) {
    setSelectedOptions((prev) => ({ ...prev, [specId]: optionId }));
  }

  // Compute total additional price from selected options
  const additionalPrice = product.specs.reduce((sum, spec) => {
    const selectedId = selectedOptions[spec.id];
    const option = spec.options.find((o) => o.id === selectedId);
    return sum + (option?.additionalPrice ?? 0);
  }, 0);

  const totalPrice = product.effectivePrice + additionalPrice;
  const hasDiscount = product.discountValue && product.discountValue > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16 items-start">

        {/* Left — image gallery */}
        <ProductDetailImage images={images} />

        {/* Right — product info */}
        <div className="flex flex-col gap-6">

          {/* Title */}
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{product.title}</h1>
              <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                <button
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Share product"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
                <button
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Add to wishlist"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Rating placeholder (API doesn't provide rating yet) */}
            <div className="flex items-center gap-2">
              <StarRating rating={0} />
              <span className="text-gray-400 text-sm">No reviews yet</span>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-gray-500 text-sm">In Stock</span>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[32px] font-bold text-gray-900 leading-none">
                ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.basePrice.toLocaleString()}
                  </span>
                  <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full">
                    -{product.discountValue}
                  </span>
                </>
              )}
              {additionalPrice > 0 && (
                <span className="text-sm text-[#402F75] font-semibold">
                  (base ${product.effectivePrice} + options +${additionalPrice})
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-line">{product.description}</p>
          </div>

          {/* Spec selectors */}
          {product.specs.length > 0 && (
            <div className="flex flex-col gap-4">
              {product.specs.map((spec) => (
                <SpecSelector
                  key={spec.id}
                  spec={spec}
                  selectedOptionId={selectedOptions[spec.id] ?? ""}
                  onSelect={(optionId) => handleSelect(spec.id, optionId)}
                />
              ))}
            </div>
          )}

          <hr className="border-gray-100" />
          <ProductFeaturesBadges />
          <hr className="border-gray-100" />
          <ProductActions />
        </div>
      </div>

      {/* Technical specs table */}
      {product.specs.length > 0 && (
        <div className="mt-12 border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">Technical Specifications</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {product.specs.map((spec) => {
              const selected = spec.options.find((o) => o.id === selectedOptions[spec.id]);
              return (
                <div key={spec.id} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4">
                  <div className="w-11 h-11 rounded-full bg-[#EDE9FF] flex items-center justify-center flex-shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="8" width="20" height="8" rx="1" />
                      <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-gray-400">{spec.name}</span>
                    <span className="text-sm font-bold text-gray-900">
                      {selected ? `${selected.value} ${selected.unit}` : "—"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Customer reviews */}
      <div className="mt-10 pb-10">
        <ProductReviews reviews={reviews} />
      </div>
    </div>
  );
}
