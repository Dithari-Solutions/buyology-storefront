import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state) {
      state.isAuthenticated = true;
    },
    setUserId(state, action: PayloadAction<string>) {
      state.userId = action.payload;
    },
    clearAuthenticated(state) {
      state.isAuthenticated = false;
      state.userId = null;
    },
  },
});

export const { setAuthenticated, setUserId, clearAuthenticated } = authSlice.actions;
export default authSlice.reducer;
