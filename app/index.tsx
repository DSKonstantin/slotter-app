import { View } from "react-native";
import { Button } from "@/src/components/ui";
import { router } from "expo-router";

export default function Index() {
  return (
    <View className="mt-8 gap-2">
      <Button
        title="Войти / Зарегистрироваться"
        onPress={() => router.replace("/(auth)")}
      />
      <Button
        title="personal"
        onPress={() => router.replace("/(auth)/personal-information")}
      />

      <Button
        title="personal"
        variant="secondary"
        onPress={() => router.replace("/(auth)/personal-information")}
      />

      <Button
        title="clear"
        variant="clear"
        onPress={() => router.replace("/(auth)/personal-information")}
      />

      <Button
        title="clear"
        variant="accent"
        onPress={() => router.replace("/(auth)/personal-information")}
      />

      <View className="bg-primary-blue-100"></View>
    </View>
  );
}
