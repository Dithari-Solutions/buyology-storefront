import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  isRestored: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
  isRestored: false,
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
    clearAuthenticated(state) {
      state.isAuthenticated = false;
      state.userId = null;
      state.isRestored = true;
    },
  },
});

export const { setAuthenticated, setUserId, setAuthRestored, clearAuthenticated } = authSlice.actions;
export default authSlice.reducer;
