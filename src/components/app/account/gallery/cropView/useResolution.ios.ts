import { useImageResolution } from "react-native-zoom-toolkit";

type UseResolutionResult = {
  resolution: { width: number; height: number } | null;
  isLoading: boolean;
};

export function useResolution(uri: string): UseResolutionResult {
  const { isFetching, resolution } = useImageResolution({ uri });
  return {
    resolution: resolution ?? null,
    isLoading: isFetching,
  };
}
