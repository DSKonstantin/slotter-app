import { Stack } from "expo-router";

export default function ServicesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="[serviceId]" />
      <Stack.Screen name="categories/index" />
      <Stack.Screen name="categories/[categoryId]" />
    </Stack>
  );
}
