import type { ReactNode } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { twMerge } from "tailwind-merge";
import { Typography } from "@/src/components/ui";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  subtitleClassName?: string;
  style?: StyleProp<ViewStyle>;
};

export const StoryHeading = ({
  title,
  subtitle,
  className,
  subtitleClassName,
  style,
}: Props) => {
  return (
    <View className={twMerge("gap-2", className)} style={style}>
      <Typography weight="semibold" className="text-[24px]">
        {title}
      </Typography>
      {subtitle && (
        <Typography
          weight="medium"
          className={twMerge("text-body text-neutral-500", subtitleClassName)}
        >
          {subtitle}
        </Typography>
      )}
    </View>
  );
};
