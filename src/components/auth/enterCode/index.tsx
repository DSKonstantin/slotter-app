import React, { useState } from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";

const EnterCode = () => {
  const [code, setCode] = useState("");

  const onSubmit = () => {
    if (!code || code.length < 6) return;
    console.log("SUBMIT CODE:", code);

    router.replace(Routers.auth.register);
  };

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      avoidKeyboard
      footer={
        <AuthFooter
          primary={{
            title: "Войти",
            variant: "accent",
            iconRight: (
              <StSvg
                name="Sign_in_squre_fill"
                size={24}
                color={colors.neutral[0]}
              />
            ),
            disabled: code.length < 6,
            onPress: () => onSubmit(),
          }}
        />
      }
    >
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Код из Telegram
        </Typography>
        <Typography className="text-body text-neutral-500">
          Мы отправили сообщение от сервисного бота
        </Typography>

        <View className="w-full items-center mt-5 mb-10">
          <View className="w-[80px] h-[80px] items-center justify-center bg-background-surface rounded-full">
            <StSvg name="SocialTelegram" size={52} color={"#37B5DB"} />
          </View>
        </View>

        <OtpConfirm onChange={setCode} onComplete={() => {}} />
      </View>
    </AuthScreenLayout>
  );
};

export default EnterCode;
