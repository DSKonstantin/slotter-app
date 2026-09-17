import type { ReactNode } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  gradientHeight?: number;
  swipeLabel?: string;
};

export const StoryTopScrimHeading = ({
  title,
  subtitle,
  gradientHeight = 260,
  swipeLabel,
}: Props) => {
  const { top } = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["rgba(17,17,17,0.85)", "transparent"]}
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        height: gradientHeight,
      }}
    >
      <View className="px-screen gap-2" style={{ paddingTop: top + 68 }}>
        <Typography weight="semibold" className="text-[28px] text-neutral-0">
          {title}
        </Typography>
        {subtitle && (
          <Typography weight="medium" className="text-body text-neutral-200">
            {subtitle}
          </Typography>
        )}
        {swipeLabel && (
          <View className="flex-row items-center self-start gap-1 mt-1">
            <Typography weight="semibold" className="text-body text-neutral-0">
              {swipeLabel}
            </Typography>
            <StSvg name="Arrow_right" size={18} color={colors.neutral[0]} />
          </View>
        )}
      </View>
    </LinearGradient>
  );
};
