import { act, renderHook } from "@testing-library/react-native";

import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";

const mockLogin = jest.fn();
const mockReplace = jest.fn();
const mockGetMembership = jest.fn();

jest.mock("expo-router", () => ({
  router: { replace: (href: unknown) => mockReplace(href) },
}));

jest.mock("@/src/contexts/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin }),
}));

jest.mock("@/src/store/redux/services/api/subscriptionApi", () => ({
  useLazyGetSubscriptionMembershipQuery: () => [mockGetMembership],
}));

const resource = (onboarding_step: string) =>
  ({ id: 42, onboarding_step }) as never;

beforeEach(() => {
  jest.clearAllMocks();
  mockLogin.mockResolvedValue(undefined);
  mockGetMembership.mockReturnValue(Promise.resolve());
});

const authorize = async (token: string, user: never) => {
  const { result } = await renderHook(() => useHandleAuthorized());
  await act(async () => {
    await result.current(token, user);
  });
};

describe("useHandleAuthorized", () => {
  it("logs in with the token, loads the membership and opens the app", async () => {
    await authorize("jwt", resource("completed"));

    expect(mockLogin).toHaveBeenCalledWith("jwt");
    expect(mockGetMembership).toHaveBeenCalledWith({ userId: 42 });
    expect(mockReplace).toHaveBeenCalledWith("/(app)/(tabs)");
  });

  it("sends a user who has not finished onboarding to the current step", async () => {
    await authorize("jwt", resource("service"));

    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/service");
  });

  it("falls back to the first onboarding screen for an unknown step", async () => {
    await authorize("jwt", resource("something_new"));

    expect(mockReplace).toHaveBeenCalledWith("/(onboarding)/register");
  });

  it("logs in before navigating", async () => {
    const order: string[] = [];
    mockLogin.mockImplementation(async () => {
      order.push("login");
    });
    mockReplace.mockImplementation(() => {
      order.push("replace");
    });

    await authorize("jwt", resource("completed"));

    expect(order).toEqual(["login", "replace"]);
  });

  it("still navigates when loading the membership fails", async () => {
    mockGetMembership.mockImplementation(() =>
      Promise.reject(new Error("offline")),
    );

    await authorize("jwt", resource("completed"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/(tabs)");
  });
});
