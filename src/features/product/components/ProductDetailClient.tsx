"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import ProductDetailImage from "./ProductDetailImage";
import ProductFeaturesBadges from "./ProductFeaturesBadges";
import { FlameIcon, HourglassIcon, BoltIcon, AlertIcon, LockIcon, ReturnIcon, CheckIcon } from "@/shared/icons";
import ProductReviews from "./ProductReviews";
import ProductQA from "./ProductQA";
import { addItem, addToCartThunk } from "@/features/cart/store/cartSlice";
import { addToFavouritesThunk, removeFromFavouritesThunk, selectIsFavourite } from "@/features/favourites/store/favouritesSlice";
import { selectSelectedCountryCode, selectPreferredCurrency } from "@/features/country/store/countrySlice";
import { getProductBySlug, type ApiProduct, type ApiSpec, type ApiSpecOption } from "../services/productService";
import { getRefundSettings } from "@/features/refund/services/refundService";
import { getImageUrl } from "@/shared/utils/imageUrl";
import type { AppDispatch, RootState } from "@/store";
import type { Lang } from "@/config/pathSlugs";

interface ProductDetailClientProps {
  product: ApiProduct;
  images: string[];
  slug: string;
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

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", AZN: "₼", AED: "د.إ", SAR: "﷼", TRY: "₺",
};

