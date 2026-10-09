import { Dimensions } from "react-native";
import { renderHook } from "@testing-library/react-native";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import {
  COMPACT_BREAKPOINT,
  TAB_BAR_HEIGHT,
  TAB_BAR_HEIGHT_LARGE,
} from "@/src/constants/tabs";

const setWindowWidth = (width: number) => {
  Dimensions.set({
    window: { width, height: 800, scale: 1, fontScale: 1 },
    screen: { width, height: 800, scale: 1, fontScale: 1 },
  });
};

describe("useTabBarHeight", () => {
  it("uses the compact tab bar height below the breakpoint", async () => {
    setWindowWidth(COMPACT_BREAKPOINT - 1);
    const { result, unmount } = await renderHook(() => useTabBarHeight());
    expect(result.current).toBe(TAB_BAR_HEIGHT);
    unmount();
  });

  it("uses the large tab bar height exactly at the breakpoint", async () => {
    setWindowWidth(COMPACT_BREAKPOINT);
    const { result, unmount } = await renderHook(() => useTabBarHeight());
    expect(result.current).toBe(TAB_BAR_HEIGHT_LARGE);
    unmount();
  });

  it("uses the large tab bar height above the breakpoint", async () => {
    setWindowWidth(COMPACT_BREAKPOINT + 40);
    const { result, unmount } = await renderHook(() => useTabBarHeight());
    expect(result.current).toBe(TAB_BAR_HEIGHT_LARGE);
    unmount();
  });

  it("keeps the compact bar lower than the large one", () => {
    expect(TAB_BAR_HEIGHT).toBeLessThan(TAB_BAR_HEIGHT_LARGE);
  });
});
