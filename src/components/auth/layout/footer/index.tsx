import React from "react";
import { View } from "react-native";
import { Button } from "@/src/components/ui";

type AuthFooterAction = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "clear";
  disabled?: boolean;
};

type AuthFooterProps = {
  primary: AuthFooterAction;
  secondary?: AuthFooterAction;
};

const AuthFooter = ({ primary, secondary }: AuthFooterProps) => {
  return (
    <View className="gap-3">
      <Button
        title={primary.title}
        variant={primary.variant ?? "primary"}
        onPress={primary.onPress}
        disabled={primary.disabled}
      />

      {secondary && (
        <Button
          title={secondary.title}
          variant={secondary.variant ?? "clear"}
          onPress={secondary.onPress}
          disabled={secondary.disabled}
        />
      )}
    </View>
  );
};

export default AuthFooter;
