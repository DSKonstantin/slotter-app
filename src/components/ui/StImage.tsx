import React, { useMemo, useState } from "react";
import { Image, type ImageProps, type ImageSource } from "expo-image";

type StImageProps = Omit<ImageProps, "source" | "placeholder"> & {
  uri: string;
  blurhash?: string | null;
  fallback?: ImageSource;
};

const DEFAULT_FALLBACK = require("@/assets/images/placeholders/placeholder-slotter.png");

export function StImage({
  uri,
  blurhash,
  fallback = DEFAULT_FALLBACK,
  ...rest
}: StImageProps) {
  const [error, setError] = useState(false);

  const imageSource = useMemo(() => {
    if (!uri || error) {
      return fallback;
    }

    return uri;
  }, [uri, error, fallback]);

  return (
    <Image
      source={imageSource}
      placeholder={blurhash ? { blurhash } : undefined}
      onError={() => setError(true)}
      contentFit="cover"
      {...rest}
    />
  );
}
