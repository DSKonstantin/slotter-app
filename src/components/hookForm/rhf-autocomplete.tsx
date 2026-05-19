import { useController, useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { Autocomplete } from "@/src/components/ui/fields/Autocomplete";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";

type Item = { label: string; value: string };

type RHFAutocompleteProps = {
  name: string;
  items: Item[];
  label?: string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
};

export function RHFAutocomplete({
  name,
  items,
  label,
  placeholder,
  emptyText,
  disabled,
}: RHFAutocompleteProps) {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const dataSet = useMemo<AutocompleteItem[]>(
    () => items.map((i) => ({ id: i.value, title: i.label })),
    [items],
  );

  const initialItem = useMemo<AutocompleteItem | undefined>(
    () => (value ? dataSet.find((d) => d.id === value) : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <Autocomplete
      value={value ?? ""}
      label={label}
      error={error}
      disabled={disabled}
      dataSet={dataSet}
      initialItem={initialItem}
      placeholder={placeholder}
      emptyText={emptyText}
      onSelectItem={(item) => onChange(item?.id ?? null)}
    />
  );
}
