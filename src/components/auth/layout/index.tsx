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
      <ScrollWrapper
        className="flex-1 px-5"
        {...(avoidKeyboard
          ? { bottomOffset: 20 }
          : {
              contentContainerStyle: {
                flex: 1,
              },
            })}
      >
        {header}
        {children}
      </ScrollWrapper>
      {footer && <View className="px-5 py-2 bg-background">{footer}</View>}
    </SafeAreaView>
  );
}
