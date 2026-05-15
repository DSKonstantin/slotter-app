import { Stack } from "expo-router";

export default function CreateSlotFlowLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="select-service" />

      <Stack.Screen name="create" />
    </Stack>
  );
}
