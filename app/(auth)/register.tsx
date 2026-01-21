import React from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/header";

const AuthRegister = () => {
  return <AuthScreenLayout header={<AuthHeader />}></AuthScreenLayout>;
};

export default AuthRegister;
