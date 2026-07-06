"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import MacPro13 from "@/assets/devices/macPro13.png";
import RamIcon from "@/assets/icons/ram.png";
import StorageIcon from "@/assets/icons/storage.png";
import ProccessorIcon from "@/assets/icons/proccessor.png";
import StarIcon from "@/assets/icons/star.png";
import { HourglassIcon } from "@/shared/icons";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import { addQuoteItem, B2B_MIN_QTY_PER_LINE } from "@/features/b2b/services/quote.api";

export interface B2BProductCardProps {
  view?: "grid" | "list";
  slug: string;
  /** Store-product id — the line key the B2B quote/cart API needs. */
  storeProductId?: string;
  title?: string;
  description?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  imageUrl?: string;
  rating?: number;
  availabilityStatus?: string;
  stockQuantity?: number | null;
  /** true iff the current user is an ACTIVE B2B member (gates add-to-B2B-cart). */
  isActiveMember: boolean;
  /** Still resolving membership → show a neutral loading action. */
  membershipLoading: boolean;
}

export default function B2BProductCard({
  view = "grid",
  slug,
  storeProductId,
  title = "",
  description,
  processor = "",
  ram = "",
  storage = "",
  imageUrl,
  rating = 0,
  availabilityStatus,
  stockQuantity,
  isActiveMember,
  membershipLoading,
}: B2BProductCardProps) {
  const isList = view === "list";
  const lowStock = typeof stockQuantity === "number" && stockQuantity > 0 && stockQuantity < 5;

  const router = useRouter();
  const params = useParams();
  const lang = (params?.lang as Lang) ?? "en";
  const { t } = useTranslation("b2b");

  // B2B detail lives under the b2b section, mirroring the consumer shop/[slug] route.
  const b2bSlug = PATH_SLUGS.b2b[lang] ?? "b2b";
  const href = `/${lang}/${b2bSlug}/products/${slug}`;
  const applyHref = `/${lang}/${b2bSlug}/apply`;

  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddToB2bCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isActiveMember || adding) return;
    // The B2B browse listing may omit the store-product id (the RFQ line key).
    // When it's absent, send the member to the product detail page to add from
    // there (where a concrete store-product is resolved).
    if (!storeProductId) {
      router.push(href);
      return;
    }
    setAdding(true);
    setError(null);
    try {
      // Every B2B line starts at the enforced minimum quantity (5). The member
      // adjusts quantities in the B2B cart.
      await addQuoteItem({ storeProductId, quantity: B2B_MIN_QTY_PER_LINE });
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    } catch {
      setError(t("browse.card.addError", { defaultValue: "Couldn't add to B2B cart. Please try again." }));
      setTimeout(() => setError(null), 4000);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div
      onClick={() => router.push(href)}
      onMouseEnter={() => router.prefetch(href)}
      className={`group relative bg-white rounded-[24px] w-full border border-gray-100 cursor-pointer transition-all duration-300 hover:border-transparent hover:shadow-[0_22px_55px_-22px_rgba(64,47,117,0.45)] hover:-translate-y-1${
        isList ? " flex flex-row gap-[16px] xl:gap-[20px] p-[12px] xl:p-[14px]" : " h-full flex flex-col p-[12px] xl:p-[14px]"
      }`}
    >
      {/* ── Image container ── */}
      <div
        className={`relative overflow-hidden rounded-[18px] bg-gradient-to-br from-[#F4F1FF] via-white to-[#FFF7E8] flex items-center justify-center${
          isList
            ? " w-[160px] sm:w-[200px] xl:w-[240px] flex-shrink-0 self-stretch min-h-[170px]"
            : " h-[200px] xl:h-[220px] 2xl:h-[240px] mb-[14px] xl:mb-[16px]"
        }`}
      >
        {/* B2B badge (top-left) */}
        <span className="absolute top-[10px] left-[10px] z-20 inline-flex items-center gap-[4px] bg-[#402F75] text-white text-[10px] font-bold px-[9px] py-[4px] rounded-full leading-none shadow-[0_4px_12px_-2px_rgba(64,47,117,0.5)]">
          {t("browse.card.badge", { defaultValue: "Wholesale" })}
        </span>
        {(availabilityStatus === "LOW_STOCK" || lowStock) && (
          <span className="absolute top-[10px] right-[10px] z-20 inline-flex items-center gap-[4px] bg-orange-500 text-white text-[10px] font-bold px-[9px] py-[4px] rounded-full leading-none shadow-[0_4px_12px_-2px_rgba(249,115,22,0.55)]">
            <HourglassIcon className="w-3 h-3" />
            {lowStock
              ? t("browse.card.onlyLeft", { defaultValue: "Only {{count}} left", count: stockQuantity ?? 0 })
              : t("browse.card.limitedStock", { defaultValue: "Limited Stock" })}
          </span>
        )}
        <Image
          src={imageUrl ?? MacPro13}
          alt={title}
          width={200}
          height={180}
          unoptimized={!!imageUrl}
          className="object-contain max-h-[86%] xl:max-h-[88%] w-auto relative z-10 transition-transform duration-500 ease-out group-hover:scale-[1.07]"
        />
      </div>

      {/* ── Details ── */}
      <div className={`flex flex-col${isList ? " flex-1 justify-between py-[2px] min-w-0" : " gap-[10px] xl:gap-[12px] flex-1 min-h-0"}`}>
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-[8px]">
          <h2 className="font-bold text-[16px] xl:text-[18px] leading-snug text-gray-900 line-clamp-2 group-hover:text-[#402F75] transition-colors duration-200">
            {title}
          </h2>
          {rating > 0 && (
            <div className="flex items-center gap-[3px] flex-shrink-0 bg-[#FFF7E0] rounded-full px-[8px] py-[3px]">
              <Image src={StarIcon} alt="star" width={12} height={12} />
              <span className="text-[12px] font-bold text-[#402F75]">{rating}</span>
            </div>
          )}
        </div>

        {/* Short description */}
        {description && (
          <p className="text-[12px] xl:text-[13px] text-gray-500 leading-snug line-clamp-2">
            {description.length > 90 ? `${description.slice(0, 90).trimEnd()}...` : description}
          </p>
        )}

        {/* Specs */}
        <div className={`grid gap-[6px]${isList ? " grid-cols-3" : " grid-cols-2"}`}>
          {processor && (
            <div className="flex items-center gap-[5px] bg-gray-50 rounded-[10px] px-[8px] py-[6px] xl:px-[10px]">
              <Image src={ProccessorIcon} alt="Processor" width={13} height={13} className="flex-shrink-0 opacity-60" />
              <span className="text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">{processor}</span>
            </div>
          )}
          {ram && (
            <div className="flex items-center gap-[5px] bg-gray-50 rounded-[10px] px-[8px] py-[6px] xl:px-[10px]">
              <Image src={RamIcon} alt="RAM" width={13} height={13} className="flex-shrink-0 opacity-60" />
              <span className="text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">{ram}</span>
            </div>
          )}
          {storage && (
            <div className={`flex items-center gap-[5px] bg-gray-50 rounded-[10px] px-[8px] py-[6px] xl:px-[10px]${isList ? "" : " col-span-2"}`}>
              <Image src={StorageIcon} alt="Storage" width={13} height={13} className="flex-shrink-0 opacity-60" />
              <span className="text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">{storage}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={`h-px bg-gray-100${isList ? "" : " mt-auto"}`} />

        {/* Quote label + Action */}
        <div className="flex items-end justify-between gap-[8px]">
          {/* "Request a Quote" replaces the buyable price on the B2B channel. */}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">
              {t("browse.card.pricing", { defaultValue: "Bulk pricing" })}
            </span>
            <span className="text-[15px] xl:text-[17px] text-[#402F75] font-extrabold leading-tight">
              {t("browse.card.requestQuote", { defaultValue: "Request a Quote" })}
            </span>
          </div>

          <div className="flex flex-col items-end gap-[6px]">
            {membershipLoading ? (
              <span className="inline-flex items-center py-[9px] px-[14px] rounded-full text-[12px] font-bold bg-gray-100 text-gray-400">
                …
              </span>
            ) : isActiveMember ? (
              <motion.button
                onClick={handleAddToB2bCart}
                disabled={adding}
                animate={added ? { scale: [1, 0.88, 1.06, 1], transition: { duration: 0.35, ease: "easeOut" } } : { scale: 1 }}
                className={`flex items-center gap-[5px] py-[9px] px-[14px] rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-300 active:scale-95 ${
                  added
                    ? "bg-green-500 text-white cursor-pointer shadow-[0_6px_16px_-4px_rgba(34,197,94,0.6)]"
                    : "bg-[#402F75] text-white hover:bg-[#352566] cursor-pointer shadow-[0_6px_16px_-4px_rgba(64,47,117,0.6)]"
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {added ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-[5px]"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {t("browse.card.added", { defaultValue: "Added!" })}
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-[5px]"
                    >
                      {t("browse.card.addToCart", { defaultValue: "Add to B2B cart" })}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(applyHref);
                }}
                className="flex items-center gap-[5px] py-[9px] px-[14px] rounded-full text-[12px] font-bold whitespace-nowrap bg-[#FBBB14] text-white hover:bg-[#f0b000] cursor-pointer shadow-[0_6px_16px_-4px_rgba(251,187,20,0.6)] transition-all duration-300 active:scale-95"
              >
                {t("browse.card.applyToOrder", { defaultValue: "Apply for B2B membership" })}
              </button>
            )}
            {error && <span className="text-[11px] text-red-500 font-medium max-w-[160px] text-right">{error}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
