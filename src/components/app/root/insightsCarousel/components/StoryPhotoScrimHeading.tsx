import type { ReactNode } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Typography } from "@/src/components/ui";
import { StorySwipeArrow } from "./StorySwipeArrow";

type Props = {
  title: ReactNode;
  gradientHeight?: number;
  showSwipeArrow?: boolean;
};

export const StoryPhotoScrimHeading = ({
  title,
  gradientHeight = 280,
  showSwipeArrow = false,
}: Props) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["transparent", "rgba(17,17,17,0.85)"]}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: gradientHeight,
      }}
    >
      <View
        className="px-screen absolute bottom-0 left-0 right-0 gap-4"
        style={{ paddingBottom: bottom + 16 }}
      >
        <Typography weight="semibold" className="text-[38px] text-neutral-0">
          {title}
        </Typography>
        {showSwipeArrow && <StorySwipeArrow />}
      </View>
    </LinearGradient>
  );
};
