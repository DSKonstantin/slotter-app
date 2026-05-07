import React, { type ReactNode } from "react";
import {
  FormProvider,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { useScrollToError } from "@/src/hooks/useScrollToError";

export type FormScroll = ReturnType<typeof useScrollToError>;

type RhfFormProviderProps<T extends FieldValues> = {
  methods: UseFormReturn<T>;
  offset?: number;
  children: ReactNode | ((scroll: FormScroll) => ReactNode);
};

export function RhfFormProvider<T extends FieldValues>({
  methods,
  offset = 80,
  children,
}: RhfFormProviderProps<T>) {
  const scroll = useScrollToError(offset);
  const { Provider: ScrollProvider } = scroll;

  return (
    <FormProvider {...methods}>
      <ScrollProvider>
        {typeof children === "function" ? children(scroll) : children}
      </ScrollProvider>
    </FormProvider>
  );
}
