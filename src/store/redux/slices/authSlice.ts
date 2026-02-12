import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { API } from "@/src/store/redux/services/api-types";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: API.User | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading(state) {
      state.status = "loading";
    },
    setUser(state, action: PayloadAction<API.User | null>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    logout(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setUser, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
