import { ReactNode } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  contentBottomPadding = 100,
}: AuthScreenLayoutProps) {
  const Content = (
    <ScrollView
      className="flex-1 px-5"
      contentContainerStyle={{
        flexGrow: 1,
        paddingBottom: footer ? contentBottomPadding : 0,
      }}
      keyboardShouldPersistTaps="handled"
    >
      {header}
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1">
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {Content}
        </KeyboardAvoidingView>
      ) : (
        Content
      )}
      {footer && <View className="px-5">{footer}</View>}
    </SafeAreaView>
  );
}
