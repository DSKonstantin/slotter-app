import React, { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Controller, useFormContext } from "react-hook-form";
import { Input } from "@/src/components/ui/fields/Input";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useLazyCheckNicknameQuery } from "@/src/store/redux/services/api/usersApi";

export function NicknameField() {
  const { control, setValue, watch } = useFormContext();
  const [checkNickname, { data, isFetching }] = useLazyCheckNicknameQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const value = watch("personalLink") as string;
  const isReady = value && value.length >= 3 && !isFetching && data;
  const isAvailable = isReady && data?.available;
  const isTaken = isReady && !data?.available;

  useEffect(() => {
    if (!value || value.length < 3) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      checkNickname(value);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, checkNickname]);

  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      setValue("personalLink", suggestion, { shouldValidate: true });
    },
    [setValue],
  );

  const endAdornment = (() => {
    if (isFetching) {
      return <ActivityIndicator size="small" color={colors.neutral[400]} />;
    }
    if (isAvailable) {
      return (
        <StSvg name="Check_fill" size={20} color={colors.primary.green[400]} />
      );
    }
    if (isTaken) {
      return (
        <StSvg name="Close_fill" size={20} color={colors.accent.red[500]} />
      );
    }
    return null;
  })();

  return (
    <View>
      <Controller
        control={control}
        name="personalLink"
        render={({
          field: { onChange, value: val },
          fieldState: { error },
        }) => (
          <Input
            value={val != null ? String(val) : ""}
            onChangeText={onChange}
            label="Никнейм"
            placeholder="ivan.ivanov"
            inputClassName="pl-0"
            error={
              isTaken ? { type: "manual", message: "Никнейм занят" } : error
            }
            autoCapitalize="none"
            autoCorrect={false}
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

      {isTaken && data?.suggestions && (
        <View className="flex-row gap-2 mt-2 flex-wrap">
          <Typography className="text-caption text-neutral-500">
            Попробуйте:
          </Typography>
          {data.suggestions.map((s) => (
            <Pressable key={s} onPress={() => handleSuggestionPress(s)}>
              <Typography className="text-caption text-primary-blue-500">
                {s}
              </Typography>
            </Pressable>
          ))}
        </View>
      )}

      {isFetching && (
        <Typography className="text-caption text-neutral-400 mt-1">
          Проверяем доступность...
        </Typography>
      )}
    </View>
  );
}
