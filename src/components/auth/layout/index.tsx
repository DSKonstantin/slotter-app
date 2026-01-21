import { ReactNode } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type AuthScreenLayoutProps = {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScreenLayout({
  header,
  children,
  footer,
}: AuthScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {header}
          {children}
        </ScrollView>

        {footer && <View className="px-5">{footer}</View>}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
