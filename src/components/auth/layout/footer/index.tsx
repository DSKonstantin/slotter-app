import React from "react";
import { Button } from "@/src/components/ui";

type AuthFooterProps = {
  onSubmit: () => void;
  title: string;
  variant?: "primary" | "secondary" | "accent" | "clear";
  disabled?: boolean;
};

const AuthFooter = ({
  onSubmit,
  title,
  variant = "primary",
  disabled = false,
}: AuthFooterProps) => {
  return (
    <Button
      title={title}
      variant={variant}
      onPress={onSubmit}
      disabled={disabled}
      fullWidth
    />
  );
};

export default AuthFooter;
