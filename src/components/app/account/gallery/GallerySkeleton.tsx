import React from "react";
import { View } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { GAP, HORIZONTAL_PADDING, ITEM_HEIGHT, ITEM_WIDTH } from "./constants";

const CELL_COUNT = 8;

type Props = {
  topInset?: number;
};

const GallerySkeleton = ({ topInset = 0 }: Props) => (
  <View
    style={{
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: topInset,
    }}
  >
    {Array.from({ length: CELL_COUNT }).map((_, i) => (
      <View
        key={i}
        style={{
          marginBottom: GAP,
          marginRight: i % 2 === 0 ? GAP : 0,
        }}
      >
        <ContentLoader
          speed={1.2}
          width={ITEM_WIDTH}
          height={ITEM_HEIGHT}
          backgroundColor={colors.neutral[100]}
          foregroundColor="#F5F5FA"
        >
          <Rect
            x={0}
            y={0}
            rx={2}
            ry={2}
            width={ITEM_WIDTH}
            height={ITEM_HEIGHT}
          />
        </ContentLoader>
      </View>
    ))}
  </View>
);

export default React.memo(GallerySkeleton);