function formatPrice(amount: number, currency?: string | null) {
  const symbol = currency ? (CURRENCY_SYMBOL[currency] ?? `${currency} `) : "$";
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function humanize(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProductDetailClient({ product: initialProduct, images: initialImages, slug }: ProductDetailClientProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const { t } = useTranslation("product");
  const countryCode = useSelector(selectSelectedCountryCode);
  const currency = useSelector(selectPreferredCurrency);

  const [product, setProduct] = useState<ApiProduct>(initialProduct);
  const [images, setImages] = useState<string[]>(initialImages);
  // Return/refund window (days) from store settings — drives the "{n}-Day Returns" badge.
  const [returnWindowDays, setReturnWindowDays] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getRefundSettings()
      .then((s) => {
        if (!cancelled) setReturnWindowDays(s.enabled ? s.returnWindowDays : null);
      })
      .catch(() => {
        // leave null — the badge falls back to a static label
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!countryCode) return;
    (async () => {
      try {
        const fresh = await getProductBySlug(slug, { lang, countryCode, currency });
        if (cancelled) return;
        setProduct(fresh);
        const sorted = [...fresh.media].sort((a, b) => a.orderIndex - b.orderIndex);
        setImages(sorted.map((m) => getImageUrl(m.url)));
      } catch {
        // keep server-rendered product on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, lang, countryCode, currency]);

  const isFav = useSelector((state: RootState) => selectIsFavourite(product.id)(state));
  const userId = useSelector((state: RootState) => state.auth.userId);

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(
    () => Object.fromEntries(product.specs.map((s) => [s.id, s.options[0]?.id ?? ""]))
  );
  const [selectedColor, setSelectedColor] = useState<string>(() => product.colors[0] ?? "");
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

  const unitPrice = product.storePrice ?? product.effectivePrice ?? 0;
  const totalPrice = unitPrice + additionalPrice;
  // Discount is store-scoped: the backend sends originalPrice only when discounted.
  const originalUnitPrice = product.originalPrice ?? null;
  const hasDiscount = originalUnitPrice != null && originalUnitPrice > unitPrice;
  const savings = hasDiscount ? originalUnitPrice - unitPrice : 0;
  const discountPercent = hasDiscount && originalUnitPrice > 0
    ? Math.round((savings / originalUnitPrice) * 100)
    : 0;
  const originalTotalPrice = hasDiscount ? originalUnitPrice + additionalPrice : 0;
  const inStock = product.availabilityStatus === "IN_STOCK";
  const isOutOfStock = product.availabilityStatus === "OUT_OF_STOCK";
  const unavailableInCountry = product.availableInSelectedCountry === false;

  function getVariantLabel() {
    return product.specs
      .map((spec) => {
        const opt = spec.options.find((o) => o.id === selectedOptions[spec.id]);
        return opt ? `${opt.value}${opt.unit}` : null;
      })
      .filter(Boolean)
      .join(" / ");
  }

  function buildCartDisplayMeta() {
    return {
      productId: product.id,
      title: product.title,
      imageUrl: images[0] ?? "",
      variant: { color: selectedColor, storage: getVariantLabel() },
      price: totalPrice,
      originalPrice: originalTotalPrice,
      discountPercent,
      quantity: 1,
      savedForLater: false,
    };
  }

  async function persistToBackendCart(): Promise<boolean> {
    if (!userId) return false;
    const storeId = product.storeId ?? product.storeOptions?.[0]?.storeId ?? "";
    if (!storeId) return false;
    const tempId = `cart-${product.id}-${Date.now()}`;
    const result = await dispatch(addToCartThunk({
      userId,
      payload: { storeId, productId: product.id, quantity: 1 },
      displayMeta: buildCartDisplayMeta(),
      tempId,
    }));
    return !addToCartThunk.rejected.match(result);
  }

  async function handleAddToCart() {
    const ok = await persistToBackendCart();
    if (!ok) {
      dispatch(addItem({
        id: `cart-${product.id}-${Date.now()}`,
        ...buildCartDisplayMeta(),
      }));
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleToggleFavourite() {
    if (!userId) return;
    const slugs = { en: product.slug, az: product.slug, ar: product.slug };
    const ramSpec = product.specs.find((s) => s.code === "ram");
    const storageSpec = product.specs.find((s) => s.code === "storage");
    const ramOpt = ramSpec?.options.find((o) => o.id === selectedOptions[ramSpec.id]);
    const storOpt = storageSpec?.options.find((o) => o.id === (selectedOptions[storageSpec?.id ?? ""] ?? ""));

    if (isFav) {
      dispatch(removeFromFavouritesThunk({ userId, productId: product.id }));
    } else {
      dispatch(addToFavouritesThunk({
        userId,
        productId: product.id,
        meta: {
          id: product.id,
          title: product.title,
          price: totalPrice,
          originalPrice: originalTotalPrice,
          discount: savings,
          rating: 0,
          inStock: true,
          category: product.categoryId,
          slugs,
          imageUrl: images[0] ?? undefined,
          ram: ramOpt ? `${ramOpt.value}${ramOpt.unit}` : undefined,
          storage: storOpt ? `${storOpt.value}${storOpt.unit}` : undefined,
        },
      }));
    }
    setFavBounce(true);
    setTimeout(() => setFavBounce(false), 400);
  }

  async function handleBuyNow() {
    const ok = await persistToBackendCart();
    if (!ok) return;
    router.push(`/${lang}/checkout`);
  }

  const purchaseDisabled = isOutOfStock || unavailableInCountry;

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, url });
      } catch {
        await navigator.clipboard.writeText(url).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const infoRows = [
    product.brandName ? { label: t("details.info.brand"), value: product.brandName } : null,
    product.productType ? { label: t("details.info.type"), value: humanize(product.productType) } : null,
    product.sku ? { label: t("details.info.sku"), value: product.sku } : null,
    product.availabilityStatus
      ? { label: t("details.info.availability"), value: humanize(product.availabilityStatus) }
      : null,
    product.isRefurbished
      ? {
          label: t("details.info.condition"),
          value: product.refurbGrade
            ? t("details.info.refurbishedGrade", { grade: product.refurbGrade })
            : t("details.info.refurbished"),
        }
      : { label: t("details.info.condition"), value: t("details.info.new") },
    product.currency ? { label: t("details.info.currency"), value: product.currency } : null,
    product.expressDelivery != null
      ? {
          label: t("details.info.expressDelivery"),
          value: product.expressDelivery
            ? t("details.info.available")
            : t("details.info.notAvailable"),
        }
      : null,
    product.createdAt
      ? { label: t("details.info.listed"), value: new Date(product.createdAt).toLocaleDateString(lang) }
      : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return (
    <div className="relative">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full bg-[#402F75]/10 blur-3xl" />
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-[#FBBB14]/15 blur-3xl" />
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-pink-200/20 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <a href={`/${lang}`} className="hover:text-[#402F75] transition-colors">{t("details.breadcrumb.home")}</a>
          <span className="text-gray-300">/</span>
          <a href={`/${lang}/shop`} className="hover:text-[#402F75] transition-colors">{t("details.breadcrumb.shop")}</a>
          {product.categoryId && (
            <>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600 capitalize">{product.categoryId}</span>
            </>
          )}
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-white/80 backdrop-blur-xl rounded-[28px] border border-white shadow-[0_20px_60px_-20px_rgba(64,47,117,0.25)] overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left — image gallery */}
            <div className="lg:col-span-7 relative bg-gradient-to-br from-[#F8F6FF] via-white to-[#FFF8E5] p-6 sm:p-10">
              {/* Floating top-left badges */}
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                {product.isSuperDeal && (
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-red-300/40"
                  >
                    <FlameIcon className="w-3.5 h-3.5" />{t("details.badges.superDeal")}
                  </motion.span>
                )}
                {product.isLimitedStock && (
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-orange-300/40"
                  >
                    <HourglassIcon className="w-3.5 h-3.5" />{t("details.badges.limited")}
                  </motion.span>
                )}
                {hasDiscount && discountPercent > 0 && (
                  <motion.span
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-1 text-sm font-extrabold text-white bg-gradient-to-br from-[#402F75] to-purple-600 px-3 py-2 rounded-2xl uppercase tracking-wider shadow-lg shadow-purple-300/40"
                  >
                    -{discountPercent}%
                  </motion.span>
                )}
              </div>

              {/* Floating top-right actions */}
              <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={handleShare}
                    className="w-11 h-11 rounded-full backdrop-blur-md bg-white/80 border border-white shadow-lg shadow-purple-200/40 flex items-center justify-center hover:bg-white hover:scale-105 transition-all"
                    aria-label="Share product"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                        {t("details.share.copied")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  onClick={handleToggleFavourite}
                  animate={favBounce ? { scale: [1, 1.4, 0.85, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`w-11 h-11 rounded-full backdrop-blur-md border shadow-lg flex items-center justify-center transition-all hover:scale-105 ${
                    isFav
                      ? "border-[#FBBB14] bg-yellow-50/90 shadow-yellow-200/50"
                      : "border-white bg-white/80 shadow-purple-200/40 hover:bg-white"
                  }`}
                  aria-label="Add to wishlist"
                >
                  <motion.svg
                    width="17" height="17" viewBox="0 0 24 24"
                    fill={isFav ? "#FBBB14" : "none"}
                    stroke={isFav ? "#FBBB14" : "#402F75"}
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </motion.svg>
                </motion.button>
              </div>

              <div className="lg:sticky lg:top-24">
                <ProductDetailImage images={images} />
              </div>
            </div>

            {/* Right — product info */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col gap-6">
              {/* Brand + category */}
              <div className="flex flex-wrap items-center gap-2">
                {product.brandName && (
                  <span className="inline-flex items-center text-[11px] font-bold text-gray-900 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {product.brandName}
                  </span>
                )}
                {product.categoryId && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-[#402F75] bg-[#F3F0FF] border border-[#402F75]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {product.categoryId}
                  </span>
                )}
                {product.isRefurbished && (
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {t("details.badges.refurbished")}{product.refurbGrade ? ` · ${product.refurbGrade}` : ""}
                  </span>
                )}
                {product.expressDelivery && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    <BoltIcon className="w-3.5 h-3.5" />{t("details.badges.express")}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                {product.title}
              </h1>

              {/* Rating + stock */}
              <div className="flex items-center gap-4 flex-wrap">
                <StarRating rating={Number(product.averageRating ?? 0)} count={product.totalReviews ?? 0} />
                <span className="w-px h-4 bg-gray-200" />
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${
                  inStock ? "bg-green-50" : isOutOfStock ? "bg-red-50" : "bg-amber-50"
                }`}>
                  <span className={`relative flex w-2 h-2`}>
                    {inStock && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    )}
                    <span className={`relative inline-flex rounded-full w-2 h-2 ${
                      inStock ? "bg-green-500" : isOutOfStock ? "bg-red-500" : "bg-amber-500"
                    }`} />
                  </span>
                  <span className={`text-[12px] font-bold ${
                    inStock ? "text-green-700" : isOutOfStock ? "text-red-700" : "text-amber-700"
                  }`}>
                    {humanize(product.availabilityStatus || "UNKNOWN")}
                  </span>
                </div>
                {product.sku && (
                  <span className="text-[11px] text-gray-500">
                    SKU <span className="font-mono font-semibold text-gray-700">{product.sku}</span>
                  </span>
                )}
              </div>

              {unavailableInCountry && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertIcon className="w-4 h-4 flex-shrink-0" />
                  <span>{t("details.unavailableNotice")}</span>
                </div>
              )}

              {/* Price card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#402F75] to-purple-700 p-5 shadow-xl shadow-purple-300/30 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#FBBB14]/20 blur-2xl" />
                <div className="absolute -left-6 -bottom-6 w-32 h-32 rounded-full bg-pink-400/20 blur-2xl" />
                <div className="relative flex items-end gap-3 flex-wrap">
                  <span className="text-[40px] font-black text-white leading-none tracking-tight">
                    {formatPrice(totalPrice, product.currency)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-white/50 line-through font-medium mb-1">
                      {formatPrice(originalTotalPrice, product.currency)}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <div className="relative mt-2 flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center bg-[#FBBB14] text-gray-900 text-xs font-bold px-2.5 py-1 rounded-full">
                      {t("details.price.save")} {formatPrice(savings, product.currency)}
                      {discountPercent > 0 ? ` (${discountPercent}%)` : ""}
                    </span>
                    {additionalPrice > 0 && (
                      <span className="text-xs text-white/80 font-semibold">
                        +{formatPrice(additionalPrice, product.currency)} {t("details.price.forOptions")}
                      </span>
                    )}
                  </div>
                )}
                {!hasDiscount && additionalPrice > 0 && (
                  <span className="relative text-xs text-white/80 font-semibold mt-2 block">
                    +{formatPrice(additionalPrice, product.currency)} {t("details.price.forOptions")}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-[14px] leading-relaxed">{product.description}</p>

              {/* Color selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{t("details.color")}</span>
                    {selectedColor && (
                      <span className="text-sm text-[#402F75] font-semibold capitalize">{selectedColor}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((color) => {
                      const isSelected = color === selectedColor;
                      return (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`relative group transition-all ${isSelected ? "scale-110" : "hover:scale-105"}`}
                          title={color}
                        >
                          <span
                            className={`block w-10 h-10 rounded-full border-2 shadow-md transition-all ${
                              isSelected ? "border-[#402F75] shadow-purple-300/50" : "border-white shadow-gray-200"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                          {isSelected && (
                            <motion.span
                              layoutId="color-check"
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.5))" }}>
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </motion.span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Spec selectors */}
              {product.specs.length > 0 && (
                <div className="flex flex-col gap-5">
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

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={purchaseDisabled}
                  className={`group relative w-full py-4 rounded-2xl font-bold text-[15px] transition-all overflow-hidden ${
                    purchaseDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#FBBB14] to-amber-400 text-gray-900 hover:shadow-xl hover:shadow-yellow-300/50 active:scale-[0.98] cursor-pointer"
                  }`}
                >
                  {!purchaseDisabled && (
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                  )}
                  <span className="relative flex items-center justify-center gap-2">
                    {!purchaseDisabled && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    )}
                    {isOutOfStock ? t("details.actions.outOfStock") : unavailableInCountry ? t("details.actions.unavailableInCountry") : t("details.actions.buyNow")}
                  </span>
                </button>

                <motion.button
                  onClick={handleAddToCart}
                  disabled={purchaseDisabled}
                  animate={added
                    ? { scale: [1, 0.93, 1.03, 1], transition: { duration: 0.35 } }
                    : { scale: 1 }}
                  className={`w-full py-4 rounded-2xl border-2 font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 ${
                    purchaseDisabled
                      ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                      : added
                        ? "border-green-500 bg-green-500 text-white shadow-lg shadow-green-300/40"
                        : "border-[#402F75] bg-white text-[#402F75] hover:bg-[#402F75] hover:text-white hover:shadow-lg hover:shadow-purple-300/40"
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
                        {t("details.actions.addedToCart")}
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
                        {t("details.actions.addToCart")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Trust signals */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                {[
                  { icon: <LockIcon className="w-5 h-5 text-[#402F75]" />, title: t("details.trust.secure"), sub: t("details.trust.checkout") },
                  {
                    icon: <ReturnIcon className="w-5 h-5 text-[#402F75]" />,
                    title: returnWindowDays != null
                      ? t("details.trust.dayCount", { days: returnWindowDays })
                      : t("details.trust.thirtyDay"),
                    sub: t("details.trust.returns"),
                  },
                  { icon: <CheckIcon className="w-5 h-5 text-[#402F75]" />, title: t("details.trust.oneYear"), sub: t("details.trust.warranty") },
                ].map(({ icon, title, sub }) => (
                  <div key={title} className="flex flex-col items-center gap-0.5 rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 text-center">
                    {icon}
                    <span className="text-[11px] font-bold text-gray-900">{title}</span>
                    <span className="text-[10px] text-gray-500">{sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section: Product Information + Features */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Info table */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#402F75] to-purple-600 flex items-center justify-center shadow-lg shadow-purple-300/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t("details.info.title")}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {infoRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-3 ${i < infoRows.length - 1 ? "border-b border-dashed border-gray-100" : ""}`}
                >
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">{row.label}</span>
                  <span className="text-sm font-bold text-gray-900 truncate ml-3">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Features card */}
          <div className="bg-gradient-to-br from-[#402F75] to-purple-700 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-300/30 text-white relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FBBB14]/20 blur-2xl" />
            <div className="relative">
              <h3 className="text-lg font-bold mb-4">{t("details.whyBuy")}</h3>
              <ProductFeaturesBadges freeDelivery={product.freeDelivery} deliveryFee={product.deliveryFee} currency={product.currency} />
            </div>
          </div>
        </motion.section>

        {/* Store options */}
        {product.storeOptions && product.storeOptions.length > 1 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-300/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l1-5h16l1 5M3 9v11a1 1 0 001 1h16a1 1 0 001-1V9M3 9h18" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t("details.stores.title")}</h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.storeOptions.map((store) => (
                <div
                  key={store.storeId}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#402F75]/30 hover:shadow-lg hover:shadow-purple-200/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t("details.stores.store")}</span>
                    {store.expressDelivery && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full"><BoltIcon className="w-3 h-3" />{t("details.badges.express")}</span>
                    )}
                  </div>
                  <span className="block text-xs font-mono text-gray-600 truncate mb-3">{store.storeId}</span>
                  <span className="text-xl font-extrabold bg-gradient-to-r from-[#402F75] to-purple-600 bg-clip-text text-transparent">
                    {formatPrice(store.storePrice, store.currency)}
                  </span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Technical specs */}
        {product.specs.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="mt-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-300/40">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="8" width="20" height="8" rx="1" />
                  <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t("details.specs.title")}</h2>
              <div className="flex-1 h-px bg-gray-100" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.specs.map((spec) => {
                const selected = spec.options.find((o) => o.id === selectedOptions[spec.id]);
                return (
                  <div
                    key={spec.id}
                    className="group relative flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-[#402F75]/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-200/30 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E1FF] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="8" width="20" height="8" rx="1" />
                        <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{spec.name}</span>
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {selected ? `${selected.value} ${selected.unit}` : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <ProductReviews productId={product.id} />
        </motion.section>

        {/* Q&A */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="mt-10"
        >
          <ProductQA productId={product.id} />
        </motion.section>
      </div>
    </div>
  );
}
