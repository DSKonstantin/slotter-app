import { useSegments } from "expo-router";
import { renderHook } from "@testing-library/react-native";
import { shouldShowTabBar, useShowTabBar } from "@/src/hooks/useShowTabBar";

jest.mock("expo-router", () => ({
  useSegments: jest.fn(),
}));

const mockUseSegments = useSegments as unknown as jest.Mock;

describe("shouldShowTabBar", () => {
  it("shows the tab bar on tab root routes", () => {
    expect(shouldShowTabBar(["(app)", "(tabs)"])).toBe(true);
    expect(shouldShowTabBar(["(app)", "(tabs)", "clients"])).toBe(true);
    expect(shouldShowTabBar(["(app)", "(tabs)", "calendar"])).toBe(true);
  });

  it("shows the tab bar on nested tab screens", () => {
    expect(shouldShowTabBar(["(app)", "(tabs)", "clients", "statistics"])).toBe(
      true,
    );
    expect(
      shouldShowTabBar(["(app)", "(tabs)", "account", "client-notifications"]),
    ).toBe(true);
  });

  it("shows the tab bar on the broadcast list", () => {
    expect(shouldShowTabBar(["(app)", "(tabs)", "clients", "broadcast"])).toBe(
      true,
    );
  });

  it("hides the tab bar on the broadcast create form", () => {
    expect(
      shouldShowTabBar(["(app)", "(tabs)", "clients", "broadcast", "create"]),
    ).toBe(false);
  });

  it("hides the tab bar on the broadcast edit form", () => {
    expect(
      shouldShowTabBar(["(app)", "(tabs)", "clients", "broadcast", "[id]"]),
    ).toBe(false);
  });

  it("does not hide unrelated 'create' / '[id]' routes", () => {
    expect(shouldShowTabBar(["(app)", "(tabs)", "clients", "create"])).toBe(
      true,
    );
    expect(shouldShowTabBar(["(app)", "client", "[id]"])).toBe(true);
  });

  it("hides the tab bar on chat and payment root routes", () => {
    expect(shouldShowTabBar(["(app)", "chat", "[id]"])).toBe(false);
    expect(shouldShowTabBar(["(app)", "payment"])).toBe(false);
  });
});

describe("useShowTabBar", () => {
  afterEach(() => jest.clearAllMocks());

  it("reflects the current segments (visible)", async () => {
    mockUseSegments.mockReturnValue([
      "(app)",
      "(tabs)",
      "clients",
      "broadcast",
    ]);
    const { result, unmount } = await renderHook(() => useShowTabBar());
    expect(result.current).toBe(true);
    unmount();
  });

  it("reflects the current segments (hidden on broadcast form)", async () => {
    mockUseSegments.mockReturnValue([
      "(app)",
      "(tabs)",
      "clients",
      "broadcast",
      "create",
    ]);
    const { result, unmount } = await renderHook(() => useShowTabBar());
    expect(result.current).toBe(false);
    unmount();
  });
});
