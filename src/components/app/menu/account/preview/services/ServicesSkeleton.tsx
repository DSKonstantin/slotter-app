import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";

const CARD_WIDTH = 187;
const CARD_HEIGHT = 187;

const ServiceCardSkeleton = () => {
  const height = CARD_HEIGHT + 60;

  return (
    <ContentLoader
      width={CARD_WIDTH}
      height={height}
      backgroundColor={colors.neutral[200]}
      foregroundColor={colors.neutral[100]}
    >
      {/* Image */}
      <Rect
        x="0"
        y="0"
        rx="20"
        ry="20"
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
      />
      {/* Title */}
      <Rect x="4" y={CARD_HEIGHT + 8} rx="6" ry="6" width="140" height="14" />
      {/* Subtitle line 1 */}
      <Rect x="4" y={CARD_HEIGHT + 28} rx="6" ry="6" width="100" height="12" />
      {/* Subtitle line 2 */}
      <Rect x="4" y={CARD_HEIGHT + 46} rx="6" ry="6" width="80" height="12" />
    </ContentLoader>
  );
};

const ServicesSkeleton = () => (
  <View className="gap-2">
    <View className="flex-row justify-between mx-screen">
      <ContentLoader
        width={64}
        height={16}
        backgroundColor={colors.neutral[200]}
        foregroundColor={colors.neutral[100]}
      >
        <Rect x="0" y="0" rx="8" ry="8" width="64" height="16" />
      </ContentLoader>
    </View>
    <View className="flex-row gap-4 pl-screen">
      <ServiceCardSkeleton />
      <ServiceCardSkeleton />
    </View>
  </View>
);

export default ServicesSkeleton;
