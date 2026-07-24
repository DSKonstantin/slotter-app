import type { ReactNode } from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";

type Props = {
  // Обычно строка с "\n" для переносов; там, где в референсе был эмодзи —
  // передавайте вместо него инлайновую иконку, см. fillProfile/three,
  // fillProfile/four: <StoryInlineIcon name="..." /> рядом с текстом внутри
  // фрагмента.
  title: ReactNode;
  // Обычно строка; там, где в референсе часть текста жирная (см.
  // notification/two) — оберните этот кусок в <Typography weight="semibold"
  // className="text-neutral-900">, остальное останется обычным.
  subtitle?: ReactNode;
};

// Заголовок + опциональный подзаголовок под рядом вкладок (см.
// assets/images/history/training/*) — стили те же, что и в hero-заголовках
// онбординга (text-display/semibold + text-body/neutral-500), чтобы сторис не
// заводили свою собственную типографику.
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
