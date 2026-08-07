import { ReactNode, Ref, RefCallback } from "react";
import { View, ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import Animated from "react-native-reanimated";
import {
  CollapsibleHeader,
  useCollapsibleHeaderScroll,
} from "./collapsibleHeader";

type AuthScreenLayoutProps = {
  header?: ReactNode;
  collapsibleHeader?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;

  avoidKeyboard?: boolean;
  stickyFooter?: boolean;
  contentBottomPadding?: number;
  disableHorizontalPadding?: boolean;

  scrollRef?: RefCallback<ScrollView>;
  contentRef?: Ref<View>;
};

export function AuthScreenLayout({
  header,
  collapsibleHeader,
  children,
  footer,
  avoidKeyboard = false,
  stickyFooter = false,
  disableHorizontalPadding = false,
  scrollRef,
  contentRef,
}: AuthScreenLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const ScrollWrapper = avoidKeyboard
    ? KeyboardAwareScrollView
    : Animated.ScrollView;

  const { scrollY, maxScrollY, onScroll } = useCollapsibleHeaderScroll();

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="bg-background">
        {header && (
          <View className={`px-screen ${collapsibleHeader ? "pt-2" : "py-2"}`}>
            {header}
          </View>
        )}
        {collapsibleHeader && (
          <CollapsibleHeader
            scrollY={scrollY}
            maxScrollY={maxScrollY}
            hasHeaderAbove={!!header}
          >
            {collapsibleHeader}
          </CollapsibleHeader>
        )}
      </View>
      <ScrollWrapper
        ref={scrollRef as never}
        showsVerticalScrollIndicator={false}
        className={`flex-1${disableHorizontalPadding ? "" : " px-screen"}`}
        onScroll={collapsibleHeader ? onScroll : undefined}
        scrollEventThrottle={16}
        {...(avoidKeyboard
          ? { bottomOffset: 20 }
          : {
              contentContainerStyle: {
                flex: 1,
              },
            })}
      >
        <View className="flex-1" ref={contentRef} collapsable={false}>
          {children}
        </View>
      </ScrollWrapper>
      {footer && stickyFooter ? (
        <KeyboardStickyView
          offset={{ closed: 0, opened: bottom }}
          style={{ paddingBottom: bottom }}
        >
          <View className="px-screen pt-2 pb-[8px]">{footer}</View>
        </KeyboardStickyView>
      ) : footer ? (
        <View
          className="px-screen py-2 bg-background"
          style={{ paddingBottom: bottom + 8 }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
