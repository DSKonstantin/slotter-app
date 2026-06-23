import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "@/src/components/ui";

type RhfCheckboxProps = {
  name: string;
  disabled?: boolean;
};

export default function RhfCheckbox({ name, disabled }: RhfCheckboxProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Checkbox
          value={!!field.value}
          onChange={(value) => field.onChange(value)}
          disabled={disabled}
        />
      )}
    />
  );
}
