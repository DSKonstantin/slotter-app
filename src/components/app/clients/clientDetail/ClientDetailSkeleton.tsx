import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_RADIUS = 20;
const TEXT_RADIUS = 8;
const CARD_PADDING = 16;
const AVATAR = 44;

const INFO_HEIGHT = 92;
const CHAT_HEIGHT = 70;
const HOMECARD_HEIGHT = 110;
const ROW_GAP = 8;
const SECTION_GAP = 24;
const NOTES_LABEL_HEIGHT = 14;
const NOTES_INPUT_HEIGHT = 100;

type Props = { topInset?: number; bottomInset?: number };

const ClientDetailSkeleton = ({ topInset = 0, bottomInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const homeCardW = (w - ROW_GAP) / 2;

  const infoY = 0;
  const chatY = INFO_HEIGHT + ROW_GAP;
  const homeRow1Y = chatY + CHAT_HEIGHT + SECTION_GAP;
  const homeRow2Y = homeRow1Y + HOMECARD_HEIGHT + ROW_GAP;
  const notesLabelY = homeRow2Y + HOMECARD_HEIGHT + SECTION_GAP;
  const notesInputY = notesLabelY + NOTES_LABEL_HEIGHT + 8;
  const totalH = notesInputY + NOTES_INPUT_HEIGHT;

  const infoTextX = CARD_PADDING + AVATAR + 12;
  const infoCenterY = infoY + INFO_HEIGHT / 2;
  const chatTextX = CARD_PADDING + 24 + 12;
  const chatCenterY = chatY + CHAT_HEIGHT / 2;

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: topInset,
        paddingBottom: bottomInset + 8,
        paddingHorizontal: SCREEN_PADDING,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* ClientInfoCard */}
        <Rect
          x={0}
          y={infoY}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={w}
          height={INFO_HEIGHT}
        />
        <Circle
          cx={CARD_PADDING + AVATAR / 2}
          cy={infoCenterY}
          r={AVATAR / 2}
        />
        <Rect
          x={infoTextX}
          y={infoCenterY - 22}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={140}
          height={14}
        />
        <Rect
          x={infoTextX}
          y={infoCenterY - 2}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={100}
          height={12}
        />
        <Rect
          x={infoTextX}
          y={infoCenterY + 16}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={160}
          height={12}
        />

        {/* "Написать" card */}
        <Rect
          x={0}
          y={chatY}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={w}
          height={CHAT_HEIGHT}
        />
        <Rect
          x={CARD_PADDING}
          y={chatCenterY - 12}
          rx={4}
          ry={4}
          width={24}
          height={24}
        />
        <Rect
          x={chatTextX}
          y={chatCenterY - 14}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={100}
          height={14}
        />
        <Rect
          x={chatTextX}
          y={chatCenterY + 4}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={80}
          height={12}
        />

        {/* Home cards row 1 */}
        <Rect
          x={0}
          y={homeRow1Y}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={homeCardW}
          height={HOMECARD_HEIGHT}
        />
        <Rect
          x={homeCardW + ROW_GAP}
          y={homeRow1Y}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={homeCardW}
          height={HOMECARD_HEIGHT}
        />

        {/* Home cards row 2 */}
        <Rect
          x={0}
          y={homeRow2Y}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={homeCardW}
          height={HOMECARD_HEIGHT}
        />
        <Rect
          x={homeCardW + ROW_GAP}
          y={homeRow2Y}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={homeCardW}
          height={HOMECARD_HEIGHT}
        />

        {/* Notes label */}
        <Rect
          x={0}
          y={notesLabelY}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={70}
          height={NOTES_LABEL_HEIGHT}
        />

        {/* Notes input */}
        <Rect
          x={0}
          y={notesInputY}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={w}
          height={NOTES_INPUT_HEIGHT}
        />
      </ContentLoader>
    </ScrollView>
  );
};

export default ClientDetailSkeleton;
