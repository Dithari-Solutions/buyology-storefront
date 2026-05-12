"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import type { AppDispatch, RootState } from "@/store";
import RamIcon from "@/assets/icons/ram.png";
import CartIcon from "@/assets/icons/cart.png";
import StarIcon from "@/assets/icons/star.png";
import StorageIcon from "@/assets/icons/storage.png";
import MacPro13 from "@/assets/devices/macPro13.png";
import { useRouter, useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { addToCartThunk, clearCart, clearCartThunk } from "@/features/cart/store/cartSlice";
import { useId, useState, useEffect, useRef } from "react";
import { PATH_SLUGS, type Lang } from "@/config/pathSlugs";
import ProccessorIcon from "@/assets/icons/proccessor.png";
import AlertModal from "@/shared/components/AlertModal";
import { addToFavouritesThunk, removeFromFavouritesThunk, selectIsFavourite } from "@/features/favourites/store/favouritesSlice";
import LoginPromptModal from "@/features/auth/components/LoginPromptModal";

interface ProductCardProps {
  view?: 'grid' | 'list';
  slugs: Record<Lang, string>;
  productId?: string;
  /** Required by the cart API — the store this product is purchased from */
  storeId?: string;
  title?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  currency?: string;
  rating?: number;
  inStock?: boolean;
  category?: string;
  processor?: string;
  ram?: string;
  storage?: string;
  imageUrl?: string;
  expressDelivery?: boolean | null;
  storeOptions?: Array<{
    storeId: string;
    storePrice: number;
    currency: string;
    expressDelivery: boolean | null;
  }> | null;
  /** null = no country context; false = not in user's country (browse only) */
  availableInSelectedCountry?: boolean | null;
}

function formatPrice(amount: number, currency: string): string {
  if (!amount && amount !== 0) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

interface FlyCard {
  id: number;
  left: number;
  top: number;
  width: number;
  height: number;
  endX: number;
  endY: number;
}

export default function ProductCard({
  view = 'grid',
  slugs,
  productId = "",
  storeId,
  title = "",
  description,
  price = 0,
  originalPrice = 0,
  discount = 0,
  currency = 'USD',
  rating = 0,
  inStock = true,
  category = "",
  processor = "",
  ram = "",
  storage = "",
  imageUrl,
  expressDelivery,
  storeOptions,
  availableInSelectedCountry,
}: ProductCardProps) {
  const id = useId();
  const clipId = `productImageClip-${id.replace(/[^a-zA-Z0-9-]/g, "")}`;
  const isList = view === 'list';

  const router = useRouter();
  const params = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const lang = (params?.lang as Lang) ?? "en";
  const isFav = useSelector((state: RootState) => selectIsFavourite(productId)(state));
  const userId = useSelector((state: RootState) => state.auth.userId);
  const href = `/${lang}/${PATH_SLUGS.shop[lang] ?? "shop"}/${slugs[lang] ?? slugs.en}`;

  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [added, setAdded] = useState(false);
  const [particles, setParticles] = useState<number[]>([]);
  const [flyCards, setFlyCards] = useState<FlyCard[]>([]);
  const [favBounce, setFavBounce] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [crossCountryError, setCrossCountryError] = useState<string | null>(null);
  const [addToCartError, setAddToCartError] = useState<string | null>(null);
  const [pendingStoreId, setPendingStoreId] = useState<string>("");
  const [selectedStoreId, setSelectedStoreId] = useState<string | undefined>(storeId);

  useEffect(() => { setMounted(true); }, []);

  function handleToggleFavourite(e: React.MouseEvent) {
    e.stopPropagation();
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }

    if (isFav) {
      dispatch(removeFromFavouritesThunk({ userId, productId }));
    } else {
      dispatch(addToFavouritesThunk({
        userId,
        productId,
        meta: { id: productId, title, price, originalPrice, discount, rating, inStock, category, slugs, processor, ram, storage },
      }));
    }

    setFavBounce(true);
    setTimeout(() => setFavBounce(false), 400);

    // Only fly when adding (not removing)
    if (!isFav && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const favIconEl = document.querySelector('[data-fav-icon]');
      if (favIconEl) {
        const favRect = favIconEl.getBoundingClientRect();
        const card: FlyCard = {
          id: Date.now(),
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          endX: favRect.left + favRect.width / 2,
          endY: favRect.top + favRect.height / 2,
        };
        setFlyCards(prev => [...prev, card]);
        setTimeout(() => setFlyCards(prev => prev.filter(f => f.id !== card.id)), 850);
      }
    }
  }

  function buildDisplayMeta() {
    const activeStoreId = selectedStoreId ?? storeId;
    const selectedOption = storeOptions?.find((o) => o.storeId === activeStoreId);
    const isExpress = selectedOption
      ? selectedOption.expressDelivery === true
      : expressDelivery === true;
    return {
      productId,
      title,
      imageUrl: MacPro13.src,
      variant: { color: "Space Gray", storage: "1TB" },
      price,
      originalPrice,
      discountPercent: originalPrice > 0 ? Math.round((discount / originalPrice) * 100) : 0,
      quantity: 1,
      savedForLater: false,
      quickDelivery: isExpress,
    };
  }

  function triggerAddAnimations() {
    if (!added) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1600);
    }
    const pid = Date.now();
    setParticles(prev => [...prev, pid]);
    setTimeout(() => setParticles(prev => prev.filter(p => p !== pid)), 900);

    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const cartIconEl = document.querySelector('[data-cart-icon]');
      if (cartIconEl) {
        const cartRect = cartIconEl.getBoundingClientRect();
        const card: FlyCard = {
          id: Date.now() + 1,
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
          endX: cartRect.left + cartRect.width / 2,
          endY: cartRect.top + cartRect.height / 2,
        };
        setFlyCards(prev => [...prev, card]);
        setTimeout(() => setFlyCards(prev => prev.filter(f => f.id !== card.id)), 850);
      }
    }
  }

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation();
    if (!userId) {
      setShowLoginPrompt(true);
      return;
    }

    // Block purchase if product is not available in user's country
    if (availableInSelectedCountry === false) {
      return;
    }

    const resolvedStoreId = selectedStoreId ?? storeId ?? "";
    const tempId = `cart-${productId}-${Date.now()}`;

    const result = await dispatch(addToCartThunk({
      userId,
      payload: { storeId: resolvedStoreId, productId, quantity: 1 },
      displayMeta: buildDisplayMeta(),
      tempId,
    }));

    if (addToCartThunk.rejected.match(result)) {
      const payload = result.payload as { tempId: string; message?: string } | undefined;
      const msg = payload?.message ?? "";
      if (msg === "COUNTRY_RESTRICTION" || msg.toLowerCase().includes("country")) {
        setPendingStoreId(resolvedStoreId);
        setCrossCountryError(
          "You can only purchase products from stores in your selected country. Go to Profile → Country Settings to change your home country."
        );
      } else {
        setAddToCartError("Couldn't add to cart. Please try again.");
        setTimeout(() => setAddToCartError(null), 4000);
      }
      return;
    }

    triggerAddAnimations();
  }

  async function handleClearAndAdd() {
    if (!userId) return;
    dispatch(clearCart());
    await dispatch(clearCartThunk(userId));
    setCrossCountryError(null);

    const tempId = `cart-${productId}-${Date.now()}`;
    const result = await dispatch(addToCartThunk({
      userId,
      payload: { storeId: pendingStoreId, productId, quantity: 1 },
      displayMeta: buildDisplayMeta(),
      tempId,
    }));

    setPendingStoreId("");
    if (!addToCartThunk.rejected.match(result)) {
      triggerAddAnimations();
    }
  }

  const FavButton = ({ size }: { size: 'sm' | 'md' }) => (
    <motion.button
      onClick={handleToggleFavourite}
      animate={favBounce ? { scale: [1, 1.45, 0.85, 1.1, 1] } : { scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`cursor-pointer border rounded-full bg-white hover:shadow-md transition-shadow ${
        size === 'sm' ? "p-[7px]" : "p-[8px]"
      } ${isFav ? "border-[#FBBB14]" : "border-gray-200"}`}
    >
      <motion.svg
        width={size === 'sm' ? 18 : 20} height={size === 'sm' ? 18 : 20}
        viewBox="0 0 24 24"
        fill={isFav ? "#FBBB14" : "none"}
        stroke={isFav ? "#FBBB14" : "#9ca3af"}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        animate={isFav ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>
    </motion.button>
  );

  function handleGoToAuth(mode: "signin" | "register") {
    setShowLoginPrompt(false);
    router.push(`/${lang}/${PATH_SLUGS.auth[lang]}?mode=${mode}`);
  }

  return (
    <>
      {mounted && showLoginPrompt && (
        <LoginPromptModal
          onSignIn={() => handleGoToAuth("signin")}
          onCreateAccount={() => handleGoToAuth("register")}
          onClose={() => setShowLoginPrompt(false)}
        />
      )}

      {mounted && crossCountryError && createPortal(
        <div
          className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={() => setCrossCountryError(null)}
        >
          <div
            className="bg-white rounded-[28px] py-8 px-6 w-full max-w-sm shadow-2xl flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-5">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </div>
            <h2 className="font-bold text-[20px] text-gray-900 mb-2 text-center">Country Mismatch</h2>
            <p className="text-gray-500 text-[13px] text-center mb-6 leading-relaxed max-w-[260px]">
              {crossCountryError}
            </p>
            <div className="w-full flex flex-col gap-2">
              <button
                type="button"
                onClick={handleClearAndAdd}
                className="w-full py-[13px] rounded-[30px] bg-[#402F75] text-white font-bold text-[15px] cursor-pointer hover:bg-[#352566] active:scale-[0.98] transition-all duration-150"
              >
                Clear Cart &amp; Add Item
              </button>
              <button
                type="button"
                onClick={() => setCrossCountryError(null)}
                className="w-full py-[13px] rounded-[30px] border border-gray-200 text-gray-600 font-medium text-[15px] cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all duration-150"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <AlertModal
        open={Boolean(addToCartError)}
        onClose={() => setAddToCartError(null)}
        severity="error"
        message={addToCartError ?? ""}
      />

      {/* Portal: full card clone flies to the header fav icon */}
      {mounted && createPortal(
        <AnimatePresence>
          {flyCards.map(fc => {
            const cardCenterX = fc.left + fc.width / 2;
            const cardCenterY = fc.top + fc.height / 2;
            return (
              <motion.div
                key={fc.id}
                style={{
                  position: 'fixed',
                  left: fc.left,
                  top: fc.top,
                  width: fc.width,
                  height: fc.height,
                  zIndex: 99999,
                  pointerEvents: 'none',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(64,47,117,0.35)',
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: fc.endX - cardCenterX,
                  y: fc.endY - cardCenterY,
                  scale: 0.06,
                  opacity: 0,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.72, ease: [0.4, 0.0, 0.2, 1] }}
              >
                {/* Card ghost — matches the real card visually */}
                <div className="w-full h-full bg-white border border-[#FBBB14] p-[10px] flex flex-col gap-[10px]">
                  <div className="flex-1 bg-[#F6F4FF] rounded-[14px] flex items-center justify-center min-h-0 overflow-hidden">
                    <Image
                      src={imageUrl ?? MacPro13}
                      alt={title}
                      width={200}
                      height={160}
                      unoptimized={!!imageUrl}
                      className="object-contain max-h-full w-auto"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-[6px] flex-shrink-0">
                    <div>
                      <p className="font-bold text-[13px] text-gray-900 truncate max-w-[120px]">{title}</p>
                      <p className="text-[#402F75] font-bold text-[17px] leading-tight">{formatPrice(price, currency)}</p>
                    </div>
                    <div className="flex items-center gap-[3px] bg-[#F6F4FF] rounded-full px-[7px] py-[3px] flex-shrink-0">
                      <Image src={StarIcon} alt="star" width={11} height={11} />
                      <span className="text-[11px] font-bold text-[#402F75]">{rating}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>,
        document.body
      )}

      <div
        ref={cardRef}
        onClick={() => router.push(href)}
        className={`p-[10px] xl:p-[14px] bg-white rounded-[20px] w-full border border-[#FBBB14] cursor-pointer hover:shadow-md transition-shadow${isList ? ' flex flex-row gap-[16px] xl:gap-[24px]' : ''}`}
      >

        {/* ── Image container ── */}
        <div className={`relative overflow-hidden rounded-[20px] flex items-center justify-center${isList ? ' w-[180px] sm:w-[220px] xl:w-[260px] flex-shrink-0 min-h-[180px] xl:min-h-[200px]' : ' h-[200px] xl:h-[220px] 2xl:h-[240px] mb-[12px] xl:mb-[16px]'}`}>
          {isList ? (
            <div className="absolute inset-0 bg-[#F6F4FF]" />
          ) : (
            <>
              <svg width="0" height="0" className="absolute">
                <defs>
                  <clipPath id={clipId} clipPathUnits="objectBoundingBox">
                    <path d="M 0,0 L 0.74,0 C 0.82,0 0.82,0.10 0.82,0.10 L 0.82,0.16 C 0.82,0.28 0.91,0.28 0.91,0.28 L 0.95,0.28 C 1,0.28 1,0.40 1,0.40 L 1,1 L 0,1 Z" />
                  </clipPath>
                </defs>
              </svg>
              <div
                className="absolute inset-0 bg-[#F6F4FF]"
                style={{ clipPath: `url(#${clipId})` }}
              />
              {/* Grid-view fav button */}
              <div className="absolute top-[10px] right-[10px] z-10">
                <FavButton size="md" />
              </div>
            </>
          )}
          <Image
            src={imageUrl ?? MacPro13}
            alt={title}
            width={200}
            height={180}
            unoptimized={!!imageUrl}
            className="object-contain min-h-[160px] xl:min-h-[180px] 2xl:min-h-[200px] w-auto relative z-10"
          />
        </div>

        {/* ── Details ── */}
        <div className={`flex flex-col${isList ? ' flex-1 justify-between py-[4px] min-w-0' : ' gap-[10px] xl:gap-[14px]'}`}>

          {/* Title + Rating */}
          <div className="flex items-start justify-between gap-[8px]">
            <h2 className="font-bold text-[17px] xl:text-[19px] leading-snug text-gray-900">{title}</h2>
            {rating > 0 && (
              <div className="flex items-center gap-[3px] flex-shrink-0 bg-[#F6F4FF] rounded-full px-[7px] py-[3px]">
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

          {/* Browse-only badge */}
          {availableInSelectedCountry === false && (
            <span className="inline-flex items-center gap-[4px] self-start bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold rounded-[6px] px-[8px] py-[3px] leading-tight">
              🌐 Browse only — not available in your country
            </span>
          )}

          {/* Delivery badges */}
          {storeOptions && storeOptions.length > 1 ? (
            <div className="flex flex-col gap-[4px]">
              {storeOptions.map((opt) => {
                const isSelected = (selectedStoreId ?? storeId) === opt.storeId;
                return (
                  <button
                    key={opt.storeId}
                    onClick={(e) => { e.stopPropagation(); setSelectedStoreId(opt.storeId); }}
                    className={`inline-flex items-center justify-between gap-[6px] rounded-[6px] px-[8px] py-[4px] text-[11px] font-semibold border transition-colors cursor-pointer w-full text-left ${
                      opt.expressDelivery
                        ? isSelected
                          ? 'bg-green-100 text-green-700 border-green-400'
                          : 'bg-green-50 text-green-700 border-green-200 hover:border-green-400'
                        : isSelected
                          ? 'bg-gray-100 text-gray-600 border-gray-400'
                          : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <span>{opt.expressDelivery ? '⚡ Express — under 30 min' : '🚢 Standard shipping'}</span>
                    <span className="font-bold">{formatPrice(opt.storePrice, opt.currency)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <>
              {expressDelivery === true && (
                <span className="inline-flex items-center gap-[4px] self-start bg-green-50 text-green-700 border border-green-200 text-[11px] font-semibold rounded-[6px] px-[8px] py-[3px] leading-tight">
                  ⚡ Express — under 30 min
                </span>
              )}
              {expressDelivery === false && (
                <span className="inline-flex items-center gap-[4px] self-start bg-gray-50 text-gray-500 border border-gray-200 text-[11px] font-semibold rounded-[6px] px-[8px] py-[3px] leading-tight">
                  🚢 Standard shipping
                </span>
              )}
            </>
          )}

          {/* Specs */}
          <div className={`grid gap-[6px]${isList ? ' grid-cols-3' : ' grid-cols-2'}`}>
            {processor && (
              <div className="flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px] xl:px-[10px] xl:py-[6px]">
                <Image src={ProccessorIcon} alt="Processor" width={13} height={13} className="flex-shrink-0 opacity-60" />
                <span className="text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">{processor}</span>
              </div>
            )}
            {ram && (
              <div className="flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px] xl:px-[10px] xl:py-[6px]">
                <Image src={RamIcon} alt="RAM" width={13} height={13} className="flex-shrink-0 opacity-60" />
                <span className="text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">{ram}</span>
              </div>
            )}
            {storage && (
              <div className={`flex items-center gap-[5px] bg-gray-50 rounded-[8px] px-[8px] py-[5px] xl:px-[10px] xl:py-[6px]${isList ? '' : ' col-span-2'}`}>
                <Image src={StorageIcon} alt="Storage" width={13} height={13} className="flex-shrink-0 opacity-60" />
                <span className="text-[11px] xl:text-[12px] text-gray-600 font-medium truncate">{storage}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Price + Actions */}
          <div className="flex items-end justify-between gap-[8px]">

            {/* Price block */}
            <div className="flex flex-col gap-[2px]">
              {discount > 0 && (
                <div className="flex items-center gap-[5px]">
                  <span className="bg-[#402F75] text-white text-[10px] font-bold px-[7px] py-[2px] rounded-full leading-tight">-{formatPrice(discount, currency)}</span>
                  <span className="text-gray-400 line-through text-[12px]">{formatPrice(originalPrice, currency)}</span>
                </div>
              )}
              <span className="text-[21px] xl:text-[24px] text-[#402F75] font-bold leading-none">{formatPrice(price, currency)}</span>
            </div>

            {/* Stock + Buttons */}
            <div className="flex flex-col items-end gap-[5px]">
              <span className={`text-[10px] font-semibold rounded-[6px] py-[2px] px-[7px] leading-tight border ${inStock ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-500 border-red-200'}`}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              <div className="flex items-center gap-[6px]">
                {/* List-view fav button */}
                {isList && <FavButton size="sm" />}

                {/* Add to Cart button with animation */}
                <div className="relative">
                  <AnimatePresence>
                    {particles.map(pid => (
                      <motion.div
                        key={pid}
                        initial={{ opacity: 1, y: 0, x: "-50%", scale: 0.8 }}
                        animate={{ opacity: 0, y: -65, scale: 1.4 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.75, ease: [0.2, 0.8, 0.4, 1] }}
                        className="absolute bottom-full left-1/2 pointer-events-none z-50 bg-[#FBBB14] rounded-full p-[7px] shadow-lg"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <motion.button
                    onClick={handleAddToCart}
                    disabled={availableInSelectedCountry === false}
                    animate={added
                      ? { scale: [1, 0.88, 1.06, 1], transition: { duration: 0.35, ease: "easeOut" } }
                      : { scale: 1 }
                    }
                    className={`flex items-center gap-[5px] py-[8px] px-[12px] rounded-[30px] text-[12px] font-bold whitespace-nowrap transition-colors duration-300 ${
                      availableInSelectedCountry === false
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : added
                        ? "bg-green-500 text-white cursor-pointer"
                        : "bg-[#FBBB14] text-white hover:bg-[#f0b000] cursor-pointer"
                    }`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {availableInSelectedCountry === false ? (
                        <motion.span
                          key="browse-only"
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-[5px]"
                        >
                          🌐 Browse only
                        </motion.span>
                      ) : added ? (
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
                          Added!
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
                          <Image src={CartIcon} alt="cart" width={14} height={14} style={{ filter: "brightness(0) invert(1)" }} />
                          Add to Cart
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
