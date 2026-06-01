import React, { useCallback, useState } from "react";
import { View } from "react-native";
import { MaskedTextInput } from "react-native-mask-text";
import { toast } from "@backpackapp-io/react-native-toast";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { useUpdateCustomerMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector, useAppDispatch } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { mergeUser } from "@/src/store/redux/slices/authSlice";
import { colors } from "@/src/styles/colors";

const parseBirthday = (value: string | null | undefined): string => {
  if (!value) return "";
  const [y, m, d] = value.split("-");
  if (!y || !m || !d) return "";
  return `${d}.${m}.${y}`;
};

const toBirthdayApi = (masked: string): string | null => {
  const digits = masked.replace(/\D/g, "");
  if (digits.length !== 8) return null;
  const dd = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  const yyyy = digits.slice(4, 8);
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valid =
    date.getFullYear() === Number(yyyy) &&
    date.getMonth() + 1 === Number(mm) &&
    date.getDate() === Number(dd) &&
    Number(yyyy) >= 1900 &&
    date <= new Date();
  return valid ? `${yyyy}-${mm}-${dd}` : null;
};

const BirthdayScreen = () => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [updateCustomer, { isLoading }] = useUpdateCustomerMutation();
  const [value, setValue] = useState(parseBirthday(user?.birthday));

  const onSubmit = useCallback(async () => {
    if (!auth) return;
    const apiDate = toBirthdayApi(value);
    if (!apiDate) {
      toast.error("Введите корректную дату");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("customer[birthday]", apiDate);
      await updateCustomer({ id: auth.userId, data: formData }).unwrap();
      dispatch(mergeUser({ birthday: apiDate }));
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить дату"));
    }
  }, [auth, updateCustomer, value]);

  if (!auth) return null;

  return (
    <ScreenWithToolbar title="Дата рождения">
      {({ topInset, bottomInset }) => (
        <>
          <View
            className="px-screen gap-4"
            style={{ paddingTop: topInset + 16 }}
          >
            <View className="bg-background-surface rounded-base px-4 py-3 flex-row items-center gap-3">
              <StSvg name="Calendar_fill" size={20} color={colors.neutral[400]} />
              <MaskedTextInput
                mask="99.99.9999"
                placeholder="ДД.ММ.ГГГГ"
                placeholderTextColor={colors.neutral[400]}
                keyboardType="number-pad"
                value={value}
                onChangeText={(text) => setValue(text)}
                className="flex-1 text-body text-neutral-900"
              />
            </View>
            <Typography className="text-caption text-neutral-400 px-1">
              Дата рождения используется для персонализации
            </Typography>
          </View>

          <View
            className="px-screen gap-4 mt-auto"
            style={{ paddingBottom: bottomInset + 8 }}
          >
            <Button
              title="Сохранить"
              onPress={onSubmit}
              rightIcon={<StSvg name="Save_fill" size={24} color={colors.neutral[0]} />}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </>
      )}
    </ScreenWithToolbar>
  );
};

export default BirthdayScreen;
