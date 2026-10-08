import { renderHook } from "@testing-library/react-native";

import { useAppMetricaUserSync } from "@/src/hooks/useAppMetricaUserSync";

const mockSetUserProfileId = jest.fn();
let mockUserId: number | null = null;

jest.mock("@/src/services/appMetrica", () => ({
  setUserProfileId: (id: number | null) => mockSetUserProfileId(id),
}));

jest.mock("@/src/store/redux/store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: { user: mockUserId === null ? null : { id: mockUserId } },
    }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUserId = null;
});

describe("useAppMetricaUserSync", () => {
  it("clears the profile for a signed out user", async () => {
    await renderHook(() => useAppMetricaUserSync());

    expect(mockSetUserProfileId).toHaveBeenCalledWith(null);
  });

  it("sets the profile to the signed in user id", async () => {
    mockUserId = 42;

    await renderHook(() => useAppMetricaUserSync());

    expect(mockSetUserProfileId).toHaveBeenCalledWith(42);
  });

  it("follows the user when they sign in", async () => {
    const { rerender } = await renderHook(() => useAppMetricaUserSync());
    mockUserId = 7;

    await rerender({});

    expect(mockSetUserProfileId).toHaveBeenLastCalledWith(7);
  });
});
