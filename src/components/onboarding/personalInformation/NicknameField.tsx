import React, { useEffect, useMemo, useRef, useState } from "react";
import debounce from "lodash/debounce";
import { ActivityIndicator, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/src/components/ui/fields/Input";
import { Button, StSvg, Tag, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useLazyCheckNicknameQuery } from "@/src/store/redux/services/api/usersApi";
import { suggestNicknames } from "@/src/utils/text/suggestNickname";
import { getApiErrorMessage } from "@/src/utils/apiError";

export function NicknameField() {
  const { control, watch, setValue } = useFormContext();
  const [
    checkNickname,
    { data, isFetching, isError, error: queryError, reset },
  ] = useLazyCheckNicknameQuery();
  const checkNicknameRef = useRef(checkNickname);
  checkNicknameRef.current = checkNickname;

  const debouncedCheck = useMemo(
    () => debounce((val: string) => checkNicknameRef.current(val), 400),
    [],
  );

  const [focused, setFocused] = useState(false);
  const [checking, setChecking] = useState(false);

  const [value, name, surname, profession] = watch([
    "nickname",
    "name",
    "surname",
    "profession",
  ]) as string[];

  const hasProfileData = !!(name && surname && profession);
  const suggestions = useMemo(
    () => suggestNicknames(name, surname, profession),
    [name, surname, profession],
  );
  const showSuggestions = !value && hasProfileData && suggestions.length > 0;

  const hasValue = value?.length >= 3 && !checking && !isFetching;
  const isAvailable = hasValue && !isError && data?.available === true;
  const isTaken = hasValue && data?.available === false;
  const showQueryError = hasValue && isError;

  const endAdornment = useMemo(() => {
    if (isFetching) {
      return <ActivityIndicator size="small" color={colors.neutral[400]} />;
    }
    if (isAvailable) {
      return (
        <StSvg
          name="check_ring_round_light"
          size={24}
          color={colors.primary.green[700]}
        />
      );
    }
    if (isTaken || showQueryError) {
      return (
        <StSvg name="Alarm_light" size={24} color={colors.accent.red[500]} />
      );
    }
    return null;
  }, [isFetching, isAvailable, isTaken, showQueryError]);

  useEffect(() => {
    if (!value || value.length < 3) {
      debouncedCheck.cancel();
      setChecking(false);
      reset();
      return;
    }
    setChecking(true);
    debouncedCheck(value);
    return () => debouncedCheck.cancel();
  }, [value, debouncedCheck, reset]);

  useEffect(() => {
    if (!isFetching) setChecking(false);
  }, [isFetching]);

  return (
    <View className="gap-2">
      <Controller
        control={control}
        name="nickname"
        render={({
          field: { onChange, value: val },
          fieldState: { error },
        }) => (
          <Input
            value={val != null ? String(val) : ""}
            onChangeText={onChange}
            label="Никнейм"
            placeholder="ivan.ivanov"
            hideErrorText
            inputClassName="pl-0"
            success={isAvailable}
            error={
              isTaken || showQueryError
                ? { type: "manual", message: "" }
                : error
            }
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            startAdornment={
              <Typography
                weight="regular"
                className="text-neutral-400 text-body ml-2"
              >
                {process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/
              </Typography>
            }
            endAdornment={endAdornment}
          />
        )}
      />
      <View className="gap-2.5 min-h-[26px]">
        {isAvailable ? (
          <Tag
            variant="mint"
            size="sm"
            title={`${process.env.EXPO_PUBLIC_BOOKING_DISPLAY_URL}/${value}`}
            onPress={() =>
              Clipboard.setStringAsync(
                `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${value}`,
              )
            }
            icon={
              <StSvg
                name="link_alt"
                size={14}
                color={colors.primary.green[700]}
              />
            }
          />
        ) : (
          <Typography
            className={`text-caption ${showQueryError ? "text-accent-red-500" : "text-neutral-500"}`}
          >
            {showQueryError
              ? getApiErrorMessage(queryError, "Ошибка проверки никнейма")
              : checking
                ? "Проверяем доступность..."
                : focused
                  ? "Только латиница, цифры, точка и подчёркивание"
                  : "Уникальная ссылка на ваш профиль"}
          </Typography>
        )}
        {showSuggestions && (
          <View className="flex-row flex-wrap gap-2 items-center">
            <Typography className="text-caption text-neutral-500">
              Попробуйте:
            </Typography>
            {suggestions.map((s) => (
              <Button
                key={s}
                title={s}
                variant="secondary"
                size="xs"
                onPress={() =>
                  setValue("nickname", s, { shouldValidate: true })
                }
                buttonClassName="rounded-xl"
                textClassName="font-inter-regular"
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
