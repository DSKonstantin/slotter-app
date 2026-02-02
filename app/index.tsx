import { View, StyleSheet } from "react-native";
import { Button } from "@/src/components/ui";
import { router } from "expo-router";
import TimePicker from "@/src/components/ui/fields/Test";
import { useState } from "react";
import { Image } from "expo-image";
import { GlassContainer, GlassView } from "expo-glass-effect";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const [time, setTime] = useState("09:30");

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

      <View className="bg-primary-blue-100">
        <TimePicker />
      </View>
    </View>
  );
}
