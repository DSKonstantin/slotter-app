import { View } from "react-native";
import { Button, StSvg } from "@/src/components/ui";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "@backpackapp-io/react-native-toast";
import { colors } from "@/src/styles/colors";

export default function Index() {
  return (
    <SafeAreaView className="mt-8 gap-2">
      <Button
        title="Войти / Зарегистрироваться"
        onPress={() => router.replace("/(auth)")}
      />
      <Button
        title="Персонал"
        onPress={() => router.replace("/(auth)/personal-information")}
      />

      <Button title="Tab" onPress={() => router.replace("/(tabs)/home")} />

      <Button
        title="Success"
        variant="secondary"
        onPress={() => {
          toast.success("Success!", {
            icon: (
              <StSvg name="Expand_left" size={24} color={colors.neutral[900]} />
            ),
            isSwipeable: true,
            onHide: (_, reason) => console.log("toast closed:", reason),
          });
        }}
      />

      <Button
        title="Error"
        variant="secondary"
        onPress={() => {
          toast.error("Wow. That Sucked!");
        }}
      />

      <Button
        title="Loading"
        variant="secondary"
        onPress={() => {
          toast.loading("I am loading. Dismiss me whenever...");
        }}
      />

      <View className="bg-primary-blue-100"></View>
    </SafeAreaView>
  );
}
