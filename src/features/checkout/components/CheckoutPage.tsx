"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import type { RootState, AppDispatch } from "@/store";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import AlertModal from "@/shared/components/AlertModal";
import ShippingStep from "./ShippingStep";
import PaymentStep from "./PaymentStep";
import CheckoutSummary from "./CheckoutSummary";
import type { ShippingFormData, CheckoutStep, PaymentMethod } from "../types";
import { initiatePayment } from "../services/payment.api";
import { b2bAccountApi } from "@/features/b2b/account/api";
import { selectCartTotals, selectCartItems, selectCartShippingFee, setShippingFee, selectPromo, fetchCartThunk } from "@/features/cart/store/cartSlice";
import { checkoutCart } from "@/features/cart/services/cart.api";
import { createOrder, createBuyNowOrder } from "@/features/orders/services/orders.api";
import { selectBuyNowItem, clearBuyNow } from "@/features/buyNow/store/buyNowSlice";
import { getCredentialIdFromAccessToken } from "@/shared/lib/tokenManager";
import { selectUserCoords } from "@/features/location/store/locationSlice";
import { SITE_URL } from "@/shared/seo/config";
import type { Address, UserProfile, CreateAddressPayload } from "@/features/profile/types";
import {
    getProfile,
    getAddresses,
    createAddress,
} from "@/features/profile/services/profile.api";

const METHOD_MAP: Record<Exclude<PaymentMethod, "credit">, "CARD" | "TABBY" | "TAMARA"> = {
    card: "CARD",
    tabby: "TABBY",
    tamara: "TAMARA",
};

const PENDING_TX_KEY = "buyology_pending_tx_id";

