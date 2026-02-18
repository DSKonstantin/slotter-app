import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../services/api/authApi";
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

/**
 * Универсальный extractor user из разных response форматов
 */
function extractUser(payload: any): API.User | null {
  if (!payload) return null;

  if (payload.resource) return payload.resource;
  if (payload.user) return payload.user;

  // если payload уже User
  if (payload.id) return payload;

  return null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },

  extraReducers: (builder) => {
    builder

      // getMe pending
      .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
        state.status = "loading";
      })

      // getMe fulfilled
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, action: PayloadAction<any>) => {
          const user = extractUser(action.payload);
          state.user = user;
          state.status = user ? "authenticated" : "unauthenticated";
        },
      )

      // getMe rejected
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })

      // login
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, action: PayloadAction<any>) => {
          const user = extractUser(action.payload);
          if (user) {
            state.user = user;
            state.status = "authenticated";
          }
        },
      )

      // confirmTelegramLogin
      .addMatcher(
        authApi.endpoints.confirmTelegramLogin.matchFulfilled,
        (state, action: PayloadAction<any>) => {
          const user = extractUser(action.payload);
          if (user) {
            state.user = user;
            state.status = "authenticated";
          }
        },
      )

      // telegramRegisterStatus
      .addMatcher(
        authApi.endpoints.telegramRegisterStatus.matchFulfilled,
        (state, action: PayloadAction<any>) => {
          const user = extractUser(action.payload);
          if (user) {
            state.user = user;
            state.status = "authenticated";
          }
        },
      )

      // updateUser
      .addMatcher(
        authApi.endpoints.updateUser.matchFulfilled,
        (state, action: PayloadAction<any>) => {
          const user = extractUser(action.payload);
          if (user) {
            state.user = user;
          }
        },
      )

      // updateCustomer
      .addMatcher(
        authApi.endpoints.updateCustomer.matchFulfilled,
        (state, action: PayloadAction<any>) => {
          const user = extractUser(action.payload);
          if (user) {
            state.user = user;
          }
        },
      );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
