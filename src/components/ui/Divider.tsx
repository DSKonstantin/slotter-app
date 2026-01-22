import { View } from "react-native";
import { twMerge } from "tailwind-merge";

type DividerProps = {
  vertical?: boolean;
  className?: string;
};

export function Divider({ vertical, className }: DividerProps) {
  return (
    <View
      className={twMerge(
        vertical
          ? "w-px self-stretch bg-gray-separators"
          : "h-px w-full bg-gray-separators",
        className,
      )}
    />
  );
}
