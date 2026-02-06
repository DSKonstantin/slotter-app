import type { PropsWithChildren, ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollOffset,
} from "react-native-reanimated";

// import { ThemedView } from "./themed-view";
// import { useColorScheme } from "@/src/hooks/use-color-scheme";
// import { useThemeColor } from "@/src/hooks/use-theme-color";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const HEADER_HEIGHT = 522;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  headerHeight?: number;
  contentInset?: {
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
  };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  headerHeight = 360,
  contentInset = {},
}: Props) {
  // const backgroundColor = useThemeColor({}, "background");
  // const colorScheme = useColorScheme() ?? "light";
  const colorScheme = "light";
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollOffset(scrollRef);
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <Animated.ScrollView
      ref={scrollRef}
      style={{
        // backgroundColor,
        flex: 1,
        // backgroundColor: colors.background.black,
        marginTop: contentInset.top ?? 0,
        // backgroundColor: "green",
      }}
      contentContainerStyle={{
        backgroundColor: colors.background.DEFAULT,
      }}
      scrollEventThrottle={16}
    >
      <Animated.View
        style={[
          styles.header,
          {
            height: headerHeight,
            backgroundColor: headerBackgroundColor[colorScheme],
          },
          headerAnimatedStyle,
        ]}
      >
        {headerImage}
      </Animated.View>
      <View
        style={[
          styles.content,
          {
            paddingLeft: contentInset?.left ?? 0,
            paddingRight: contentInset?.right ?? 0,
            paddingBottom: contentInset?.bottom ?? 0,
          },
        ]}
      >
        {children}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // overflow: "hidden",
    paddingBottom: 36,
    marginBottom: -36,
  },
  content: {
    borderTopRightRadius: 36,
    borderTopLeftRadius: 36,
    // overflow: "hidden",
    backgroundColor: colors.background.DEFAULT,
  },
});
