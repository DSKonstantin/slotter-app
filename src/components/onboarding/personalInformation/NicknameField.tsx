import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import debounce from "lodash/debounce";
import { toast } from "@backpackapp-io/react-native-toast";
import { Controller, useFormContext } from "react-hook-form";

import { Input } from "@/src/components/ui/fields/Input";
import { Button, StSvg, Tag, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useLazyCheckNicknameQuery } from "@/src/store/redux/services/api/usersApi";
import { suggestNicknames } from "@/src/utils/text/suggestNickname";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { NICKNAME_PATTERN } from "@/src/validation/fields/nickname";

export function NicknameField() {
  const [focused, setFocused] = useState(false);
  const [pending, setPending] = useState(false);

  const suggestionSelectedRef = useRef(false);

  const {
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useFormContext();

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

  const [value, name, surname, profession] = watch([
    "nickname",
    "name",
    "surname",
    "profession",
  ]) as string[];

  const nicknameError = errors.nickname;
  const loading = pending || isFetching;
  const hasFormatError = !!value && !NICKNAME_PATTERN.test(value);
  const hasValue = (value?.length ?? 0) >= 3 && !loading;
  const isAvailable =
    hasValue &&
    !hasFormatError &&
    !isError &&
    !nicknameError &&
    data?.available === true;
  const isTaken = hasValue && !hasFormatError && data?.available === false;
  const showQueryError = hasValue && !hasFormatError && isError;

  const hasProfileData = !!(name && surname && profession);
  const suggestions = useMemo(
    () => (hasProfileData ? suggestNicknames(name, surname, profession) : []),
    [name, surname, profession, hasProfileData],
  );

  const endAdornment = useMemo(() => {
    if (loading)
      return <ActivityIndicator size="small" color={colors.neutral[400]} />;
    if (hasFormatError || nicknameError || isTaken || showQueryError)
      return (
        <StSvg name="Alarm_light" size={24} color={colors.accent.red[500]} />
      );
    if (isAvailable)
      return (
        <StSvg
          name="check_ring_round_light"
          size={24}
          color={colors.primary.green[700]}
        />
      );
    return null;
  }, [
    loading,
    isAvailable,
    isTaken,
    showQueryError,
    nicknameError,
    hasFormatError,
  ]);

  const helperText = useMemo(() => {
    if (hasFormatError) return "Только латиница, цифры и подчёркивание";
    if (showQueryError)
      return getApiErrorMessage(queryError, "Ошибка проверки никнейма");
    if (loading) return "Проверяем доступность...";
    if (focused) return "Только латиница, цифры и подчёркивание";
    return "Уникальная ссылка на ваш профиль";
  }, [hasFormatError, showQueryError, loading, focused, queryError]);

  useEffect(() => {
    if (suggestionSelectedRef.current) {
      suggestionSelectedRef.current = false;
      debouncedCheck.cancel();
      return () => debouncedCheck.cancel();
    }
    if (
      !dirtyFields.nickname ||
      !value ||
      value.length < 3 ||
      !NICKNAME_PATTERN.test(value)
    ) {
      debouncedCheck.cancel();
      setPending(false);
      reset();
      return () => debouncedCheck.cancel();
    }
    setPending(true);
    debouncedCheck(value);
    return () => debouncedCheck.cancel();
  }, [value, dirtyFields.nickname, debouncedCheck, reset]);

  useEffect(() => {
    if (!isFetching) setPending(false);
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
            label="Никнейм*"
            placeholder="ivan_ivanov"
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
            onPress={async () => {
              await Clipboard.setStringAsync(
                `${process.env.EXPO_PUBLIC_BOOKING_BASE_URL}/${value}`,
              );
              toast.success("Ссылка скопирована");
            }}
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
            className={`text-caption ${hasFormatError || showQueryError ? "text-accent-red-500" : "text-neutral-500"}`}
          >
            {helperText}
          </Typography>
        )}

        {!value && suggestions.length > 0 && (
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
                onPress={() => {
                  suggestionSelectedRef.current = true;
                  setValue("nickname", s, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                  checkNickname(s);
                }}
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
