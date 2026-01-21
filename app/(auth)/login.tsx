import React from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/header";
import Login from "@/src/components/auth/login";
import AuthFooter from "@/src/components/auth/footer";
import { FormProvider, useForm } from "react-hook-form";

type LoginFormValues = {
  phone: string;
};

function AuthLogin() {
  const methods = useForm<LoginFormValues>({
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("SUBMIT", data);
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        footer={<AuthFooter onSubmit={methods.handleSubmit(onSubmit)} />}
      >
        <Login />
      </AuthScreenLayout>
    </FormProvider>
  );
}

export default AuthLogin;
