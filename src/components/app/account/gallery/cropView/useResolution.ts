import { useImageSize } from "./useImageSize";

type UseResolutionResult = {
  resolution: { width: number; height: number } | null;
  isLoading: boolean;
};

// Metro resolves .ios.ts / .android.ts at runtime; this file is used by TypeScript only.
export function useResolution(uri: string): UseResolutionResult {
  const { size, isLoading } = useImageSize(uri);
  return {
    resolution: size ? { width: size.width, height: size.height } : null,
    isLoading,
  };
}
