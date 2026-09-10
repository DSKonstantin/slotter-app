import React from "react";
import { Pressable, View } from "react-native";

import { Checkbox, Typography } from "@/src/components/ui";
import { MOCK_CLIENT_CATEGORIES } from "../broadcastMock";

type Props = {
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
};

export const CategoriesFilter = ({ value, onChange }: Props) => {
  const selected = value ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    onChange(next.length ? next : undefined);
  };

  return (
    <View className="mt-2">
      {MOCK_CLIENT_CATEGORIES.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => toggle(category.id)}
          className="min-h-[48px] flex-row items-center justify-between active:opacity-70"
        >
          <Typography className="text-body text-neutral-900">
            {category.label}
          </Typography>
          <Checkbox value={selected.includes(category.id)} pressable={false} />
        </Pressable>
      ))}
    </View>
  );
};
