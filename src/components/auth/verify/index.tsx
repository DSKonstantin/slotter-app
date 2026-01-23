import * as Yup from "yup";
import React from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import AuthFooter from "@/src/components/auth/layout/footer";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Typography } from "@/src/components/ui";
import { RHFTextField } from "@/src/components/hookForm/rhfTextField";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { phoneField } from "@/src/validation/fields/phone";

type VerifyFormValues = {
  phone: string;
};

const VerifySchema = Yup.object().shape({
  phone: phoneField,
});

const Verify = () => {
  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = (data: VerifyFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.enterCode);
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Получить код",
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-14">
          <Typography weight="semibold" className="text-display mb-2">
            Твой номер
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Мы отправим код подтверждения
          </Typography>

          <View className="mt-9">
            <RHFTextField name="phone" placeholder="+ 7 999 000-00-00" />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Verify;
