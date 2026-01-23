import { View, Text, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button } from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";

export default function AuthConfirm() {
  const { phone } = useLocalSearchParams<{ phone?: string }>();

  return (
    <View className="flex-1 px-5 pt-10">
      <Text className="mb-2 text-xl font-semibold text-center">
        Подтверждение
      </Text>

      <Text className="mb-6 text-center text-gray-500">
        Мы отправили код на {phone}
      </Text>

      <OtpConfirm />

      <View className="mt-8">
        <Button
          title="Далее"
          onPress={() => router.replace("/(auth)/success")}
        />
      </View>

      <Text className="text-gray-500 mt-4 text-center">Не приходит SMS?</Text>
      <Text
        className="underline text-gray-500 text-center mt-1"
        onPress={() => Linking.openURL("#")}
      >
        Обратиться в поддержку
      </Text>
    </View>
  );
}
