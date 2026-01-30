import { View } from "react-native";
import { Button } from "@/src/components/ui";
import { router } from "expo-router";
import Test from "@/src/components/ui/fields/Test";

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

      <Test />
    </View>
  );
}
