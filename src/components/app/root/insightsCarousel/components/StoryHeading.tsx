import type { ReactNode } from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
};

export const StoryHeading = ({ title, subtitle }: Props) => {
  return (
    <View className="gap-2">
      <Typography weight="semibold" className="text-[24px]">
        {title}
      </Typography>
      {subtitle && (
        <Typography weight="medium" className="text-body text-neutral-500">
          {subtitle}
        </Typography>
      )}
    </View>
  );
};
