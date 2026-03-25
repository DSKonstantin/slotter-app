import type { User } from "@/src/store/redux/services/api-types/user";
import React, { useCallback, useState } from "react";
import { View, Image, StyleSheet, Text } from "react-native";
import type { NativeSyntheticEvent, TextLayoutEventData } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar } from "@/src/components/ui/Avatar";
import { Tag } from "@/src/components/ui/Tag";
import { Typography } from "@/src/components/ui/Typography";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { Badge } from "@/src/components/ui";

type Props = { user: User };

const AboutMe = ({ text }: { text: string }) => {
  const [truncatedText, setTruncatedText] = useState<string | null>(null);

  const onHiddenLayout = useCallback(
    (e: NativeSyntheticEvent<TextLayoutEventData>) => {
      const lines = e.nativeEvent.lines;
      if (lines.length <= 2) return;

      const twoLines = lines
        .slice(0, 2)
        .map((l) => l.text)
        .join("")
        .trimEnd();
      const lastSpace = twoLines.lastIndexOf(" ", twoLines.length - 4);
      setTruncatedText(
        twoLines.slice(0, lastSpace > 0 ? lastSpace : twoLines.length - 4),
      );
    },
    [],
  );

  return (
    <View style={{ maxWidth: 250 }}>
      <Text
        style={{ position: "absolute", opacity: 0 }}
        className="font-inter-regular text-caption"
        onTextLayout={onHiddenLayout}
      >
        {text}
      </Text>
      <Text className="font-inter-regular text-caption text-neutral-0">
        {truncatedText !== null ? truncatedText : text}
        {truncatedText !== null && (
          <Text className="font-inter-semibold text-caption text-neutral-300">
            {" "}
            ... Ещё
          </Text>
        )}
      </Text>
    </View>
  );
};

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
        </View>
      </View>
      {user.profession ? (
        <Badge title={user.profession} size="sm" variant="info" />
      ) : null}

      {user.about_me ? <AboutMe text={user.about_me} /> : null}

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
