import { Stack } from "expo-router";

export default function ServicesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="service/[serviceId]" />
      <Stack.Screen name="service/edit" />
      <Stack.Screen name="categories" />
    </Stack>
  );
}
