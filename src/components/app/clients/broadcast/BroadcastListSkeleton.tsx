import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_PADDING = 16;
const CARD_RADIUS = 20;
const CARD_H = 156;
const CARD_GAP = 12;
const COUNT = 4;
const TEXT_RADIUS = 8;

const FILTERS_H = 36;
const FILTERS_GAP = 8;
const FILTERS_BOTTOM = 12;
const FILTERS_BLOCK_H = FILTERS_H + FILTERS_BOTTOM;

type Props = { topInset?: number };

const BroadcastListSkeleton = ({ topInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const totalH = FILTERS_BLOCK_H + COUNT * CARD_H + (COUNT - 1) * CARD_GAP;

  const filterWidths = [54, 176, 140];
  const filterXs = filterWidths.reduce<number[]>((acc, wd, i) => {
    const prevX = i === 0 ? 0 : acc[i - 1] + filterWidths[i - 1] + FILTERS_GAP;
    acc.push(prevX);
    return acc;
  }, []);

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingTop: topInset,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {filterWidths.map((fw, i) => (
          <Rect
            key={i}
            x={filterXs[i]}
            y={0}
            rx={FILTERS_H / 2}
            ry={FILTERS_H / 2}
            width={fw}
            height={FILTERS_H}
          />
        ))}

        {Array.from({ length: COUNT }).map((_, i) => {
          const y = FILTERS_BLOCK_H + i * (CARD_H + CARD_GAP);
          const iconCy = y + CARD_PADDING + 12;
          const footerCy = y + CARD_H - CARD_PADDING - 12;

          return (
            <React.Fragment key={i}>
              <Rect
                x={0}
                y={y}
                rx={CARD_RADIUS}
                ry={CARD_RADIUS}
                width={w}
                height={CARD_H}
              />

              <Circle cx={CARD_PADDING + 12} cy={iconCy} r={12} />
              <Rect
                x={CARD_PADDING + 36}
                y={iconCy - 7}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={120}
                height={14}
              />
              <Rect
                x={w - CARD_PADDING - 90}
                y={iconCy - 13}
                rx={13}
                ry={13}
                width={90}
                height={26}
              />

              <Rect
                x={CARD_PADDING}
                y={y + 68}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={180 - (i % 2) * 30}
                height={16}
              />
              <Rect
                x={CARD_PADDING}
                y={y + 92}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={240 - (i % 3) * 40}
                height={14}
              />

              <Circle cx={CARD_PADDING + 12} cy={footerCy} r={12} />
              <Rect
                x={CARD_PADDING + 32}
                y={footerCy - 6}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={140}
                height={12}
              />
              <Rect
                x={w - CARD_PADDING - 12}
                y={footerCy - 8}
                rx={4}
                ry={4}
                width={12}
                height={16}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </ScrollView>
  );
};

export default BroadcastListSkeleton;
