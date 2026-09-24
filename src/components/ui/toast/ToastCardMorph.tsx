import { useEffect, useRef, useState } from "react";
import {
  Easing,
  runOnJS,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ToastCard } from "./ToastCard";
import type { ToastVariant } from "./types";

const MORPH_FADE_MS = 140;

type ToastCardMorphProps = {
  variant: ToastVariant;
  message: string;
};

export function ToastCardMorph({ variant, message }: ToastCardMorphProps) {
  const contentOpacity = useSharedValue(1);
  const shown = useRef({ variant, message });
  const [rendered, setRendered] = useState(shown.current);

  useEffect(() => {
    const prev = shown.current;
    shown.current = { variant, message };
    if (prev.variant === variant && prev.message === message) return;

    contentOpacity.value = withTiming(
      0,
      { duration: MORPH_FADE_MS, easing: Easing.linear },
      (finished) => {
        if (!finished) return;
        runOnJS(setRendered)({ variant, message });
        contentOpacity.value = withTiming(1, {
          duration: MORPH_FADE_MS,
          easing: Easing.linear,
        });
      },
    );
  }, [variant, message, contentOpacity]);

  return (
    <ToastCard
      variant={rendered.variant}
      message={rendered.message}
      contentOpacity={contentOpacity}
    />
  );
}
