import React from "react";
import { Pressable, View } from "react-native";
import { Avatar, Typography } from "@/src/components/ui";
import { StSvg } from "@/src/components/ui/StSvg";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";

const MONTHS = [
  "января", "февраля", "марта", "апреля", "мая", "июня",
  "июля", "августа", "сентября", "октября", "ноября", "декабря",
];

const formatMemberSince = (createdAt: string | null | undefined): string => {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  return `Пользователь с ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

const ProfileAvatar = () => {
  const user = useAppSelector((s) => s.auth.user);

  const createdAt = user?.created_at;
  const displayName =
    user?.name || [user?.first_name, user?.last_name].filter(Boolean).join(" ");

  return (
    <Pressable
      onPress={() => router.push(Routers.app.account.personalInformation)}
      className="mx-screen bg-background-surface rounded-base active:opacity-70 flex-row items-center p-4 gap-3"
    >
      <View>
        <Avatar
          uri={user?.avatar_url ?? undefined}
          name={displayName}
          size="md"
        />
        <View className="absolute -bottom-2 left-4 bg-white rounded-full p-1">
          <StSvg name="Camera" size={14} color={colors.background.black} />
        </View>
      </View>

      <View className="flex-1 gap-0.5">
        <Typography weight="semibold" className="text-body">
          {displayName}
        </Typography>
        <Typography className="text-caption text-neutral-500">
          {formatMemberSince(createdAt)}
        </Typography>
      </View>
    </Pressable>
  );
};

export default ProfileAvatar;
