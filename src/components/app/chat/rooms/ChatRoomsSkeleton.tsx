import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";

const H_PAD = 20;
const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const AVATAR = 48;
const ITEM_H = 72;
const GAP = 0;
const COUNT = 7;
const RADIUS = 8;

type Props = { topInset?: number };

const ChatRoomsSkeleton = ({ topInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - H_PAD * 2;
  const textX = AVATAR + 12;
  const textW = w - textX;
  const totalH = COUNT * (ITEM_H + GAP);

  return (
    <ScrollView
      scrollEnabled={false}
      contentContainerStyle={{
        paddingHorizontal: H_PAD,
        paddingTop: topInset + 12,
      }}
    >
      {/* Room items skeleton */}
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {Array.from({ length: COUNT }).map((_, i) => {
          const y = i * (ITEM_H + GAP);
          const cy = y + ITEM_H / 2;
          return (
            <React.Fragment key={i}>
              <Circle cx={AVATAR / 2} cy={cy} r={AVATAR / 2} />
              {/* Name */}
              <Rect
                x={textX}
                y={cy - 18}
                rx={RADIUS}
                ry={RADIUS}
                width={120 + (i % 2) * 30}
                height={14}
              />
              {/* Last message */}
              <Rect
                x={textX}
                y={cy + 2}
                rx={RADIUS}
                ry={RADIUS}
                width={textW - 60}
                height={12}
              />
              {/* Time */}
              <Rect
                x={w - 36}
                y={cy - 18}
                rx={4}
                ry={4}
                width={36}
                height={12}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </ScrollView>
  );
};

export default ChatRoomsSkeleton;
