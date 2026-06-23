import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Linking, Pressable, View } from "react-native";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { formatCallPhoneDisplay } from "@/src/utils/mask/maskPhone";
import { formatCountdown } from "@/src/utils/date/formatTime";
import { useCountDown } from "@/src/hooks/useCountdown";
import { colors } from "@/src/styles/colors";

type CallModalProps = {
  visible: boolean;
  onClose: () => void;
  call_phone: string;
  expiresIn?: number;
  resendAfter?: number;
  onResend?: () => Promise<void>;
  isResending?: boolean;
  onSwitchToFlashcall?: () => void;
  isSwitchingToFlashcall?: boolean;
  onSwitchToTelegram?: () => void;
  isSwitchingToTelegram?: boolean;
};

const HINT_DELAY_MS = 8_000;

export const CallModal = ({
  visible,
  onClose,
  call_phone,
  expiresIn = 600,
  resendAfter = 60,
  onResend,
  isResending,
  onSwitchToFlashcall,
  isSwitchingToFlashcall,
}: CallModalProps) => {
  // 1. useState
  const [showHint, setShowHint] = useState(false);

  // 2. useRef
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // 3. Custom hooks
  const { seconds: sessionTimeLeft } = useCountDown({
    seconds: expiresIn,
    autoStart: true,
  });
  const { seconds: resendDelay, start: restartResend } = useCountDown({
    seconds: resendAfter,
    autoStart: true,
  });

  // 6. useEffect
  useEffect(() => {
    const hintTimer = setTimeout(() => setShowHint(true), HINT_DELAY_MS);
    return () => clearTimeout(hintTimer);
  }, []);

  useEffect(() => {
    restartResend();
  }, [resendAfter, restartResend]);

  const canResend = resendDelay === 0;

  useEffect(() => {
    const animate = (
      dot: Animated.Value,
      startDelay: number,
      endDelay: number,
    ) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.delay(endDelay),
        ]),
      );

    const a1 = animate(dot1, 0, 800);
    const a2 = animate(dot2, 300, 500);
    const a3 = animate(dot3, 600, 200);

    a1.start();
    a2.start();
    a3.start();

    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      swipeDirection={[]}
      onBackdropPress={undefined}
      header={
        <Pressable
          onPress={onClose}
          hitSlop={8}
          className="absolute top-3 right-4 z-10 active:opacity-70"
        >
          <StSvg name="Close_round" size={24} color={colors.neutral[500]} />
        </Pressable>
      }
    >
      <View className="gap-4 mt-4">
        <View className="flex-row justify-between items-center bg-background-surface rounded-base p-4">
          <View className="gap-2">
            <Typography className="text-caption text-neutral-500">
              Авторизоваться по звонку
            </Typography>
            <Typography weight="semibold" className="text-[18px]">
              {formatCallPhoneDisplay(call_phone)}
            </Typography>
          </View>
          <Button
            size="sm"
            title="Позвонить"
            onPress={() => {
              Linking.openURL(
                `tel:${call_phone.startsWith("+") ? call_phone : `+${call_phone}`}`,
              );
            }}
          />
        </View>

        <View className="flex-row items-center justify-between px-1">
          <View className="flex-row items-center gap-2">
            <View className="flex-row gap-1">
              {[dot1, dot2, dot3].map((dot, i) => (
                <Animated.View
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: colors.neutral[700],
                    opacity: dot,
                  }}
                />
              ))}
            </View>
            <Typography className="text-caption text-neutral-500">
              Ожидаем звонок
            </Typography>
          </View>
          <Typography className="text-caption text-neutral-500">
            {formatCountdown(sessionTimeLeft)}
          </Typography>
        </View>

        <View className="gap-2">
          <Typography className="text-caption text-neutral-500 text-center">
            Не получается дозвониться?
          </Typography>

          {onResend && (
            <Button
              title={
                canResend
                  ? "Обновить номер"
                  : `Обновить номер · ${formatCountdown(resendDelay)}`
              }
              variant="secondary"
              loading={isResending}
              disabled={!canResend || isResending}
              onPress={canResend ? onResend : () => {}}
            />
          )}

          {showHint && onSwitchToFlashcall && (
            <Button
              title="Позвонить мне"
              loading={isSwitchingToFlashcall}
              disabled={isSwitchingToFlashcall}
              onPress={onSwitchToFlashcall}
            />
          )}
        </View>
      </View>
    </StModal>
  );
};
