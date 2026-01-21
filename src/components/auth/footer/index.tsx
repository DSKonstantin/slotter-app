import React from "react";
import { Button } from "@/src/components/ui";

type AuthFooterProps = {
  onSubmit: () => void;
};

const AuthFooter = ({ onSubmit }: AuthFooterProps) => {
  return <Button title="Войти" onPress={onSubmit} />;
};

export default AuthFooter;
