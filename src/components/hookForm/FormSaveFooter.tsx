import React from "react";
import { View } from "react-native";
import { useFormState } from "react-hook-form";

import { Button, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type FormSaveFooterProps = {
  onPress: () => void;
  bottomInset: number;
  title?: string;
  loading?: boolean;
  /** Override the dirty check (e.g. combine with non-RHF state). */
  dirty?: boolean;
};

export function FormSaveFooter({
  onPress,
  bottomInset,
  title = "Сохранить изменения",
  loading,
  dirty,
}: FormSaveFooterProps) {
  const { isDirty } = useFormState();

  if (!(dirty ?? isDirty)) return null;

  return (
    <View className="px-screen" style={{ paddingBottom: bottomInset + 8 }}>
      <Button
        title={title}
        onPress={onPress}
        loading={loading}
        disabled={loading}
        rightIcon={
          <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
        }
      />
    </View>
  );
}
