import React from "react";
import { Pressable, View } from "react-native";
import { Avatar, StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";
import { colors } from "@/src/styles/colors";

const ProfileAvatar = () => {
  const user = useAppSelector((s) => s.auth.user);
  const hasProAccess = user?.subscription_membership?.pro_access ?? false;

  return (
    <View className="items-center justify-center pt-4">
      <Pressable
        onPress={() => {
          router.push(Routers.app.account.personalInformation);
        }}
        className="active:opacity-70 justify-center items-center gap-4"
      >
        <View className="relative">
          <Avatar
            uri={user?.avatar_url ?? undefined}
            name={[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
            size="xl"
          />

          <View className="absolute -bottom-2 left-1">
            {hasProAccess ? (
              <View className="flex-row items-center gap-0.5 bg-primary-green-500 rounded-full px-2 py-0.5 border-[3px] border-background">
                <StSvg
                  name="Star_alt_fill"
                  size={16}
                  color={colors.neutral[900]}
                />
                <Typography
                  weight="semibold"
                  className="text-caption text-neutral-900"
                >
                  PRO
                </Typography>
              </View>
            ) : (
              <View className="bg-neutral-100 rounded-full px-2.5 py-0.5 border-[3px] border-background">
                <Typography
                  weight="semibold"
                  className="text-caption text-neutral-900"
                >
                  Старт
                </Typography>
              </View>
            )}
          </View>
        </View>

        <View className="gap-1">
          <View className="flex-row gap-1 items-center">
            <Typography weight="semibold" className="text-display text-center">
              {[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
            </Typography>
            <StSvg
              name="Expand_right_light"
              size={24}
              color={colors.neutral[500]}
            />
          </View>

          <Typography className="text-caption text-neutral-500 text-center">
            {[user?.nickname ? `${user.nickname}` : null, user?.profession]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        </View>
      </Pressable>
    </View>
  );
};

export default ProfileAvatar;
