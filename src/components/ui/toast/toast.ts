import {
  toast as rnToast,
  resolveValue,
  ToastPosition,
  type Toast as LibToast,
} from "@backpackapp-io/react-native-toast";
import { Easing } from "react-native-reanimated";
import { createElement } from "react";
import { ToastCardMorph } from "./ToastCardMorph";
import type { ToastOptions, ToastVariant } from "./types";

export type { ToastVariant, ToastOptions };

const HOLD_MS: Record<ToastVariant, number> = {
  success: 2200,
  security: 2200,
  error: 4000,
  loading: Infinity,
};

const COMMON = {
  position: ToastPosition.TOP,
  maxWidth: 356,
  animationType: "timing" as const,
  animationConfig: {
    duration: 420,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  },
  disableShadow: true,
};

function renderCard(variant: ToastVariant) {
  function CustomToast(t: LibToast) {
    const resolved = resolveValue(t.message, t);
    return createElement(ToastCardMorph, {
      variant,
      message: typeof resolved === "string" ? resolved : "",
    });
  }
  return CustomToast;
}

function show(variant: ToastVariant, message: string, opts?: ToastOptions) {
  return rnToast(message, {
    ...COMMON,
    duration: HOLD_MS[variant],
    customToast: renderCard(variant),
    ...opts,
  });
}

export const toast = {
  success: (message: string, opts?: ToastOptions) =>
    show("success", message, opts),
  error: (message: string, opts?: ToastOptions) => show("error", message, opts),
  loading: (message: string, opts?: ToastOptions) =>
    show("loading", message, opts),
  security: (message: string, opts?: ToastOptions) =>
    show("security", message, opts),
  dismiss: rnToast.dismiss,
  promise: <T>(
    promise: Promise<T>,
    msgs: {
      loading: string;
      success: string | ((value: T) => string);
      error: string | ((error: unknown) => string);
    },
  ): Promise<T> =>
    rnToast.promise(promise, msgs, {
      ...COMMON,
      loading: {
        duration: HOLD_MS.loading,
        customToast: renderCard("loading"),
      },
      success: {
        duration: HOLD_MS.success,
        customToast: renderCard("success"),
      },
      error: { duration: HOLD_MS.error, customToast: renderCard("error") },
    }),
};
