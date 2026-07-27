import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getQuoteCart } from "@/features/b2b/services/quote.api";

// ── B2B quote-cart state (header badge + "is this user a B2B member") ──────────
// A B2B member's cart IS the DRAFT B2bQuote. `GET /api/b2b/quote/cart` returns it
// for an ACTIVE member (200) and 403/401s for everyone else — so one call resolves
// BOTH whether the user is an active B2B member AND their line count. The regular
// cart (header + /cart) uses this to render the B2B RFQ experience for members.

interface B2bQuoteState {
  /** Number of lines in the DRAFT B2B quote cart. */
  count: number;
  /** true once resolved as an ACTIVE B2B member (getQuoteCart returned 200). */
  isMember: boolean;
  /** true once the member/count has been resolved at least once this session. */
  resolved: boolean;
}

const initialState: B2bQuoteState = { count: 0, isMember: false, resolved: false };

/** Resolve membership + line count from the B2B quote cart. Rejects (403/401) for non-members. */
export const fetchB2bQuoteCount = createAsyncThunk("b2bQuote/fetch", async () => {
  const quote = await getQuoteCart();
  return quote.items?.length ?? 0;
});

const b2bQuoteSlice = createSlice({
  name: "b2bQuote",
  initialState,
  reducers: {
    /** Set the count directly after an add/update/remove (keeps the header badge live). */
    setB2bQuoteCount(state, action: PayloadAction<number>) {
      state.count = Math.max(0, action.payload);
      state.isMember = true;
      state.resolved = true;
    },
    resetB2bQuote() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchB2bQuoteCount.fulfilled, (state, action) => {
        state.count = action.payload;
        state.isMember = true;
        state.resolved = true;
      })
      .addCase(fetchB2bQuoteCount.rejected, (state) => {
        state.count = 0;
        state.isMember = false;
        state.resolved = true;
      })
      // Clear on sign-out so a later member/guest resolves fresh.
      .addCase("auth/clearAuthenticated", () => ({ ...initialState }));
  },
});

export const { setB2bQuoteCount, resetB2bQuote } = b2bQuoteSlice.actions;

export const selectB2bQuoteCount = (s: { b2bQuote: B2bQuoteState }) => s.b2bQuote.count;
export const selectB2bIsMember = (s: { b2bQuote: B2bQuoteState }) => s.b2bQuote.isMember;
export const selectB2bResolved = (s: { b2bQuote: B2bQuoteState }) => s.b2bQuote.resolved;

export default b2bQuoteSlice.reducer;
