import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  // Если не передан — без верхнего паддинга (контент едет до самого верха,
  // как в ImageStoryScreen: полноэкранная картинка без явного paddingTop).
  // Если передан — добавляется к safe-area инсету сверху.
  paddingTop?: number;
  className?: string;
};

// Общая обёртка сторис-слайдов: flex-1 + safe-area-aware paddingTop. Держим
// в одном месте, чтобы каждый экран (educationPayments/*, ImageStoryScreen)
// не повторял useSafeAreaInsets() и одну и ту же арифметику паддинга.
export const StoryScreenLayout = ({
  children,
  paddingTop,
  className,
}: Props) => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      className={className ? `flex-1 ${className} gap-4` : "flex-1 gap-4"}
      style={{
        paddingTop: paddingTop !== undefined ? paddingTop + top : undefined,
      }}
    >
      {children}
    </View>
  );
};
