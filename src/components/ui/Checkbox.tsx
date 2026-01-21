import { Pressable, View } from "react-native";

type CheckboxProps = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export function Checkbox({ value, onChange }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      className="h-5 w-5 items-center justify-center rounded border border-gray-400"
    >
      {value && <View className="h-3 w-3 rounded bg-black" />}
    </Pressable>
  );
}
