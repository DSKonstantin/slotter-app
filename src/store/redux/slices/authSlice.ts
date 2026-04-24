import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "../services/api/authApi";
import { usersApi } from "../services/api/usersApi";
import { User } from "@/src/store/redux/services/api-types";

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  token: string | null;
  user: User | null;
  resourceType: "user" | "customer" | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  token: null,
  user: null,
  resourceType: null,
  status: "idle",
};

type UserPayload =
  | User
  | {
      resource?: User | null;
      user?: User | null;
    }
  | null
  | undefined;

function extractUser(payload: UserPayload): User | null {
  if (!payload || typeof payload !== "object") return null;

  if ("resource" in payload && payload.resource) return payload.resource;
  if ("user" in payload && payload.user) return payload.user;
  if ("id" in payload) return payload as User;

  return null;
}

function setAuthenticatedUser(state: AuthState, payload: UserPayload) {
  const user = extractUser(payload);
  if (!user) return;

  state.user = user;
  state.status = "authenticated";
}

function setUserOnly(state: AuthState, payload: UserPayload) {
  const user = extractUser(payload);
  if (!user) return;

  state.user = user;
}

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setToken(state, action: PayloadAction<string | null>) {
      state.token = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.resourceType = null;
      state.status = "unauthenticated";
    },
  },

  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.getMe.matchPending, (state) => {
        state.status = "loading";
      })
      .addMatcher(
        authApi.endpoints.getMe.matchFulfilled,
        (state, { payload }) => {
          const user = extractUser(payload);
          state.user = user;
          state.status = user ? "authenticated" : "unauthenticated";
          if ("resource_type" in payload && payload.resource_type) {
            state.resourceType = payload.resource_type as "user" | "customer";
          }
        },
      )
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addMatcher(
        authApi.endpoints.login.matchFulfilled,
        (state, { payload }) => {
          setAuthenticatedUser(state, payload);
          if ("resource_type" in payload && payload.resource_type) {
            state.resourceType = payload.resource_type as "user" | "customer";
          }
        },
      )
      .addMatcher(
        authApi.endpoints.confirmCode.matchFulfilled,
        (state, { payload }) => {
          setAuthenticatedUser(state, payload);
          if ("resource_type" in payload && payload.resource_type) {
            state.resourceType = payload.resource_type as "user" | "customer";
          }
        },
      )
      .addMatcher(
        authApi.endpoints.resetPassword.matchFulfilled,
        (state, { payload }) => {
          setAuthenticatedUser(state, payload);
          if ("resource_type" in payload && payload.resource_type) {
            state.resourceType = payload.resource_type as "user" | "customer";
          }
        },
      )
      .addMatcher(
        usersApi.endpoints.updateUser.matchFulfilled,
        (state, { payload }) => {
          setUserOnly(state, payload);
        },
      )
      .addMatcher(
        usersApi.endpoints.updateCustomer.matchFulfilled,
        (state, { payload }) => {
          setUserOnly(state, payload);
        },
      );
  },
});

export const { logout, setToken } = authSlice.actions;
export default authSlice.reducer;
