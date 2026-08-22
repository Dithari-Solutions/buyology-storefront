import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

/**
 * A single product the user chose to "Buy Now". This is kept entirely separate
 * from the cart so a Buy Now checkout never shows or orders the user's other
 * cart items. Prices here are the DISPLAY values for the checkout preview; the
 * authoritative amount/currency come back from the buy-now order the backend
 * creates at place-order time.
 */
export interface BuyNowItem {
  productId: string;
  storeId: string;
  quantity: number;
  title: string;
  imageUrl?: string;
  color?: string;
  storage?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  /** Display shipping estimate (0 when free). The real fee is recomputed server-side. */
  shippingFee: number;
  /**
   * The 30-minute rate for this product, from ProductResponse.expressDeliveryFee. Null when the
   * product is not express-capable. What the express tile quotes for a Buy Now order — the cart's
   * express fee is priced off a different subtotal and must not be used here.
   */
  expressShippingFee?: number | null;
  /**
   * A BROWSING hint from the device's location. Must NOT decide the delivery method — the order
   * resolves express against the DELIVERY ADDRESS; checkout asks /api/stores/express-stores.
   */
  quickDelivery?: boolean;
}

interface BuyNowState {
  item: BuyNowItem | null;
}

const initialState: BuyNowState = { item: null };

const buyNowSlice = createSlice({
  name: "buyNow",
  initialState,
  reducers: {
    setBuyNow(state, action: PayloadAction<BuyNowItem>) {
      state.item = action.payload;
    },
    clearBuyNow(state) {
      state.item = null;
    },
  },
});

export const { setBuyNow, clearBuyNow } = buyNowSlice.actions;
export const selectBuyNowItem = (state: RootState) => state.buyNow.item;
export default buyNowSlice.reducer;
