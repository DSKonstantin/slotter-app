import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook } from "@testing-library/react-native";

import authReducer, {
  type AuthState,
} from "@/src/store/redux/slices/authSlice";
import { api } from "@/src/store/redux/services/api";
import { useSubscriptionQuota } from "@/src/hooks/useSubscriptionQuota";
import type { User } from "@/src/store/redux/services/api-types";

jest.mock("@/src/store/redux/services/axios", () => ({
  __esModule: true,
  default: jest.fn(() =>
    Promise.reject(new Error("network disabled in tests")),
  ),
}));

const buildUser = (
  subscriptionMembership: User["subscription_membership"],
): User =>
  ({
    id: 1,
    subscription_membership: subscriptionMembership,
  }) as User;

const renderWithUser = (user: User | null) => {
  const authState: AuthState = {
    token: null,
    user,
    resourceType: null,
    status: "idle",
  };
  const store = configureStore({
    reducer: { auth: authReducer, [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState: { auth: authState },
    enhancers: (getDefaultEnhancers) =>
      getDefaultEnhancers({ autoBatch: false }),
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(() => useSubscriptionQuota(), { wrapper });
};

describe("useSubscriptionQuota", () => {
  it("does not fetch quota while membership is still unknown (undefined)", async () => {
    const { result } = await renderWithUser(buildUser(undefined as never));
    expect(result.current.shouldFetchQuota).toBe(false);
    expect(result.current.quota).toBeUndefined();
  });

  it("does not fetch quota for a PRO user", async () => {
    const { result } = await renderWithUser(
      buildUser({ pro_access: true } as never),
    );
    expect(result.current.shouldFetchQuota).toBe(false);
  });

  it("fetches quota for a known non-PRO user", async () => {
    const { result } = await renderWithUser(
      buildUser({ pro_access: false } as never),
    );
    expect(result.current.shouldFetchQuota).toBe(true);
  });

  it("never fetches when there is no logged-in user", async () => {
    const { result } = await renderWithUser(null);
    expect(result.current.shouldFetchQuota).toBe(false);
  });
});
