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

type Props = PropsWithChildren<{
  headerImage?: ReactElement;
  headerContent?: ReactElement;
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
  headerContent,
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
            [-headerHeight, 0, headerHeight],
            [-headerHeight / 2, 0, headerHeight * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-headerHeight, 0, headerHeight],
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
      }}
      contentContainerStyle={{
        backgroundColor: colors.background.DEFAULT,
      }}
      scrollEventThrottle={16}
    >
      <View
        className="relative"
        style={[styles.header, { height: headerHeight }]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              height: headerHeight,
              backgroundColor: headerBackgroundColor[colorScheme],
            },
            headerAnimatedStyle,
          ]}
        >
          {headerImage && headerImage}
        </Animated.View>
        {headerContent && headerContent}
      </View>

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
