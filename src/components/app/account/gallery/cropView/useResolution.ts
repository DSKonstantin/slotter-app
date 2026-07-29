import { useImageSize } from "./useImageSize";

type UseResolutionResult = {
  resolution: { width: number; height: number } | null;
  isLoading: boolean;
};

export function useResolution(uri: string): UseResolutionResult {
  const { size, isLoading } = useImageSize(uri);
  return {
    resolution: size ? { width: size.width, height: size.height } : null,
    isLoading,
  };
}
