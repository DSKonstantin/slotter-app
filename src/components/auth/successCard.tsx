import { View, Text } from "react-native";
import { Button } from "@/src/components/ui";

type SuccessCardProps = {
  title: string;
  onContinue: () => void;
};

export function SuccessCard({ title, onContinue }: SuccessCardProps) {
  return (
    <View className="w-full items-center">
      <Text className="text-2xl">Готово</Text>
      <View className="my-4 h-16 w-16 items-center justify-center rounded-full border border-gray-300">
        <Text className="text-2xl">✓</Text>
      </View>

      <Text className="mb-6 text-center text-lg font-semibold">{title}</Text>

      <Button title="Продолжить" onPress={onContinue} />
    </View>
  );
}
