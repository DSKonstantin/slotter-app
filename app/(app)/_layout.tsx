import { Redirect, Slot } from "expo-router";
import { useAuth } from "@/src/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";
import { Routers } from "@/src/constants/routers";

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  // 1. Show a loading spinner while we check for authentication.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // 2. If the user is not authenticated, redirect to the login screen.
  if (!user) {
    return <Redirect href={Routers.auth.root} />;
  }

  // 3. If the user is authenticated, render the child routes.
  // This will render the navigator defined in the child layout (e.g., the app layout).
  return <Slot />;
}
