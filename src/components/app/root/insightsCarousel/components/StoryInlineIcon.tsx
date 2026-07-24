import { View } from "react-native";
import { StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  name: string;
  size?: "normal" | "large";
};

const ICON_SIZE = { normal: 20, large: 28 };
const BADGE_SIZE = { normal: 24, large: 32 };

// Иконка в зелёном квадрате — замена эмодзи-иконок из референсов (👤 💼 📈
// 📸 и т.д., см. assets/images/history/fill_profile/one.webp), кладётся
// прямо в children Typography как обычный инлайн-элемент (RN поддерживает
// произвольные View внутри Text). top — ручная подгонка: инлайн-View внутри
// Text по умолчанию садится на baseline строки, а не по центру.
export const StoryInlineIcon = ({ name, size = "normal" }: Props) => {
  const iconSize = ICON_SIZE[size];
  const badgeSize = BADGE_SIZE[size];

  return (
    <View
      className="items-center justify-center rounded-lg bg-primary-green-500"
      style={{ width: badgeSize, height: badgeSize }}
    >
      <StSvg name={name} size={iconSize} color={colors.neutral[900]} />
    </View>
  );
};
