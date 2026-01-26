import React, { useState } from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

const EnterCode = () => {
  const [code, setCode] = useState("");

  const onSubmit = () => {
    if (!code || code.length < 6) return;
    console.log("SUBMIT CODE:", code);

    router.push(Routers.auth.register);
  };

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      avoidKeyboard
      footer={
        <AuthFooter
          primary={{
            title: "Далее",
            disabled: code.length < 6,
            onPress: () => onSubmit(),
          }}
        />
      }
    >
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Мы отправили код
        </Typography>
        <Typography weight="medium" className="text-body text-gray">
          Проверь смс. Обычно приходит быстро
        </Typography>
        <View className="mt-9">
          <OtpConfirm onChange={setCode} onComplete={setCode} />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default EnterCode;
