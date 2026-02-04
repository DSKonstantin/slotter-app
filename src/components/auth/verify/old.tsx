import * as Yup from "yup";
import React from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import AuthFooter from "@/src/components/auth/layout/footer";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { phoneField } from "@/src/validation/fields/phone";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { unMask } from "react-native-mask-text";

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
    const { phone } = data;
    console.log("SUBMIT", `+${unMask(phone)}`);
    router.push(Routers.auth.enterCode);
  };

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
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
          <Typography className="text-body text-neutral-500">
            Мы отправим код подтверждения
          </Typography>

          <View className="mt-9">
            <RhfTextField
              name="phone"
              placeholder="+ 7 999 000-00-00"
              maskFn={maskPhone}
              maxLength={16}
              keyboardType="number-pad"
            />
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Verify;
