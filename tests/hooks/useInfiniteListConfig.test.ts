import { renderHook } from "@testing-library/react-native";
import { useInfiniteListConfig } from "@/src/hooks/useInfiniteListConfig";
import { SCREEN_PADDING } from "@/src/constants/layout";

describe("useInfiniteListConfig", () => {
  it("applies sensible defaults with no options", async () => {
    const { result } = await renderHook(() => useInfiniteListConfig());
    expect(result.current.contentContainerStyle).toEqual({
      paddingHorizontal: SCREEN_PADDING,
      gap: 8,
    });
    expect(result.current.onEndReachedThreshold).toBe(0.8);
    expect(result.current.activationDistance).toBe(10);
    expect(result.current.autoscrollThreshold).toBe(48);
    expect(result.current.autoscrollSpeed).toBe(220);
  });

  it("only includes paddingTop/paddingBottom when explicitly provided", async () => {
    const { result } = await renderHook(() =>
      useInfiniteListConfig({ paddingTop: 20, paddingBottom: 40 }),
    );
    expect(result.current.contentContainerStyle).toEqual({
      paddingHorizontal: SCREEN_PADDING,
      gap: 8,
      paddingTop: 20,
      paddingBottom: 40,
    });
  });

  it("only includes flexGrow when includeFlexGrow is true", async () => {
    const withFlex = await renderHook(() =>
      useInfiniteListConfig({ includeFlexGrow: true }),
    );
    expect(withFlex.result.current.contentContainerStyle.flexGrow).toBe(1);

    const withoutFlex = await renderHook(() => useInfiniteListConfig());
    expect(
      withoutFlex.result.current.contentContainerStyle.flexGrow,
    ).toBeUndefined();
  });

  it("respects overridden paddingHorizontal/gap/onEndReachedThreshold", async () => {
    const { result } = await renderHook(() =>
      useInfiniteListConfig({
        paddingHorizontal: 12,
        gap: 4,
        onEndReachedThreshold: 0.5,
      }),
    );
    expect(result.current.contentContainerStyle.paddingHorizontal).toBe(12);
    expect(result.current.contentContainerStyle.gap).toBe(4);
    expect(result.current.onEndReachedThreshold).toBe(0.5);
  });
});
