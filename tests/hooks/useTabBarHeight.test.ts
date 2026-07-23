import { Dimensions } from "react-native";
import { renderHook } from "@testing-library/react-native";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";

// useWindowDimensions subscribes to RN's Dimensions module — Dimensions.set()
// is RN's own supported way to drive it in tests (spying on the
// useWindowDimensions export directly doesn't reach the hook's call site
// reliably under this project's module setup).
const setWindowWidth = (width: number) => {
  Dimensions.set({
    window: { width, height: 800, scale: 1, fontScale: 1 },
    screen: { width, height: 800, scale: 1, fontScale: 1 },
  });
};

describe("useTabBarHeight", () => {
  it("uses the compact tab bar height below the breakpoint (390)", async () => {
    setWindowWidth(375);
    const { result, unmount } = await renderHook(() => useTabBarHeight());
    expect(result.current).toBe(58);
    unmount();
  });

  it("uses the large tab bar height exactly at the breakpoint", async () => {
    setWindowWidth(390);
    const { result, unmount } = await renderHook(() => useTabBarHeight());
    expect(result.current).toBe(70);
    unmount();
  });

  it("uses the large tab bar height above the breakpoint", async () => {
    setWindowWidth(430);
    const { result, unmount } = await renderHook(() => useTabBarHeight());
    expect(result.current).toBe(70);
    unmount();
  });
});
