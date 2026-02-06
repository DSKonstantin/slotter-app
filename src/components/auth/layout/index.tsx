import { ReactNode } from "react";
import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type AuthScreenLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;

  avoidKeyboard?: boolean;
  contentBottomPadding?: number;
};

export function AuthScreenLayout({
  header,
  children,
  footer,
  avoidKeyboard = false,
}: AuthScreenLayoutProps) {
  const ScrollWrapper = avoidKeyboard ? KeyboardAwareScrollView : ScrollView;

  return (
    <SafeAreaView className="flex-1">
      <View className="px-screen py-2 bg-background">{header}</View>
      <ScrollWrapper
        className="flex-1 px-screen"
        {...(avoidKeyboard
          ? { bottomOffset: 20 }
          : {
              contentContainerStyle: {
                flex: 1,
              },
            })}
      >
        {children}
      </ScrollWrapper>
      {footer && <View className="px-screen py-2 bg-background">{footer}</View>}
    </SafeAreaView>
  );
}
