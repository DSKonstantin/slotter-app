import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  label: string;
  icon?: string;
  active?: boolean;
  hasDot?: boolean;
  textClassName?: string;
};

export const StoryPill = ({
  label,
  icon,
  active = false,
  hasDot = false,
  textClassName,
}: Props) => {
  return (
    <View
      className={`flex-row items-center self-start gap-2 rounded-full px-3 py-2.5 ${
        active ? "bg-primary-green-500" : "bg-background"
      }`}
    >
      {icon && (
        <View className="relative">
          <StSvg
            name={icon}
            size={24}
            color={active ? colors.neutral[900] : colors.neutral[900]}
          />
          {hasDot && (
            <View
              className={`absolute -top-0.5 -left-0.5 h-[10px] w-[10px] rounded-full border-2 bg-accent-red-500 ${
                active ? "border-primary-green-500" : "border-neutral-100"
              }`}
            />
          )}
        </View>
      )}
      <Typography
        weight="semibold"
        className={
          textClassName ?? (active ? "text-neutral-900" : "text-neutral-900")
        }
      >
        {label}
      </Typography>
    </View>
  );
};
