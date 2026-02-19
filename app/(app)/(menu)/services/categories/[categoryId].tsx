import React from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

const CategoryEditPage = () => {
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Stack.Screen options={{ title: `Категория #${categoryId}` }} />
      <Text>Страница редактирования категории</Text>
      <Text>ID: {categoryId}</Text>
    </View>
  );
};

export default CategoryEditPage;
