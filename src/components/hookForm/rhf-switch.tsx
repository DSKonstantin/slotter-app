import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/src/components/ui";

type RHFSwitchProps = {
  name: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
};

export default function RHFSwitch({
  name,
  disabled,
  onChange,
}: RHFSwitchProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Switch
          value={!!field.value}
          onChange={(value) => {
            field.onChange(value);
            onChange?.(value);
          }}
          disabled={disabled}
        />
      )}
    />
  );
}
