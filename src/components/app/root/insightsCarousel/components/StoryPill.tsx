import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  label: string;
  icon?: string;
  active?: boolean;
  // Красная точка-индикатор поверх иконки (см. "График" на
  // assets/images/history/training/three.webp).
  hasDot?: boolean;
  // Оверрайд цвета текста (className), по умолчанию — от active.
  textClassName?: string;
};

// Пилюля-иконка+текст: активная (акцентный зелёный фон, чёрный semibold
// текст) или неактивная (блёклый серый фон и текст). Общий строительный
// блок для StoryAppTabsBar (ряд вкладок) и одиночных бейджей поверх фото —
// self-start встроен сюда, чтобы пилюля не растягивалась на всю ширину
// родителя-колонки (в flex-row вкладок он ни на что не влияет).
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
