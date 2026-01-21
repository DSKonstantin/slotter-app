import { View } from "react-native";
import { Button, Input } from "@/src/components/ui";
import { router } from "expo-router";

export default function Index() {
  return (
    <View className="mt-8">
      <Input
        label="Label"
        placeholder="placeholder"
        error="error"
        startAdornment={<View className="w-3 h-3 bg-red-50" />}
        endAdornment={<View className="w-3 h-3 bg-red-50" />}
      />

      <Button
        title="Войти / Зарегистрироваться"
        onPress={() => router.replace("/(auth)")}
      />
    </View>
  );
}
