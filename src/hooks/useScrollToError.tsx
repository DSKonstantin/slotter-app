import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";

type Measurable = {
  measureLayout: (
    relativeToNativeNode: any,
    onSuccess: (x: number, y: number, w: number, h: number) => void,
    onFail?: () => void,
  ) => void;
};

type RegisterFn = (name: string) => (ref: Measurable | null) => void;
const FieldRegistryContext = createContext<RegisterFn | null>(null);

const ERROR_META = new Set(["ref", "message", "type", "types", "root"]);

const findFirstErrorPath = (err: unknown, prefix = ""): string | null => {
  if (!err || typeof err !== "object") return null;
  const e = err as Record<string, unknown>;

  if (Array.isArray(err)) {
    for (let i = 0; i < err.length; i += 1) {
      if (err[i] == null) continue;
      const next = prefix ? `${prefix}.${i}` : `${i}`;
      const found = findFirstErrorPath(err[i], next);
      if (found) return found;
    }
  } else {
    for (const key of Object.keys(e)) {
      if (ERROR_META.has(key)) continue;
      const next = prefix ? `${prefix}.${key}` : key;
      const found = findFirstErrorPath(e[key], next);
      if (found) return found;
    }
  }

  if (typeof e.message === "string") return prefix;

  return null;
};

export const useScrollToError = (offset = 80) => {
  const scrollRef = useRef<any>(null);
  const contentRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, Measurable | null>>({});

  const setScrollRef = useCallback((ref: any) => {
    scrollRef.current = ref;
  }, []);

  const registerField: RegisterFn = useCallback(
    (name: string) => (ref: Measurable | null) => {
      fieldRefs.current[name] = ref;
    },
    [],
  );

  const Provider = useMemo(() => {
    const ScrollToErrorProvider = ({ children }: PropsWithChildren) => (
      <FieldRegistryContext.Provider value={registerField}>
        {children}
      </FieldRegistryContext.Provider>
    );
    ScrollToErrorProvider.displayName = "ScrollToErrorProvider";
    return ScrollToErrorProvider;
  }, [registerField]);

  const scrollToError = useCallback(
    (errors: Record<string, any>) => {
      const path = findFirstErrorPath(errors);
      if (!path) return;

      let target = fieldRefs.current[path];
      if (!target) {
        const parts = path.split(".");
        while (parts.length > 0 && !target) {
          parts.pop();
          target = fieldRefs.current[parts.join(".")];
        }
      }

      const content = contentRef.current;
      if (!target || !content) return;

      target.measureLayout(
        content,
        (_x, y) => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, y - offset),
            animated: true,
          });
        },
        () => {},
      );
    },
    [offset],
  );

  return {
    setScrollRef,
    contentRef,
    registerField,
    scrollToError,
    Provider,
  };
};

export function useFieldAutoScroll(name: string) {
  const register = useContext(FieldRegistryContext);
  return useMemo(
    () => (register ? register(name) : () => {}),
    [register, name],
  );
}

export function useComposedFieldRef(
  name: string,
  fieldRef: React.Ref<unknown> | undefined,
) {
  const registerAutoScroll = useFieldAutoScroll(name);
  return useCallback(
    (node: Measurable | null) => {
      if (typeof fieldRef === "function") fieldRef(node);
      else if (fieldRef && typeof fieldRef === "object") {
        (fieldRef as React.MutableRefObject<unknown>).current = node;
      }
      registerAutoScroll(node);
    },
    [fieldRef, registerAutoScroll],
  );
}
