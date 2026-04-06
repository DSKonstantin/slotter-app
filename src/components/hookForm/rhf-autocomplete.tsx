import React, { ReactNode } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldError } from "react-hook-form";

import { Autocomplete } from "@/src/components/ui";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";

type RHFAutocompleteProps = {
  name: string;
  label?: string;
  disabled?: boolean;
  hideErrorText?: boolean;
  placeholder?: string;
  startAdornment?: ReactNode;
  initialItem?: AutocompleteItem;
  // dataSet: AutocompleteItem[];
  dataSet: any;
};

export function RHFAutocomplete({
  name,
  label,
  disabled,
  hideErrorText,
  placeholder,
  startAdornment,
  initialItem,
  dataSet,
}: RHFAutocompleteProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Autocomplete
          value={value}
          label={label}
          disabled={disabled}
          hideErrorText={hideErrorText}
          placeholder={placeholder}
          startAdornment={startAdornment}
          initialItem={initialItem}
          dataSet={dataSet}
          error={error as FieldError}
          onChangeText={(text) => {
            if (!text?.trim()) onChange(undefined);
          }}
          onSelectItem={(item) => {
            item && onChange(item.id);
          }}
        />
      )}
    />
  );
}
