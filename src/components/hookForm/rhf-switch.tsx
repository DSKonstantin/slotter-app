import { useFormContext, Controller } from "react-hook-form";
import { Switch } from "@/src/components/ui";

type RHFSwitchProps = {
  name: string;
  disabled?: boolean;
};

export default function RHFSwitch({ name, disabled }: RHFSwitchProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Switch
          value={!!field.value}
          onChange={field.onChange}
          disabled={disabled}
        />
      )}
    />
  );
}
