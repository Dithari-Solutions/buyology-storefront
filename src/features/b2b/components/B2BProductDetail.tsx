"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import ProductDetailImage from "@/features/product/components/ProductDetailImage";
import { selectSelectedCountryCode, selectPreferredCurrency } from "@/features/country/store/countrySlice";
import { getB2bProductBySlug, type ApiProduct } from "@/features/product/services/productService";
import { getImageUrl } from "@/shared/utils/imageUrl";
import { addQuoteItem, B2B_MIN_QTY_PER_LINE } from "@/features/b2b/services/quote.api";
import { useB2bMembership } from "@/features/b2b/hooks/useB2bMembership";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";

interface B2BProductDetailProps {
  product: ApiProduct;
  images: string[];
  slug: string;
}

function humanize(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function B2BProductDetail({ product: initialProduct, images: initialImages, slug }: B2BProductDetailProps) {
  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const { t } = useTranslation("b2b");
  const { t: tp } = useTranslation("product");

  const countryCode = useSelector(selectSelectedCountryCode);
  const currency = useSelector(selectPreferredCurrency);

  const b2bSlug = PATH_SLUGS.b2b[lang] ?? "b2b";
  const cartHref = `/${lang}/${b2bSlug}/cart`;
  const applyHref = `/${lang}/${b2bSlug}/apply`;
  const browseHref = `/${lang}/${b2bSlug}/products`;

  const { isActiveMember, loading: membershipLoading } = useB2bMembership();

  const [product, setProduct] = useState<ApiProduct>(initialProduct);
  const [images, setImages] = useState<string[]>(initialImages);

  // Re-fetch country-scoped so the resolved store-product id matches the visitor's region.
  useEffect(() => {
    let cancelled = false;
    if (!countryCode) return;
    (async () => {
      try {
        const fresh = await getB2bProductBySlug(slug, { lang, countryCode, currency });
        if (cancelled) return;
        setProduct(fresh);
        const sorted = [...fresh.media].sort((a, b) => a.orderIndex - b.orderIndex);
        setImages(sorted.map((m) => getImageUrl(m.url)));
      } catch {
        // keep the server-rendered product on failure
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug, lang, countryCode, currency]);

  const [quantity, setQuantity] = useState<number>(B2B_MIN_QTY_PER_LINE);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const belowMin = quantity < B2B_MIN_QTY_PER_LINE;

  const infoRows = useMemo(() => {
    return [
      product.brandName ? { label: tp("details.info.brand"), value: product.brandName } : null,
      product.productType ? { label: tp("details.info.type"), value: humanize(product.productType) } : null,
      product.sku ? { label: tp("details.info.sku"), value: product.sku } : null,
      product.availabilityStatus
        ? { label: tp("details.info.availability"), value: humanize(product.availabilityStatus) }
        : null,
      product.isRefurbished
        ? {
            label: tp("details.info.condition"),
            value: product.refurbGrade
              ? tp("details.info.refurbishedGrade", { grade: product.refurbGrade })
              : tp("details.info.refurbished"),
          }
        : { label: tp("details.info.condition"), value: tp("details.info.new") },
    ].filter((row): row is { label: string; value: string } => row !== null);
  }, [product, tp]);

  function clampQuantity(next: number) {
    if (Number.isNaN(next)) return B2B_MIN_QTY_PER_LINE;
    return Math.max(B2B_MIN_QTY_PER_LINE, Math.floor(next));
  }

  async function handleAddToB2bCart() {
    if (!isActiveMember || adding) return;
    if (!product.storeProductId) {
      setError(t("detail.noStoreProduct", { defaultValue: "This product isn't available for quoting in your region." }));
      setTimeout(() => setError(null), 4000);
      return;
    }
    const qty = clampQuantity(quantity);
    setAdding(true);
    setError(null);
    try {
      await addQuoteItem({ storeProductId: product.storeProductId, quantity: qty });
      setAdded(true);
      setTimeout(() => setAdded(false), 2200);
    } catch {
      setError(t("detail.addError", { defaultValue: "Couldn't add to B2B cart. Please try again." }));
      setTimeout(() => setError(null), 4000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="relative">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-24 w-[500px] h-[500px] rounded-full bg-[#402F75]/10 blur-3xl" />
        <div className="absolute -top-20 right-0 w-[400px] h-[400px] rounded-full bg-[#FBBB14]/15 blur-3xl" />
      </div>

      <div className="w-[99%] max-w-[1900px] mx-auto px-3 sm:px-5 lg:px-6 pt-6 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href={`/${lang}`} className="hover:text-[#402F75] transition-colors">
            {tp("details.breadcrumb.home")}
          </Link>
          <span className="text-gray-300">/</span>
          <Link href={`/${lang}/${b2bSlug}`} className="hover:text-[#402F75] transition-colors">
            {t("badge", { defaultValue: "B2B Wholesale" })}
          </Link>
          <span className="text-gray-300">/</span>
          <Link href={browseHref} className="hover:text-[#402F75] transition-colors">
            {t("browse.title", { defaultValue: "B2B Catalog" })}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold truncate max-w-[200px]">{product.title}</span>
        </nav>

        {/* Hero card */}
        <div className="relative bg-white/80 backdrop-blur-xl rounded-[28px] border border-white shadow-[0_20px_60px_-20px_rgba(64,47,117,0.25)] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left — image gallery */}
            <div className="lg:col-span-7 relative bg-gradient-to-br from-[#F8F6FF] via-white to-[#FFF8E5] p-6 sm:p-10">
              <span className="absolute top-6 left-6 z-10 inline-flex items-center gap-[4px] bg-[#402F75] text-white text-[11px] font-bold px-[11px] py-[5px] rounded-full leading-none shadow-[0_4px_12px_-2px_rgba(64,47,117,0.5)]">
                {t("browse.card.badge", { defaultValue: "Wholesale" })}
              </span>
              <div className="lg:sticky lg:top-24 w-full max-w-[800px] xl:max-w-[940px] mx-auto">
                <ProductDetailImage images={images} />
              </div>
            </div>

            {/* Right — product info */}
            <div className="lg:col-span-5 p-6 sm:p-10 xl:p-12 flex flex-col gap-6 w-full xl:max-w-[680px]">
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
                    {tp("details.badges.refurbished")}
                    {product.refurbGrade ? ` · ${product.refurbGrade}` : ""}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
                {product.title}
              </h1>

              {/* Rating + SKU */}
              <div className="flex items-center gap-4 flex-wrap">
                {Number(product.averageRating ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 bg-[#FFF7E0] rounded-full px-2.5 py-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FBBB14">
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                    <span className="text-[12px] font-bold text-[#402F75]">
                      {Number(product.averageRating ?? 0).toFixed(1)}
                    </span>
                    {product.totalReviews != null && (
                      <span className="text-[11px] text-gray-500">({product.totalReviews})</span>
                    )}
                  </div>
                )}
                {product.sku && (
                  <span className="text-[11px] text-gray-500">
                    SKU <span className="font-mono font-semibold text-gray-700">{product.sku}</span>
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-gray-600 text-[14px] leading-relaxed">{product.description}</p>
              )}

              {/* Request a Quote panel (replaces the buyable price) */}
              <div className="relative rounded-2xl bg-gradient-to-br from-[#402F75] to-purple-700 p-6 shadow-xl shadow-purple-300/30 overflow-hidden">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-[#FBBB14]/20 blur-2xl" />
                <div className="relative">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
                    {t("browse.card.pricing", { defaultValue: "Bulk pricing" })}
                  </span>
                  <p className="text-[26px] font-black text-white leading-tight mt-1">
                    {t("browse.card.requestQuote", { defaultValue: "Request a Quote" })}
                  </p>
                  <p className="text-[13px] text-white/80 mt-2 leading-relaxed">
                    {t("detail.quotePanel.body", {
                      defaultValue:
                        "No instant price — our procurement team prices your bulk order. Add this product to your B2B cart and request a quote.",
                    })}
                  </p>
                </div>
              </div>

              {/* Quantity + Add to B2B cart / membership gate */}
              {membershipLoading ? (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-6 text-center text-[13px] text-gray-400">
                  {t("detail.checkingMembership", { defaultValue: "Checking your B2B membership…" })}
                </div>
              ) : isActiveMember ? (
                <div className="flex flex-col gap-4">
                  {/* Quantity input */}
                  <div className="flex flex-col gap-2">
                    <label htmlFor="b2b-qty" className="text-sm font-bold text-gray-900">
                      {t("detail.quantity", { defaultValue: "Quantity" })}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center rounded-xl border-2 border-gray-200 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => clampQuantity(q - 1))}
                          className="w-11 h-11 flex items-center justify-center text-[#402F75] text-xl font-bold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={quantity <= B2B_MIN_QTY_PER_LINE}
                          aria-label={t("detail.decrease", { defaultValue: "Decrease quantity" })}
                        >
                          −
                        </button>
                        <input
                          id="b2b-qty"
                          type="number"
                          min={B2B_MIN_QTY_PER_LINE}
                          value={quantity}
                          onChange={(e) => setQuantity(clampQuantity(Number(e.target.value)))}
                          onBlur={() => setQuantity((q) => clampQuantity(q))}
                          className="w-16 h-11 text-center text-[15px] font-bold text-gray-900 outline-none border-x-2 border-gray-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => clampQuantity(q + 1))}
                          className="w-11 h-11 flex items-center justify-center text-[#402F75] text-xl font-bold hover:bg-gray-50"
                          aria-label={t("detail.increase", { defaultValue: "Increase quantity" })}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-[12px] text-gray-500 leading-snug">
                        {t("detail.minHelper", {
                          defaultValue: "Minimum {{min}} units per line for B2B orders.",
                          min: B2B_MIN_QTY_PER_LINE,
                        })}
                      </span>
                    </div>
                    {belowMin && (
                      <p className="text-[12px] font-medium text-orange-600">
                        {t("detail.belowMin", {
                          defaultValue: "The B2B minimum is {{min}} units per line.",
                          min: B2B_MIN_QTY_PER_LINE,
                        })}
                      </p>
                    )}
                  </div>

                  {/* Primary action */}
                  <motion.button
                    onClick={handleAddToB2bCart}
                    disabled={adding || belowMin}
                    animate={added ? { scale: [1, 0.95, 1.03, 1], transition: { duration: 0.35 } } : { scale: 1 }}
                    className={`w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 flex items-center justify-center gap-2 ${
                      belowMin
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : added
                        ? "bg-green-500 text-white shadow-lg shadow-green-300/40"
                        : "bg-[#402F75] text-white hover:bg-[#352566] hover:shadow-lg hover:shadow-purple-300/40 active:scale-[0.98] cursor-pointer"
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
                          {t("detail.added", { defaultValue: "Added to B2B cart" })}
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
                          {adding
                            ? t("detail.adding", { defaultValue: "Adding…" })
                            : t("browse.card.addToCart", { defaultValue: "Add to B2B cart" })}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                  {/* Toast / link to cart after adding */}
                  <AnimatePresence>
                    {added && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                      >
                        <span className="text-[13px] font-semibold text-green-700">
                          {t("detail.addedToast", { defaultValue: "Added to your B2B cart." })}
                        </span>
                        <Link
                          href={cartHref}
                          className="whitespace-nowrap text-[13px] font-bold text-[#402F75] hover:underline"
                        >
                          {t("detail.viewCart", { defaultValue: "View B2B cart" })}
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {error && <p className="text-[12px] font-medium text-red-500">{error}</p>}

                  <Link
                    href={cartHref}
                    className="self-start text-[13px] font-semibold text-[#402F75] hover:underline"
                  >
                    {t("detail.goToCart", { defaultValue: "Go to B2B cart" })}
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-[#FBBB14]/40 bg-[#FFF9EC] px-5 py-5">
                  <p className="text-[14px] font-bold text-[#402F75]">
                    {t("detail.memberGate.title", { defaultValue: "Ordering is for B2B members" })}
                  </p>
                  <p className="text-[12.5px] text-gray-600 mt-1 leading-relaxed">
                    {t("detail.memberGate.subtitle", {
                      defaultValue:
                        "Apply for a free B2B membership to add products to your quote cart and order in bulk.",
                    })}
                  </p>
                  <button
                    onClick={() => router.push(applyHref)}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FBBB14] text-white text-[13px] font-bold px-[18px] py-[10px] hover:bg-[#f0b000] transition-colors cursor-pointer"
                  >
                    {t("detail.memberGate.cta", { defaultValue: "Apply for B2B membership" })}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product information */}
        {infoRows.length > 0 && (
          <section className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{tp("details.info.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
              {infoRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between py-3 ${
                    i < infoRows.length - 1 ? "border-b border-dashed border-gray-100" : ""
                  }`}
                >
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-400">{row.label}</span>
                  <span className="text-sm font-bold text-gray-900 truncate ml-3">{row.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical specs */}
        {product.specs.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{tp("details.specs.title")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.specs.map((spec) => {
                const opt = spec.options[0];
                return (
                  <div
                    key={spec.id}
                    className="group relative flex items-center gap-4 bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:border-[#402F75]/30 transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F3F0FF] to-[#E8E1FF] flex items-center justify-center flex-shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#402F75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="8" width="20" height="8" rx="1" />
                        <path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2" />
                      </svg>
                    </div>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{spec.name}</span>
                      <span className="text-sm font-bold text-gray-900 truncate">
                        {opt ? (opt.unit ? `${opt.value} ${opt.unit}` : opt.value) : "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
