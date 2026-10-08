import React from "react";
import { View } from "react-native";
import { Button, Typography } from "@/src/components/ui";
import { CallMethodSkeleton } from "@/src/components/auth/verify/CallMethodSkeleton";
import {
  CallSessionContent,
  type CallSessionContentProps,
} from "@/src/components/auth/verify/CallSessionContent";

type CallMethodProps = {
  session: CallSessionContentProps | null;
  onPress: () => void;
  pending?: boolean;
  disabled?: boolean;
};

export function CallMethod({
  session,
  onPress,
  pending = false,
  disabled = false,
}: CallMethodProps) {
  if (session) return <CallSessionContent {...session} />;
  if (pending) return <CallMethodSkeleton />;

  return (
    <View className="rounded-base bg-white p-4 flex-row items-center gap-3 mt-4">
      <View className="flex-1">
        <Typography className="text-caption text-neutral-500">
          Авторизоваться по звонку
        </Typography>
        <Typography weight="semibold" className="text-body">
          Номер для звонка
        </Typography>
      </View>
      <Button
        title="Получить"
        size="sm"
        buttonClassName="min-w-[96px] rounded-xl"
        buttonProps={{ accessibilityLabel: "Получить номер для звонка" }}
        disabled={disabled}
        onPress={onPress}
      />
    </View>
  );
}
