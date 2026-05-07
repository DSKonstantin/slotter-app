import { useMemo } from "react";
import { SCREEN_PADDING } from "@/src/constants/layout";

interface InfiniteListConfig {
  contentContainerStyle: {
    gap: number;
    paddingHorizontal?: number;
    paddingTop?: number;
    paddingBottom?: number;
    flexGrow?: number;
  };
  onEndReachedThreshold: number;
  activationDistance: number;
  autoscrollThreshold: number;
  autoscrollSpeed: number;
}

interface UseInfiniteListConfigOptions {
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  gap?: number;
  includeFlexGrow?: boolean;
  onEndReachedThreshold?: number;
}

export const useInfiniteListConfig = (
  options: UseInfiniteListConfigOptions = {},
): InfiniteListConfig => {
  const {
    paddingHorizontal = SCREEN_PADDING,
    gap = 8,
    onEndReachedThreshold = 0.8,
    includeFlexGrow = false,
  } = options;

  return useMemo(
    () => ({
      contentContainerStyle: {
        paddingHorizontal,
        gap,
        ...(options.paddingTop !== undefined && {
          paddingTop: options.paddingTop,
        }),
        ...(options.paddingBottom !== undefined && {
          paddingBottom: options.paddingBottom,
        }),
        ...(includeFlexGrow && { flexGrow: 1 }),
      },
      onEndReachedThreshold,
      activationDistance: 10,
      autoscrollThreshold: 48,
      autoscrollSpeed: 220,
    }),
    [
      paddingHorizontal,
      gap,
      onEndReachedThreshold,
      includeFlexGrow,
      options.paddingTop,
      options.paddingBottom,
    ],
  );
};
