import { TextInput, TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
  return (
    <TextInput
      {...props}
      className="h-14 w-full rounded-xl bg-white px-4 text-base text-black"
      placeholderTextColor="#9CA3AF"
    />
  );
}
