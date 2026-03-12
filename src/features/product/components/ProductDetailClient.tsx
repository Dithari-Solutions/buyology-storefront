"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import ProductDetailImage from "./ProductDetailImage";
import ProductFeaturesBadges from "./ProductFeaturesBadges";
import ProductReviews from "./ProductReviews";
import { addItem } from "@/features/cart/store/cartSlice";
import { toggleFavourite, selectIsFavourite } from "@/features/favourites/store/favouritesSlice";
import type { RootState } from "@/store";
import type { Review } from "../types";
import type { ApiProduct, ApiSpec, ApiSpecOption } from "../services/productService";

interface ProductDetailClientProps {
  product: ApiProduct;
  images: string[];
  reviews: Review[];
}

function StarRating({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const partial = !filled && rating > star - 1;
          const pct = partial ? Math.round((rating - (star - 1)) * 100) : 0;
          return (
            <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill="none">
              <defs>
                <linearGradient id={`star-${star}`} x1="0" x2="1" y2="0">
                  <stop offset={`${filled ? 100 : pct}%`} stopColor="#FBBB14" />
                  <stop offset={`${filled ? 100 : pct}%`} stopColor="#E5E7EB" />
                </linearGradient>
              </defs>
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={`url(#star-${star})`}
                stroke="none"
              />
            </svg>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-gray-800">{rating.toFixed(1)}</span>
      {count != null && (
        <span className="text-sm text-gray-400">({count} reviews)</span>
      )}
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
  const selected = spec.options.find((o) => o.id === selectedOptionId);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{spec.name}</span>
        {selected && (
          <span className="text-sm text-[#402F75] font-medium">
            {selected.value} {selected.unit}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {spec.options.map((option: ApiSpecOption) => {
          const isSelected = selectedOptionId === option.id;
          const hasExtra = option.additionalPrice > 0;
          return (
            <button
              key={option.id}
              onClick={() => onSelect(option.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all duration-150 ${
                isSelected
                  ? "bg-[#402F75] text-white border-[#402F75] shadow-sm shadow-purple-200"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#402F75]/40 hover:text-[#402F75]"
              }`}
            >
              <span>{option.value} {option.unit}</span>
              {hasExtra && (
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
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
  const dispatch = useDispatch();
  const isFav = useSelector((state: RootState) => selectIsFavourite(product.id)(state));

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => Object.fromEntries(product.specs.map((s) => [s.id, s.options[0]?.id ?? ""]))
  );
  const [added, setAdded] = useState(false);
  const [favBounce, setFavBounce] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleSelect(specId: string, optionId: string) {
    setSelectedOptions((prev) => ({ ...prev, [specId]: optionId }));
  }

  const additionalPrice = product.specs.reduce((sum, spec) => {
    const option = spec.options.find((o) => o.id === selectedOptions[spec.id]);
    return sum + (option?.additionalPrice ?? 0);
  }, 0);

  const totalPrice = product.effectivePrice + additionalPrice;
  const hasDiscount = product.discountValue && product.discountValue > 0;
  const savings = hasDiscount ? product.basePrice - product.effectivePrice : 0;

  function getVariantLabel() {
    return product.specs
      .map((spec) => {
        const opt = spec.options.find((o) => o.id === selectedOptions[spec.id]);
        return opt ? `${opt.value}${opt.unit}` : null;
      })
      .filter(Boolean)
      .join(" / ");
  }

  function handleAddToCart() {
    dispatch(addItem({
      id: `cart-${product.id}-${Date.now()}`,
      productId: product.id,
      title: product.title,
      imageUrl: images[0] ?? "",
      variant: { color: "", storage: getVariantLabel() },
      price: totalPrice,
      originalPrice: product.basePrice,
      discountPercent:
        hasDiscount && product.basePrice > 0
          ? Math.round(((product.basePrice - product.effectivePrice) / product.basePrice) * 100)
          : 0,
      quantity: 1,
      savedForLater: false,
    }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleToggleFavourite() {
    const slugs = { en: product.slug, az: product.slug, ar: product.slug };
    const ramSpec = product.specs.find((s) => s.code === "ram");
    const storageSpec = product.specs.find((s) => s.code === "storage");
    const ramOpt = ramSpec?.options.find((o) => o.id === selectedOptions[ramSpec.id]);
    const storOpt = storageSpec?.options.find((o) => o.id === (selectedOptions[storageSpec?.id ?? ""] ?? ""));

    dispatch(toggleFavourite({
      id: product.id,
      title: product.title,
      price: totalPrice,
      originalPrice: product.basePrice,
      discount: product.discountValue ?? 0,
      rating: 0,
      inStock: true,
      category: product.categoryId,
      slugs,
      ram: ramOpt ? `${ramOpt.value}${ramOpt.unit}` : undefined,
      storage: storOpt ? `${storOpt.value}${storOpt.unit}` : undefined,
    }));
    setFavBounce(true);
    setTimeout(() => setFavBounce(false), 400);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

      {/* Main 2-col grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">

        {/* Left — image gallery */}
        <div className="lg:sticky lg:top-24">
          <ProductDetailImage images={images} />
        </div>

        {/* Right — product info */}
        <div className="flex flex-col gap-5">

          {/* Category tag */}
          {product.categoryId && (
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#402F75] bg-[#F3F0FF] px-3 py-1.5 rounded-full uppercase tracking-wide">
                {product.categoryId}
              </span>
            </div>
          )}

          {/* Title + action icons */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>

            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              {/* Share */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all"
                  aria-label="Share product"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: 4, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg pointer-events-none z-10"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              {/* Favourite */}
              <motion.button
                onClick={handleToggleFavourite}
                animate={favBounce ? { scale: [1, 1.4, 0.85, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`w-10 h-10 rounded-full border bg-white flex items-center justify-center transition-all ${
                  isFav
                    ? "border-[#FBBB14] bg-yellow-50"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
                aria-label="Add to wishlist"
              >
                <motion.svg
                  width="17" height="17" viewBox="0 0 24 24"
                  fill={isFav ? "#FBBB14" : "none"}
                  stroke={isFav ? "#FBBB14" : "#6B7280"}
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </motion.svg>
              </motion.button>
            </div>
          </div>

          {/* Rating + Stock row */}
          <div className="flex items-center gap-4 flex-wrap">
            <StarRating rating={4.8} count={reviews.length} />
            <span className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              <span className="text-sm font-medium text-green-700">In Stock</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-end gap-3 flex-wrap">
            <span className="text-[34px] font-extrabold text-gray-900 leading-none tracking-tight">
              ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {hasDiscount && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg text-gray-400 line-through font-medium">
                  ${product.basePrice.toLocaleString()}
                </span>
                <span className="bg-red-50 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full border border-red-100">
                  Save ${savings.toFixed(0)}
                </span>
              </div>
            )}
            {additionalPrice > 0 && (
              <span className="text-sm text-[#402F75] font-semibold mb-1">
                +${additionalPrice} for options
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-500 text-[14px] leading-relaxed">{product.description}</p>

          {/* Spec selectors */}
          {product.specs.length > 0 && (
            <div className="flex flex-col gap-5 pt-1">
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

          <div className="h-px bg-gray-100" />

          {/* Features badges */}
          <ProductFeaturesBadges />

          <div className="h-px bg-gray-100" />

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-1">
            {/* Buy Now — primary */}
            <button className="w-full py-4 rounded-2xl bg-[#FBBB14] text-gray-900 font-bold text-[15px] hover:brightness-95 active:scale-[0.98] transition-all shadow-sm shadow-yellow-200">
              Buy Now
            </button>

            {/* Add to Cart — secondary */}
            <motion.button
              onClick={handleAddToCart}
              animate={added
                ? { scale: [1, 0.93, 1.03, 1], transition: { duration: 0.35 } }
                : { scale: 1 }}
              className={`w-full py-4 rounded-2xl border-2 font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 ${
                added
                  ? "border-green-500 bg-green-500 text-white"
                  : "border-[#402F75] bg-white text-[#402F75] hover:bg-[#402F75] hover:text-white"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Added to Cart!
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Add to Cart
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 pt-1">
            {[
              { icon: "🔒", text: "Secure checkout" },
              { icon: "↩", text: "30-day returns" },
              { icon: "✓", text: "Official warranty" },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-[12px] text-gray-400 font-medium">
                <span>{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technical specs */}
      {product.specs.length > 0 && (
        <div className="mt-14">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Technical Specifications</h2>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {product.specs.map((spec) => {
              const selected = spec.options.find((o) => o.id === selectedOptions[spec.id]);
              return (
                <div
                  key={spec.id}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-[#402F75]/20 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F3F0FF] flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="8" width="20" height="8" rx="1" />
                      <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
                    </svg>
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{spec.name}</span>
                    <span className="text-sm font-bold text-gray-900 truncate">
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
      <div className="mt-10 pb-12">
        <ProductReviews reviews={reviews} />
      </div>
    </div>
  );
}
