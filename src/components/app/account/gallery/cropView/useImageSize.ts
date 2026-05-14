import { useEffect, useState } from "react";
import { ImageManipulator } from "expo-image-manipulator";

type ImageSize = {
  width: number;
  height: number;
  uri: string;
};

type Result = {
  size: ImageSize | null;
  isLoading: boolean;
  error: Error | null;
};

export function useImageSize(uri?: string | null): Result {
  const [size, setSize] = useState<ImageSize | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!uri) {
      setSize(null);
      return;
    }

    let mounted = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await ImageManipulator.manipulate(uri).renderAsync();
        if (!mounted) return;
        setSize({
          width: result.width,
          height: result.height,
          uri,
        });
      } catch (e) {
        if (mounted) setError(e as Error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [uri]);

  return { size, isLoading, error };
}