// ── Step Indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: CheckoutStep }) {
    const { t } = useTranslation("checkout");

    const steps: { key: CheckoutStep; label: string }[] = [
        { key: "shipping", label: t("steps.shipping") },
        { key: "payment", label: t("steps.payment") },
    ];

    const currentIdx = steps.findIndex((s) => s.key === current);

    return (
        <div className="flex items-center justify-center mb-8 bg-white rounded-[20px] py-[10px]">
            {steps.map((step, idx) => {
                const isCompleted = idx < currentIdx;
                const isActive = idx === currentIdx;

                return (
                    <div key={step.key} className="flex items-center">
                        <div className="flex flex-col items-center gap-1.5">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                                    isCompleted
                                        ? "bg-[#402F75] text-white"
                                        : isActive
                                        ? "bg-[#FBBB14] text-gray-900"
                                        : "bg-gray-200 text-gray-400"
                                }`}
                            >
                                {isCompleted ? (
                                    <svg
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    idx + 1
                                )}
                            </div>
                            <span
                                className={`text-[12px] font-semibold ${
                                    isActive
                                        ? "text-gray-900"
                                        : isCompleted
                                        ? "text-[#402F75]"
                                        : "text-gray-400"
                                }`}
                            >
                                {step.label}
                            </span>
                        </div>

                        {idx < steps.length - 1 && (
                            <div
                                className={`h-0.5 w-24 sm:w-32 mx-3 mb-4 rounded-full transition-all ${
                                    isCompleted ? "bg-[#402F75]" : "bg-gray-200"
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Order Confirmed Screen ────────────────────────────────────────────────────

function OrderConfirmed({ lang }: { lang: string }) {
    const { t } = useTranslation("checkout");

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#EDE9FF] flex items-center justify-center mb-5">
                <svg
                    width="36"
                    height="36"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#402F75"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            </div>
            <h2 className="text-[24px] font-bold text-gray-900 mb-2">{t("confirmed.title")}</h2>
            <p className="text-gray-500 text-[14px] max-w-sm mb-8">{t("confirmed.description")}</p>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <a href={`/${lang}/orders`}>
                    <button className="bg-[#402F75] hover:bg-[#2e2156] transition-colors text-white font-bold px-8 py-3 rounded-full text-[14px] cursor-pointer">
                        {t("confirmed.viewOrders", { defaultValue: "View My Orders" })}
                    </button>
                </a>
                <a href={`/${lang}/shop`}>
                    <button className="bg-white hover:bg-gray-50 border border-gray-200 transition-colors text-gray-700 font-bold px-8 py-3 rounded-full text-[14px] cursor-pointer">
                        {t("confirmed.continueShopping")}
                    </button>
                </a>
            </div>
        </div>
    );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
    const { t } = useTranslation("checkout");
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const lang = useSelector((state: RootState) => state.language.lang) as string;
    const userId = useSelector((state: RootState) => state.auth.userId);
    const authRestored = useSelector((state: RootState) => state.auth.isRestored);
    const cartId = useSelector((state: RootState) => state.cart.cartId);
    const cartCurrency = useSelector((state: RootState) => state.cart.currency) ?? "AED";
    const totals = useSelector(selectCartTotals);
    const cartItems = useSelector(selectCartItems);
    const shippingFee = useSelector(selectCartShippingFee);
    const promo = useSelector(selectPromo);
    const userCoords = useSelector(selectUserCoords);

    // ── Buy Now mode: checkout a single product, never the cart ────────────────
    const searchParams = useSearchParams();
    const isBuyNow = searchParams.get("buyNow") === "1";
    const buyNowItem = useSelector(selectBuyNowItem);

    const [step, setStep] = useState<CheckoutStep>("shipping");
    const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    // Customer's explicit delivery choice (null = default to Express when it's eligible).
    const [deliveryChoice, setDeliveryChoice] = useState<"EXPRESS" | "REGULAR" | null>(null);
    // Live fulfillment mode lifted from ShippingStep so the order summary updates the moment
    // the shopper toggles "Pick up from store" (pickup has no shipping fee).
    const [fulfillment, setFulfillment] = useState<"DELIVERY" | "PICKUP">("DELIVERY");

    // Per-item quick-delivery eligibility (the item's store is within the 30-min radius of the
    // user's coords — computed by the backend on the cart item's `quickDelivery` flag).
    const hasExpressItem = isBuyNow ? (buyNowItem?.quickDelivery ?? false) : cartItems.some((i) => i.quickDelivery);
    const hasCoords = shippingData?.latitude != null && shippingData?.longitude != null;
    // Express can only be OFFERED when at least one item qualifies AND we have map coordinates.
    const expressEligible = hasExpressItem && hasCoords;
    // A cart that mixes quick-eligible and regular-only items: we still proceed, just inform the shopper.
    const mixedCart = !isBuyNow && cartItems.some((i) => i.quickDelivery) && cartItems.some((i) => !i.quickDelivery);
    // Store pickup short-circuits the delivery method (no courier, no shipping fee).
    // Use the live lifted state so the summary reacts immediately, falling back to the
    // submitted shipping data (e.g. on the payment step / retries).
    const isPickup = fulfillment === "PICKUP" || shippingData?.fulfillment === "PICKUP";
    // Effective method sent to the order: PICKUP when chosen; else the customer's choice when
    // express is eligible (default Express), otherwise Regular.
    const deliveryMethod: "EXPRESS" | "REGULAR" | "PICKUP" = isPickup
        ? "PICKUP"
        : expressEligible ? (deliveryChoice ?? "EXPRESS") : "REGULAR";

    // In Buy Now mode the summary/payment use the single product instead of the cart.
    const buyNowSubtotal = buyNowItem ? buyNowItem.price * buyNowItem.quantity : 0;
    const summaryCurrency = isBuyNow && buyNowItem ? buyNowItem.currency : cartCurrency;
    const summaryItems = isBuyNow && buyNowItem
        ? [{
            id: "buynow",
            title: buyNowItem.title,
            imageUrl: buyNowItem.imageUrl,
            quantity: buyNowItem.quantity,
            variant: { color: buyNowItem.color, storage: buyNowItem.storage },
            price: buyNowItem.price,
            quickDelivery: buyNowItem.quickDelivery ?? false,
        }]
        : undefined;
    const summaryTotals = isBuyNow && buyNowItem
        ? {
            subtotal: buyNowSubtotal,
            shipping: buyNowItem.shippingFee,
            promoDiscount: 0,
            total: buyNowSubtotal + buyNowItem.shippingFee,
        }
        : undefined;

    // Cart checkout with store pickup: zero the shipping in the summary/payment total.
    // (cartTotals.total already nets the promo discount, so subtract its shipping to drop the fee.)
    const pickupSummaryTotals = isPickup && !isBuyNow
        ? {
            subtotal: totals.subtotal,
            shipping: 0,
            promoDiscount: totals.promoDiscount,
            total: parseFloat((totals.total - totals.shipping).toFixed(2)),
        }
        : undefined;

    // Profile + addresses state
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);

    const [paymentError, setPaymentError] = useState<string | null>(null);

    // Track the order created in this checkout session.
    // On payment retry we skip checkoutCart + createOrder (both already done)
    // and go straight to initiatePayment with the existing orderId.
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [pendingShippingFee, setPendingShippingFee] = useState<number | null>(null);
    // Buy Now retry: the order's authoritative amount/currency to re-send to payment.
    const [pendingAmount, setPendingAmount] = useState<number | null>(null);
    const [pendingCurrency, setPendingCurrency] = useState<string | null>(null);

    // ── Auth guard: redirect to sign-in once auth state is known and absent ────
    useEffect(() => {
        if (authRestored && !userId) router.push(`/${lang}/auth`);
    }, [authRestored, userId, lang, router]);

    // ── Load profile + addresses on mount ─────────────────────────────────────

    useEffect(() => {
        if (!userId) return;
        Promise.all([getProfile(userId), getAddresses(userId)])
            .then(([prof, addrs]) => {
                setProfile(prof);
                setSavedAddresses(addrs);
            })
            .catch(() => {
                // non-blocking — user can still fill form manually
            });
    }, [userId]);

    // ── Load the FULL cart (items + currency + shippingFee) into Redux on mount ──
    // Previously this only refreshed shippingFee, so navigating straight to checkout
    // left state.cart.items empty → totals showed "AED 0.00". fetchCartThunk loads
    // the items + currency so selectCartTotals resolves the real total.

    // Buy Now: if the stashed item is missing (e.g. a refresh dropped it), there's
    // nothing to check out — send the user back. Skip once an order already exists
    // (pendingOrderId), so clearing the item just before the payment redirect can't
    // bounce a retry home.
    useEffect(() => {
        if (isBuyNow && authRestored && userId && !buyNowItem && !pendingOrderId) {
            router.push(`/${lang}`);
        }
    }, [isBuyNow, authRestored, userId, buyNowItem, pendingOrderId, lang, router]);

    useEffect(() => {
        if (!userId) return;
        if (isBuyNow) return; // Buy Now never loads the cart
        const load = (coords?: { lat: number; lng: number }) => {
            dispatch(fetchCartThunk({ coords }));
        };
        if (userCoords) {
            load(userCoords);
        } else if (typeof navigator !== "undefined" && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => load({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => load()
            );
        } else {
            load();
        }
    }, [userId, userCoords, dispatch, isBuyNow]);

    // ── Save address from checkout ─────────────────────────────────────────────

    async function handleSaveAddress(payload: CreateAddressPayload): Promise<Address> {
        if (!userId) throw new Error("Not authenticated");
        const created = await createAddress(userId, payload);
        setSavedAddresses((prev) => {
            const updated = payload.isDefault
                ? prev.map((a) => ({ ...a, isDefault: false }))
                : prev;
            return [...updated, created];
        });
        return created;
    }

    // ── Handlers ──────────────────────────────────────────────────────────────

    function handleShippingContinue(data: ShippingFormData) {
        setShippingData(data);
        setStep("payment");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handlePlaceOrder(paymentMethod: PaymentMethod, creditAmount: number = 0) {
        if (!userId || !shippingData) return;

        setIsSubmitting(true);
        setPaymentError(null);

        try {
            if (!isBuyNow && !cartId) throw new Error("No active cart found. Please add items and try again.");
            if (isPickup) {
                if (!shippingData.pickupStoreId) throw new Error("Please choose a store to pick up from.");
            } else if (!shippingData.addressId) {
                throw new Error("Please select a delivery address.");
            }

            let finalShippingFee: number;
            let orderId: string;
            let payAmount: number;
            let payCurrency: string;
            let payCartId: string | undefined;

            if (pendingOrderId && pendingShippingFee != null) {
                // ── Retry path: order already created, skip checkout + order creation ──
                finalShippingFee = pendingShippingFee;
                orderId = pendingOrderId;
                payAmount = isBuyNow && pendingAmount != null
                    ? pendingAmount
                    : parseFloat((totals.subtotal - totals.promoDiscount + finalShippingFee).toFixed(2));
                payCurrency = isBuyNow && pendingCurrency ? pendingCurrency : cartCurrency;
                payCartId = isBuyNow ? undefined : (cartId ?? undefined);
            } else if (isBuyNow) {
                // ── Buy Now: order ONLY this product (the backend builds a throwaway
                // single-item cart, so the user's real cart is untouched). ──
                if (!buyNowItem) throw new Error("Nothing to buy. Please try again.");
                const authCredentialId = getCredentialIdFromAccessToken();
                if (!authCredentialId) throw new Error("Your session expired. Please sign in again.");
                const order = await createBuyNowOrder(authCredentialId, {
                    productId: buyNowItem.productId,
                    storeId: buyNowItem.storeId,
                    quantity: buyNowItem.quantity,
                    addressId: shippingData.addressId!,
                    // Buy Now never uses store pickup (the pickup toggle is hidden in that mode).
                    deliveryMethod: deliveryMethod === "PICKUP" ? "REGULAR" : deliveryMethod,
                });
                orderId = order.id;
                finalShippingFee = order.shippingFee ?? 0;
                // Use the order's authoritative amount/currency for payment.
                payAmount = order.totalAmount;
                payCurrency = order.currency;
                payCartId = order.cartId ?? undefined;
                setPendingOrderId(order.id);
                setPendingShippingFee(finalShippingFee);
                setPendingAmount(order.totalAmount);
                setPendingCurrency(order.currency);
            } else {
                // ── First attempt: checkout cart then create order ──

                // Step 1 — Checkout the cart (ACTIVE → CHECKED_OUT)
                const checkedOutCart = await checkoutCart();
                // Store pickup has no shipping fee; the backend enforces 0 too.
                finalShippingFee = isPickup ? 0 : (checkedOutCart.shippingFee ?? shippingFee);
                dispatch(setShippingFee(finalShippingFee));

                // Step 2 — Create order (cart must be CHECKED_OUT).
                // X-Auth-Credential-Id must be the auth_credentials.id (JWT sub) the
                // cart is keyed by — NOT userId (users.id / uid), or the backend
                // rejects it as "Cart does not belong to the authenticated user".
                const authCredentialId = getCredentialIdFromAccessToken();
                if (!authCredentialId) throw new Error("Your session expired. Please sign in again.");
                const order = await createOrder(authCredentialId, {
                    cartId: cartId!,
                    addressId: isPickup ? undefined : shippingData.addressId,
                    pickupStoreId: isPickup ? shippingData.pickupStoreId : undefined,
                    deliveryMethod,
                    shippingFee: finalShippingFee,
                    // Forward the applied promo so the backend applies the discount to the
                    // order total (and records usage). Without it the order total stays at
                    // full price and payment fails the amount-match check.
                    couponCode: promo.applied && promo.code ? promo.code : undefined,
                });
                orderId = order.id;
                payAmount = parseFloat((totals.subtotal - totals.promoDiscount + finalShippingFee).toFixed(2));
                payCurrency = cartCurrency;
                payCartId = cartId ?? undefined;

                // Persist so retries reuse the same order
                setPendingOrderId(order.id);
                setPendingShippingFee(finalShippingFee);
            }

            // Step 3a — Apply B2B credit if the user enabled it
            if (creditAmount > 0) {
                try {
                    const creditResult = await b2bAccountApi.payOrderWithCredit(orderId, creditAmount);
                    if (creditResult.fullySettled || paymentMethod === "credit") {
                        // Credit covered the entire order (or user explicitly chose credit-only) — skip Paymob.
                        window.location.href = `/${lang}/payment/callback?orderId=${orderId}&status=paid`;
                        return;
                    }
                    // Otherwise the order's remaining balance is settled via the normal Paymob flow below;
                    // PaymentService.initiatePayment subtracts creditApplied server-side.
                } catch (err) {
                    setPaymentError(
                        err instanceof Error
                            ? err.message
                            : "Could not apply B2B credit. Please try again."
                    );
                    setIsSubmitting(false);
                    return;
                }
            }

            if (paymentMethod === "credit") {
                // Wallet didn't cover the order and user only wanted credit — surface to user.
                setPaymentError("Your wallet balance does not cover this order. Pick another payment method.");
                setIsSubmitting(false);
                return;
            }

            // Step 3 — Initiate payment
            const result = await initiatePayment({
                appOrderId: orderId,
                cartId: payCartId,
                addressId: isPickup ? undefined : shippingData.addressId,
                pickupStoreId: isPickup ? shippingData.pickupStoreId : undefined,
                deliveryMethod,
                shippingFee: finalShippingFee,
                methodType: METHOD_MAP[paymentMethod],
                amount: payAmount,
                currency: payCurrency,
                // customerId here is the users.id principal (Redux `userId`) — that's what
                // the backend's checkPaymentReadiness(userRepo.findById) expects. Do NOT
                // send the auth_credentials.id (`sub`) here: it 500s payment initiation.
                customerId: userId,
                customerEmail: profile?.email ?? shippingData.email,
                customerPhone: shippingData.phone || undefined,
                billingName: `${shippingData.firstName} ${shippingData.lastName}`.trim(),
                billingStreet: shippingData.streetAddress || undefined,
                billingApartment: shippingData.apartment || undefined,
                billingCity: shippingData.city || undefined,
                billingCountry: shippingData.country || undefined,
                billingPostalCode: shippingData.postalCode || undefined,
                // Use the canonical production site URL (not window.location.origin) so the
                // post-payment redirect always lands on the live site, not a dev/staging host.
                redirectionUrl: `${SITE_URL}/${lang}/payment/callback?orderId=${orderId}`,
            });

            // All methods use Unified Checkout — store transactionId and redirect
            sessionStorage.setItem(PENDING_TX_KEY, result.transactionId);
            if (isBuyNow) dispatch(clearBuyNow());
            window.location.href = result.checkoutUrl;
        } catch (err) {
            setPaymentError(
                err instanceof Error
                    ? err.message
                    : t("payment.error.generic", { defaultValue: "Payment initiation failed. Please try again." })
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleRetry() {
        setPaymentError(null);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    if (orderPlaced) {
        return (
            <>
                <Header />
                <main className="w-[90%] mx-auto py-8 md:py-12">
                    <OrderConfirmed lang={lang} />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="w-[90%] mx-auto py-8 md:py-12">
                <StepIndicator current={step} />

                <AlertModal
                    open={Boolean(profile && !profile.paymentReady)}
                    onClose={() => {}}
                    severity="warning"
                    title={t("payment.profile.incompleteTitle", { defaultValue: "Complete your profile" })}
                    message={
                        (profile?.missingFields?.length ?? 0) > 0
                            ? `Missing: ${profile?.missingFields.join(", ")}`
                            : t("payment.profile.incompleteMessage", { defaultValue: "You need to complete your profile before checkout." })
                    }
                    primaryAction={{
                        label: t("payment.profile.goToProfile", { defaultValue: "Complete profile" }),
                        onClick: () => { window.location.href = `/${lang}/profile?returnTo=checkout`; },
                    }}
                />

                <AlertModal
                    open={Boolean(paymentError)}
                    onClose={handleRetry}
                    severity="error"
                    title={t("payment.error.title", { defaultValue: "Payment error" })}
                    message={paymentError ?? ""}
                    primaryAction={{
                        label: t("payment.error.retry", { defaultValue: "Try again" }),
                        onClick: handleRetry,
                    }}
                />

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-6 items-start">
                    {/* Left column */}
                    <div>
                        {step === "shipping" && (
                            <ShippingStep
                                onContinue={handleShippingContinue}
                                initialData={shippingData ?? undefined}
                                savedAddresses={savedAddresses}
                                profilePhone={profile?.phoneNumber ?? undefined}
                                profileEmail={profile?.email ?? undefined}
                                profileName={profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() : undefined}
                                phoneVerified={profile?.phoneVerified ?? undefined}
                                allowPickup={!isBuyNow}
                                onFulfillmentChange={setFulfillment}
                                onSaveAddress={handleSaveAddress}
                            />
                        )}
                        {step === "payment" && shippingData && (
                            <PaymentStep
                                shipping={shippingData}
                                deliveryMethod={deliveryMethod}
                                expressEligible={expressEligible}
                                hasExpressItem={hasExpressItem}
                                hasCoords={hasCoords}
                                mixedCart={mixedCart}
                                onDeliveryMethodChange={setDeliveryChoice}
                                onEdit={() => setStep("shipping")}
                                onPlaceOrder={handlePlaceOrder}
                                isSubmitting={isSubmitting}
                                userId={userId}
                                currency={summaryCurrency}
                                orderTotalOverride={
                                    pickupSummaryTotals
                                        ? pickupSummaryTotals.total
                                        : isBuyNow && summaryTotals
                                            ? summaryTotals.total
                                            : undefined
                                }
                            />
                        )}
                    </div>

                    {/* Right column */}
                    <CheckoutSummary
                        items={summaryItems}
                        totals={pickupSummaryTotals ?? summaryTotals}
                        currency={isBuyNow ? summaryCurrency : undefined}
                    />
                </div>
            </main>
            <Footer />
        </>
    );
}
