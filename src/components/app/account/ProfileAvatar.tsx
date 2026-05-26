import React from "react";
import { Pressable, View } from "react-native";
import { Avatar, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";

const ProfileAvatar = () => {
  const user = useAppSelector((s) => s.auth.user);

  return (
    <View className="items-center justify-center pt-4">
      <Pressable
        onPress={() => {
          router.push(Routers.app.account.personalInformation);
        }}
        className="active:opacity-70 justify-center items-center gap-2"
      >
        <Avatar
          uri={user?.avatar_url ?? undefined}
          name={[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
          size="xl"
        />

        <View className="gap-1">
          <Typography weight="semibold" className="text-display text-center">
            {[user?.first_name, user?.last_name].filter(Boolean).join(" ")}
          </Typography>
          <Typography className="text-caption text-neutral-500 text-center">
            {user?.profession ?? ""}
          </Typography>
        </View>
      </Pressable>
    </View>
  );
};

export default ProfileAvatar;
