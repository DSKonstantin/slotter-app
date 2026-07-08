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

type AuthScreenLayoutProps = {
  header?: ReactNode;
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
  children,
  footer,
  avoidKeyboard = false,
  stickyFooter = false,
  disableHorizontalPadding = false,
  scrollRef,
  contentRef,
}: AuthScreenLayoutProps) {
  const { bottom } = useSafeAreaInsets();
  const ScrollWrapper = avoidKeyboard ? KeyboardAwareScrollView : ScrollView;

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="px-screen py-2 bg-background">{header}</View>
      <ScrollWrapper
        ref={scrollRef as never}
        showsVerticalScrollIndicator={false}
        className={`flex-1${disableHorizontalPadding ? "" : " px-screen"}`}
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
          <View className="px-screen py-2">{footer}</View>
        </KeyboardStickyView>
      ) : footer ? (
        <View
          className="px-screen py-2 bg-background"
          style={{ paddingBottom: bottom }}
        >
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}
