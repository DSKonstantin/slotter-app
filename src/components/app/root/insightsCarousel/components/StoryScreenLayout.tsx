import { View, type StyleProp, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  paddingTop?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

export const StoryScreenLayout = ({
  children,
  paddingTop,
  className,
  style,
}: Props) => {
  const { top } = useSafeAreaInsets();

  return (
    <View
      className={className ? `flex-1 ${className} gap-4` : "flex-1 gap-4"}
      style={[
        {
          paddingTop: paddingTop !== undefined ? paddingTop + top : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
