import { Href, router } from "expo-router";

export const useSafeBack = (fallbackHref?: Href) => {
  return () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    if (fallbackHref) {
      router.replace(fallbackHref);
    }
  };
};
