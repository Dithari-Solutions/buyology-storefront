import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type B2bApplicationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  isRestored: boolean;
  /**
   * True when this account was created through the B2B business sign-up and the
   * application has not been approved yet. Such users can sign in and browse, but
   * every action is blocked behind the "awaiting approval" notice. Mirrors
   * ProfileResponse.b2bPendingApproval and is synced by B2bApprovalSync.
   */
  b2bPendingApproval: boolean;
  /** The user's B2B application status, or null when they never applied. */
  b2bApplicationStatus: B2bApplicationStatus | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  isRestored: false,
  b2bPendingApproval: false,
  b2bApplicationStatus: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state) {
      state.isAuthenticated = true;
      state.isRestored = true;
    },
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    },
    setAuthRestored(state) {
      state.isRestored = true;
    },
    setB2bStatus(
      state,
      action: PayloadAction<{
        pendingApproval: boolean;
        applicationStatus: B2bApplicationStatus | null;
      }>,
    ) {
      state.b2bPendingApproval = action.payload.pendingApproval;
      state.b2bApplicationStatus = action.payload.applicationStatus;
    },
    clearAuthenticated(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.isRestored = true;
      state.b2bPendingApproval = false;
      state.b2bApplicationStatus = null;
    },
  },
});

export const {
  setAuthenticated,
  setUserId,
  setAuthRestored,
  setB2bStatus,
  clearAuthenticated,
} = authSlice.actions;
export default authSlice.reducer;
