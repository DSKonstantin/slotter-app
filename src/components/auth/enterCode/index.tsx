import React, { useCallback, useState } from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "@/src/styles/colors";
import {
  useSendCodeMutation,
  useConfirmCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { useAuth } from "@/src/contexts/AuthContext";
import { toast } from "@backpackapp-io/react-native-toast";
import getRedirectPath from "@/src/utils/getOnboardingStep";
import { getApiErrorMessage } from "@/src/utils/apiError";

const EnterCode = () => {
  const params = useLocalSearchParams<{ phone: string }>();
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;

  const [code, setCode] = useState("");
  const [sendCode] = useSendCodeMutation();
  const [confirmCode, { isLoading }] = useConfirmCodeMutation();
  const { login } = useAuth();

  const onSubmit = useCallback(async () => {
    if (!code || code.length < 6) return;
    try {
      const result = await confirmCode({ phone, code }).unwrap();

      await login(result.token);
      router.replace(getRedirectPath(result.resource));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Неверный код"));
    }
  }, [confirmCode, phone, code, login]);

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      avoidKeyboard
      footer={
        <AuthFooter
          primary={{
            title: "Войти",
            variant: "accent",
            rightIcon: (
              <StSvg
                name="Sign_in_squre_fill"
                size={24}
                color={colors.neutral[0]}
              />
            ),
            disabled: code.length < 6 || isLoading,
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
          Мы отправили SMS на {phone}
        </Typography>

        <View className="mt-8">
          <OtpConfirm
            onChange={setCode}
            onResend={async () => {
              await sendCode({ phone, type: UserType.USER });
            }}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default EnterCode;
