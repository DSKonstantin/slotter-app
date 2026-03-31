import { View } from "react-native";
import { twMerge } from "tailwind-merge";

type BottomSheetHandleProps = {
  className?: string;
  indicatorClassName?: string;
};

export function BottomSheetHandle({
  className,
  indicatorClassName,
}: BottomSheetHandleProps) {
  return (
    <View className={twMerge("items-center mb-3", className)}>
      <View
        className={twMerge(
          "w-[83px] h-1 rounded-large bg-[#78788029]",
          indicatorClassName,
        )}
      />
    </View>
  );
}
