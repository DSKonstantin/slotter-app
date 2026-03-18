import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

import { colors } from "@/src/styles/colors";

const H_PAD = 20;
const CARD_PAD = 16;
// 15 (title) + 6 (gap) + 12 (subtitle)
const INNER_H = 33;
const LOADER_SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

type CardLoaderProps = {
  innerWidth: number;
  titleRatio?: number;
  subtitleRatio?: number;
  rightShape?: "icon" | "toggle";
};

const CardLoader = ({
  innerWidth,
  titleRatio = 0.62,
  subtitleRatio = 0.4,
  rightShape = "icon",
}: CardLoaderProps) => {
  const rightW = rightShape === "toggle" ? 38 : 20;
  const rightH = rightShape === "toggle" ? 22 : 20;
  const rightRx = rightShape === "toggle" ? 11 : 10;
  const textW = innerWidth - rightW - 12;
  const rightX = innerWidth - rightW;
  const rightY = (INNER_H - rightH) / 2;

  return (
    <View
      style={{
        backgroundColor: colors.background.surface,
        borderRadius: 20,
        padding: CARD_PAD,
      }}
    >
      <ContentLoader
        speed={LOADER_SPEED}
        width={innerWidth}
        height={INNER_H}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect
          x={0}
          y={0}
          rx={5}
          ry={5}
          width={Math.round(textW * titleRatio)}
          height={15}
        />
        <Rect
          x={0}
          y={21}
          rx={4}
          ry={4}
          width={Math.round(textW * subtitleRatio)}
          height={12}
        />
        <Rect
          x={rightX}
          y={rightY}
          rx={rightRx}
          ry={rightRx}
          width={rightW}
          height={rightH}
        />
      </ContentLoader>
    </View>
  );
};

const CategoryHeaderLoader = ({ contentWidth }: { contentWidth: number }) => (
  <ContentLoader
    speed={LOADER_SPEED}
    width={contentWidth}
    height={14}
    backgroundColor={BG}
    foregroundColor={FG}
  >
    <Rect
      x={0}
      y={1}
      rx={4}
      ry={4}
      width={Math.round(contentWidth * 0.35)}
      height={12}
    />
    <Rect
      x={contentWidth - Math.round(contentWidth * 0.22)}
      y={1}
      rx={4}
      ry={4}
      width={Math.round(contentWidth * 0.22)}
      height={12}
    />
  </ContentLoader>
);

const SERVICE_CATEGORIES = [
  [
    { titleRatio: 0.62, subtitleRatio: 0.42 },
    { titleRatio: 0.48, subtitleRatio: 0.35 },
    { titleRatio: 0.57, subtitleRatio: 0.44 },
  ],
  [
    { titleRatio: 0.52, subtitleRatio: 0.38 },
    { titleRatio: 0.65, subtitleRatio: 0.46 },
  ],
];

const ServiceListSkeletonComponent = () => {
  const { width } = useWindowDimensions();
  const contentWidth = width - H_PAD * 2;
  const innerWidth = contentWidth - CARD_PAD * 2;

  return (
    <View
      style={{ paddingHorizontal: H_PAD, gap: 24 }}
      accessibilityLabel="Loading services"
      accessible={true}
    >
      {SERVICE_CATEGORIES.map((cards, catIdx) => (
        <View key={catIdx} style={{ gap: 8 }}>
          <CategoryHeaderLoader contentWidth={contentWidth} />
          {cards.map((card, cardIdx) => (
            <CardLoader
              key={cardIdx}
              innerWidth={innerWidth}
              titleRatio={card.titleRatio}
              subtitleRatio={card.subtitleRatio}
              rightShape="icon"
            />
          ))}
        </View>
      ))}
    </View>
  );
};

export const ServiceListSkeleton = React.memo(ServiceListSkeletonComponent);

const ADDITIONAL_CARDS = [
  { titleRatio: 0.62, subtitleRatio: 0.4 },
  { titleRatio: 0.46, subtitleRatio: 0.33 },
  { titleRatio: 0.56, subtitleRatio: 0.42 },
  { titleRatio: 0.5, subtitleRatio: 0.36 },
];

const AdditionalListSkeletonComponent = () => {
  const { width } = useWindowDimensions();
  const innerWidth = width - H_PAD * 2 - CARD_PAD * 2;

  return (
    <View
      style={{ paddingHorizontal: H_PAD, gap: 8 }}
      accessibilityLabel="Loading additional services"
      accessible={true}
    >
      {ADDITIONAL_CARDS.map((card, i) => (
        <CardLoader
          key={i}
          innerWidth={innerWidth}
          titleRatio={card.titleRatio}
          subtitleRatio={card.subtitleRatio}
          rightShape="toggle"
        />
      ))}
    </View>
  );
};

export const AdditionalListSkeleton = React.memo(
  AdditionalListSkeletonComponent,
);
