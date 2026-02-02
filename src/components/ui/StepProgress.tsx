import { View } from "react-native";
import { twMerge } from "tailwind-merge";

type StepProgressProps = {
  steps: number;
  currentStep: number;
};

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <View className="flex-row gap-2">
      {Array.from({ length: steps }).map((_, index) => {
        const isActive = index + 1 <= currentStep;

        return (
          <View
            key={index}
            className={twMerge(
              "h-2 flex-1 rounded-full",
              isActive ? "bg-primary-blue-500" : "bg-neutral-100",
            )}
          />
        );
      })}
    </View>
  );
}
