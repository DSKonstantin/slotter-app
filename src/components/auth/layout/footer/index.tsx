import React from "react";
import { View } from "react-native";
import { Button } from "@/src/components/ui";

type AuthFooterAction = React.ComponentProps<typeof Button>;

type AuthFooterProps = {
  primary: AuthFooterAction;
  secondary?: AuthFooterAction;
};

const AuthFooter = ({ primary, secondary }: AuthFooterProps) => {
  return (
    <View className="gap-3">
      <Button {...primary} />
      {secondary && <Button {...secondary} />}
    </View>
  );
};

export default AuthFooter;
