import { ReactNode, Ref } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type AuthScreenLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;

  avoidKeyboard?: boolean;
  contentBottomPadding?: number;

  scrollRef?: (ref: any) => void;
  contentRef?: Ref<View>;
};

export function AuthScreenLayout({
  header,
  children,
  footer,
  avoidKeyboard = false,
  scrollRef,
  contentRef,
}: AuthScreenLayoutProps) {
  const ScrollWrapper = avoidKeyboard ? KeyboardAwareScrollView : ScrollView;

  return (
    <SafeAreaView className="flex-1">
      <View className="px-screen py-2 bg-background">{header}</View>
      <ScrollWrapper
        ref={scrollRef as never}
        className="flex-1 px-screen"
        {...(avoidKeyboard
          ? { bottomOffset: 20 }
          : {
              contentContainerStyle: {
                flex: 1,
              },
            })}
      >
        <View ref={contentRef} collapsable={false}>
          {children}
        </View>
      </ScrollWrapper>
      {footer && <View className="px-screen py-2 bg-background">{footer}</View>}
    </SafeAreaView>
  );
}
