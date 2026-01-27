import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { FieldError } from "react-hook-form";

import { Autocomplete } from "@/src/components/ui";

type RHFAutocompleteProps = {
  name: string;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  // dataSet: AutocompleteItem[];
  dataSet: any;
};

export function RHFAutocomplete({
  name,
  label,
  disabled,
  placeholder,
  dataSet,
}: RHFAutocompleteProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange }, fieldState: { error } }) => (
        <Autocomplete
          label={label}
          disabled={disabled}
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

