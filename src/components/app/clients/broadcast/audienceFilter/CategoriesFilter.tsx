import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { skipToken } from "@reduxjs/toolkit/query";

import { Checkbox, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetCustomerTagsQuery } from "@/src/store/redux/services/api/customersApi";

type Props = {
  value: string[] | undefined;
  onChange: (value: string[] | undefined) => void;
};

export const CategoriesFilter = ({ value, onChange }: Props) => {
  const auth = useRequiredAuth();
  const { data, isLoading } = useGetCustomerTagsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const selected = value ?? [];

  const toggle = (id: string) => {
    const next = selected.includes(id)
      ? selected.filter((item) => item !== id)
      : [...selected, id];
    onChange(next.length ? next : undefined);
  };

  if (isLoading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color={colors.neutral[400]} />
      </View>
    );
  }

  return (
    <View className="mt-2">
      {(data?.customer_tags ?? []).map((tag) => {
        const id = String(tag.id);
        return (
          <Pressable
            key={id}
            onPress={() => toggle(id)}
            className="min-h-[48px] flex-row items-center justify-between active:opacity-70"
          >
            <Typography className="text-body text-neutral-900">
              {tag.name}
            </Typography>
            <Checkbox value={selected.includes(id)} pressable={false} />
          </Pressable>
        );
      })}
    </View>
  );
};
