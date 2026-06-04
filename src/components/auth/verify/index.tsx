import React, { useCallback, useEffect, useState } from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import AuthFooter from "@/src/components/auth/layout/footer";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Typography, Button } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Routers } from "@/src/constants/routers";
import {
  VerifySchema,
  type VerifyFormValues,
} from "@/src/validation/schemas/verify.schema";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { unMask } from "react-native-mask-text";
import { UserType } from "@/src/store/redux/services/api-types";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { useLazyValidateReferralCodeQuery } from "@/src/store/redux/services/api/referralApi";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";

type CodeState = { status: "idle" | "valid" | "invalid"; error: string };

const INITIAL_CODE_STATE: CodeState = { status: "idle", error: "" };

const Verify = () => {
  const [codeState, setCodeState] = useState<CodeState>(INITIAL_CODE_STATE);

  const [sendCode, { isLoading }] = useSendCodeMutation();
  const [validateReferralCode, { isFetching: isValidating }] =
    useLazyValidateReferralCodeQuery();

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      phone: "",
      promoCode: "",
    },
  });

  const promoCode = methods.watch("promoCode") ?? "";

  const handleValidateCode = useCallback(async () => {
    const code = promoCode.trim();
    if (!code) return;
    try {
      const result = await validateReferralCode({ code }).unwrap();
      if (result.valid) {
        setCodeState({ status: "valid", error: "" });
      } else {
        setCodeState({ status: "invalid", error: result.error });
      }
    } catch {
      setCodeState({ status: "invalid", error: "Не удалось проверить код" });
    }
  }, [promoCode, validateReferralCode]);

  const onSubmit = useCallback(
    async (data: VerifyFormValues) => {
      const code = (data.promoCode ?? "").trim();
      const phone = `+${unMask(data.phone)}`;

      try {
        await sendCode({ phone, type: UserType.USER }).unwrap();

        router.push({
          pathname: Routers.auth.enterCode,
          params: {
            phone,
            ...(code && { referralCode: code }),
          },
        });
      } catch (e) {
        toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
      }
    },
    [sendCode],
  );

  const trimmedPromo = promoCode.trim();
  const isPromoEntered = trimmedPromo.length >= 4;

  useEffect(() => {
    setCodeState(INITIAL_CODE_STATE);
  }, [promoCode]);

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Получить код",
              disabled: isLoading,
              loading: isLoading,
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
            Отправим код через SMS, Telegram или WhatsApp
          </Typography>

          <View className="mt-9">
            <RhfTextField
              name="phone"
              placeholder="+ 7 999 000-00-00"
              maskFn={maskPhone}
              maxLength={16}
              hideErrorText
              keyboardType="number-pad"
            />
            <Typography className="text-caption text-neutral-500 mt-2 mb-9">
              Продолжая, вы соглашаетесь с{" "}
              <Typography
                className="text-caption text-black underline"
                onPress={() =>
                  WebBrowser.openBrowserAsync(
                    `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/terms`,
                  )
                }
              >
                условиями использования
              </Typography>
            </Typography>
            <RhfTextField
              name="promoCode"
              label="Если вас пригласили или вы попали на акцию"
              placeholder="Промокод"
              hideErrorText
              autoCapitalize="characters"
              maxLength={16}
            />
            <View className="mt-2">
              <Button
                title="Проверить"
                variant="secondary"
                size="sm"
                loading={isValidating}
                disabled={!isPromoEntered || isValidating}
                onPress={handleValidateCode}
              />
            </View>
            {codeState.status === "valid" && (
              <Typography className="text-caption text-accent-green-500 mt-2">
                Вы получите 30 дней Pro бесплатно
              </Typography>
            )}
            {codeState.status === "invalid" && (
              <Typography className="text-caption text-accent-red-500 mt-2">
                {codeState.error}
              </Typography>
            )}
          </View>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Verify;
