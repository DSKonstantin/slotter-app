import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldError } from "react-hook-form";

import { Autocomplete } from "@/src/components/ui";

type RHFAutocompleteProps = {
  name: string;
  label?: string;
  disabled?: boolean;
  hideErrorText?: boolean;
  placeholder?: string;
  // dataSet: AutocompleteItem[];
  dataSet: any;
};

export function RHFAutocomplete({
  name,
  label,
  disabled,
  hideErrorText,
  placeholder,
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
          dataSet={dataSet}
          error={error as FieldError}
          onSelectItem={(item) => {
            item && onChange(item.id);
          }}
        />
      )}
    />
  );
}
