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
const BUTTON_HEIGHT = 48;
const BUTTON_GAP_X = 10;
const BUTTONS_BOTTOM = 8;
const BUTTONS_BLOCK_H = BUTTON_HEIGHT + BUTTONS_BOTTOM;

type Props = { bottomInset?: number };

const ClientsListSkeleton = ({ bottomInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const totalH = BUTTONS_BLOCK_H + COUNT * ROW_HEIGHT + (COUNT - 1) * ROW_GAP;
  const buttonW = (w - BUTTON_GAP_X) / 2;

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
        <Rect
          x={0}
          y={0}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={buttonW}
          height={BUTTON_HEIGHT}
        />
        <Rect
          x={buttonW + BUTTON_GAP_X}
          y={0}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={buttonW}
          height={BUTTON_HEIGHT}
        />
        {Array.from({ length: COUNT }).map((_, i) => {
          const y = BUTTONS_BLOCK_H + i * (ROW_HEIGHT + ROW_GAP);
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
