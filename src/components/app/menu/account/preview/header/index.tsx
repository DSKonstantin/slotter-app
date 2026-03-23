import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@/src/components/ui/Avatar";
import { Tag } from "@/src/components/ui/Tag";
import { Typography } from "@/src/components/ui/Typography";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import type { User } from "@/src/store/redux/services/api-types/user";

type Props = { user: User };

type PreviewHeaderImageProps = { uri?: string };

export const PreviewHeaderImage = ({ uri }: PreviewHeaderImageProps) => (
  <>
    {uri ? (
      <Image source={{ uri }} className="absolute inset-0" resizeMode="cover" />
    ) : (
      <View className="absolute inset-0 bg-background-black" />
    )}
    <LinearGradient
      colors={["rgba(0,0,0,0.14)", "rgba(0,0,0,0.7)"]}
      locations={[0.5408, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  </>
);

export const PreviewHeaderContent = ({ user }: Props) => {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ");

  return (
    <View className="flex-1 justify-end px-screen gap-2 pb-6">
      <View className="flex-row items-center gap-4">
        <Avatar uri={user.avatar_url ?? undefined} name={fullName} size="lg" />
        <View className="flex-1 gap-1">
          <Typography weight="semibold" className="text-2xl text-neutral-0">
            {fullName || "Имя не указано"}
          </Typography>
          {user.profession ? (
            <Typography className="text-body text-neutral-400">
              {user.profession}
            </Typography>
          ) : null}
        </View>
      </View>

      {user.about_me ? (
        <View style={{ maxWidth: 250 }} className="gap-0.5">
          <Typography
            weight="regular"
            className="text-caption text-neutral-0"
            numberOfLines={2}
          >
            {user.about_me}
          </Typography>
          <Typography
            weight="semibold"
            className="text-caption text-neutral-300"
          >
            Ещё
          </Typography>
        </View>
      ) : null}

      {user.address ? (
        <Tag
          title={user.address}
          variant="default"
          size="sm"
          icon={<StSvg name="Pin_fill" size={16} color={colors.neutral[500]} />}
        />
      ) : null}
    </View>
  );
};
