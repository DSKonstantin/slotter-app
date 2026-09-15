import React from "react";
import { Pressable, View } from "react-native";
import { Image, type ImageSource } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

import { Typography } from "@/src/components/ui";

export type InsightCategory =
  "analytics" | "tip" | "reminder" | "update" | "offer" | "event" | "education";

export const CARD_WIDTH = 115;
export const CARD_HEIGHT = 125;

type Props = {
  category: InsightCategory;
  title: string;
  imageSource?: ImageSource | number;
  onPress: () => void;
};

const InsightCard = ({ title, imageSource, onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="rounded-base overflow-hidden active:opacity-90"
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      ) : (
        <View className="w-full h-full bg-neutral-200" />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.7)", "rgba(0,0,0,0)"]}
        locations={[0, 0.226, 0.6298]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <View className="absolute top-0 left-0 right-0 p-3">
        <Typography
          weight="semibold"
          className="text-caption leading-4 tracking-tight text-neutral-0"
          numberOfLines={4}
        >
          {title}
        </Typography>
      </View>
    </Pressable>
  );
};

export default InsightCard;
