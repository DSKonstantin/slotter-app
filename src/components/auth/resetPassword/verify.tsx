import React, { useCallback } from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { Typography } from "@/src/components/ui";
import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import {
  useConfirmCodeMutation,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { setToken } from "@/src/store/redux/slices/authSlice";
import { useAppDispatch } from "@/src/store/redux/store";
import { Routers } from "@/src/constants/routers";

const ResetPasswordVerify = () => {
  // 3. Custom hooks + RTK Query
  const params = useLocalSearchParams<{
    phone: string;
    code_length?: string;
    resend_after?: string;
  }>();

  const phone = Array.isArray(params.phone)
    ? params.phone[0]
    : (params.phone ?? "");
  const codeLength = Number(params.code_length ?? "4");
  const resendAfter = Number(params.resend_after ?? "60");

  const dispatch = useAppDispatch();
  const [confirmCode, { isLoading: isConfirming }] = useConfirmCodeMutation();
  const [sendCode, { isLoading: isSending }] = useSendCodeMutation();

  // 5. useCallback
  const handleComplete = useCallback(
    async (code: string) => {
      try {
        const result = await confirmCode({
          phone,
          code,
          type: UserType.USER,
        }).unwrap();

        if (result.status === "authorized") {
          dispatch(setToken(result.token));
          router.push({ pathname: Routers.resetPassword.newPassword });
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Неверный код"));
      }
    },
    [phone, confirmCode, dispatch],
  );

  const handleResend = useCallback(async () => {
    try {
      await sendCode({
        phone,
        type: UserType.USER,
        method: "flashcall",
      }).unwrap();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось отправить код"));
    }
  }, [phone, sendCode]);

  return (
    <AuthScreenLayout header={<AuthHeader />} avoidKeyboard>
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Введите {codeLength} цифры
        </Typography>
        <Typography className="text-body text-neutral-500">
          Вам поступит входящий звонок — введите последние {codeLength} цифры
          номера
        </Typography>

        <View className="mt-8">
          <OtpConfirm
            length={codeLength}
            onChange={() => {}}
            onComplete={handleComplete}
            onResend={handleResend}
            disabled={isSending || isConfirming}
            resendSeconds={resendAfter}
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default ResetPasswordVerify;
