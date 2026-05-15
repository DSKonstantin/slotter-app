import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const ROW_HEIGHT = 76;
const ROW_GAP = 8;
const COUNT = 3;
const CARD_PADDING = 16;
const AVATAR = 44;
const CARD_RADIUS = 20;
const TEXT_RADIUS = 8;

type Props = { bottomInset?: number };

const ClientsListSkeleton = ({ bottomInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const totalH = COUNT * ROW_HEIGHT + (COUNT - 1) * ROW_GAP;

  const avatarCx = CARD_PADDING + AVATAR / 2;
  const textX = CARD_PADDING + AVATAR + 12;

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingBottom: bottomInset + 8,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {Array.from({ length: COUNT }).map((_, i) => {
          const y = i * (ROW_HEIGHT + ROW_GAP);
          const cy = y + ROW_HEIGHT / 2;
          const titleW = 140 + (i % 2) * 30;
          const subtitleW = 80 + (i % 3) * 20;

          return (
            <React.Fragment key={i}>
              <Rect
                x={0}
                y={y}
                rx={CARD_RADIUS}
                ry={CARD_RADIUS}
                width={w}
                height={ROW_HEIGHT}
              />
              <Circle cx={avatarCx} cy={cy} r={AVATAR / 2} />
              <Rect
                x={textX}
                y={cy - 18}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={titleW}
                height={14}
              />
              <Rect
                x={textX}
                y={cy + 4}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={subtitleW}
                height={12}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </ScrollView>
  );
};

export default ClientsListSkeleton;
