import AuthHeader from "@/src/components/auth/header";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHome from "@/src/components/auth/home";
import { View } from "react-native";

export default function AuthIndex() {
  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="px-5">
        <AuthHeader showBack={false} />
      </View>
      <AuthHome />
    </SafeAreaView>
  );
}
