import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { Typography } from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { Routers } from "@/src/constants/routers";

const ResetPasswordVerify = () => {
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;

  const [code, setCode] = useState("");
  const [sendCode] = useSendCodeMutation();

  const onSubmit = useCallback(() => {
    if (code.length < 6) return;
    router.push({
      pathname: Routers.auth.resetPassword.newPassword,
      params: { phone, code },
    });
  }, [phone, code]);

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      avoidKeyboard
      footer={
        <AuthFooter
          primary={{
            title: "Подтвердить",
            variant: "accent",
            disabled: code.length < 6,
            onPress: onSubmit,
          }}
        />
      }
    >
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Введите код
        </Typography>
        <Typography className="text-body text-neutral-500">
          Отправили код на {phone} через Telegram
        </Typography>

        <View className="mt-8">
          <OtpConfirm
            onChange={setCode}
            onResend={async () => {
              try {
                await sendCode({ phone, type: UserType.USER }).unwrap();
              } catch (error) {
                toast.error(
                  getApiErrorMessage(error, "Не удалось отправить код"),
                );
              }
            }}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default ResetPasswordVerify;
