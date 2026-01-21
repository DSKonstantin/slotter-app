import { View } from "react-native";
import { router } from "expo-router";
import { SuccessCard } from "@/src/components/auth/successCard";

export default function Success() {
  return (
    <View className="flex-1 px-5 pt-10">
      <SuccessCard
        title="Анна, вы успешно создали аккаунт"
        onContinue={() => router.replace("/")}
      />
    </View>
  );
}
