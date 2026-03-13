import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticated(state) {
      state.isAuthenticated = true;
    },
    clearAuthenticated(state) {
      state.isAuthenticated = false;
    },
  },
});

export const { setAuthenticated, clearAuthenticated } = authSlice.actions;
export default authSlice.reducer;
