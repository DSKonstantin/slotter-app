import {
  toast as rnToast,
  resolveValue,
  type Toast as LibToast,
} from "@backpackapp-io/react-native-toast";
import { createElement } from "react";
import { ToastCard } from "./ToastCard";

export type ToastVariant = "success" | "error" | "loading" | "security";

export type ToastOptions = {
  id?: string;
};

const HOLD_MS: Record<ToastVariant, number> = {
  success: 2200,
  security: 2200,
  error: 4000,
  loading: Infinity,
};

const getOptions = (variant: ToastVariant) => ({
  duration: HOLD_MS[variant],
  disableShadow: true,
  customToast: (t: LibToast) => {
    const resolved = resolveValue(t.message, t);
    return createElement(ToastCard, {
      variant,
      message: typeof resolved === "string" ? resolved : "",
    });
  },
});

const show = (variant: ToastVariant, message: string, opts?: ToastOptions) =>
  rnToast(message, { ...getOptions(variant), ...opts });

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
      disableShadow: true,
      loading: getOptions("loading"),
      success: getOptions("success"),
      error: getOptions("error"),
    }),
};
