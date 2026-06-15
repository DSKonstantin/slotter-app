import React, { useCallback, useEffect, useRef } from "react";
import { Animated, Easing, Linking, View } from "react-native";
import { Button, StModal, Typography } from "@/src/components/ui";
import { formatPhoneDisplay } from "@/src/utils/mask/maskPhone";
import { useCountDown } from "@/src/hooks/useCountdown";
import { colors } from "@/src/styles/colors";

type CallModalProps = {
  visible: boolean;
  onClose: () => void;
  call_phone: string;
  resendAfter?: number;
  onResend?: () => Promise<void>;
  onSwitchToFlashcall?: () => void;
  isSwitchingToFlashcall?: boolean;
  onSwitchToTelegram?: () => void;
  isSwitchingToTelegram?: boolean;
};

const formatCountdown = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const CallModal = ({
  visible,
  onClose,
  call_phone,
  resendAfter = 60,
  onResend,
  onSwitchToFlashcall,
  isSwitchingToFlashcall,
}: // TODO: Telegram временно отключён
// onSwitchToTelegram,
// isSwitchingToTelegram,
CallModalProps) => {
  // 2. useRef
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  // 3. Custom hooks
  const { seconds: timeLeft, start: restartCountdown } = useCountDown({
    seconds: resendAfter,
    autoStart: true,
  });

  const isFinished = timeLeft === 0;

  // 5. useCallback
  const handleResend = useCallback(async () => {
    if (!onResend) return;
    await onResend();
    restartCountdown();
  }, [onResend, restartCountdown]);

  // 6. useEffect
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

    // Все циклы = 1800ms: startDelay + 1000ms анимации + endDelay
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
    <StModal visible={visible} onClose={onClose}>
      <View className="gap-4 pb-2">
        <View className="flex-row justify-between items-center bg-background-surface rounded-base p-4">
          <View className="gap-2">
            <Typography className="text-caption text-neutral-500">
              Авторизоваться по звонку
            </Typography>
            <Typography weight="semibold" className="text-[18px]">
              {formatPhoneDisplay(call_phone)}
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

        {!isFinished ? (
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
              {formatCountdown(timeLeft)}
            </Typography>
          </View>
        ) : (
          <View className="gap-2">
            <Button
              title="Сменить номер"
              variant="accent"
              onPress={handleResend}
            />
            {onSwitchToFlashcall && (
              <Button
                title="Позвонить мне"
                variant="secondary"
                loading={isSwitchingToFlashcall}
                disabled={isSwitchingToFlashcall}
                onPress={onSwitchToFlashcall}
              />
            )}
          </View>
        )}

        {/*TODO: Telegram временно отключён*/}
        {/*{onSwitchToTelegram && (*/}
        {/*  <>*/}
        {/*    <View className="flex-row items-center gap-2">*/}
        {/*      <Divider className="flex-1" />*/}
        {/*      <Typography weight="medium" className="text-neutral-500 text-body">Или</Typography>*/}
        {/*      <Divider className="flex-1" />*/}
        {/*    </View>*/}
        {/*    <Button title="Войти через Telegram" variant="accent" loading={isSwitchingToTelegram} disabled={isSwitchingToTelegram} onPress={onSwitchToTelegram} />*/}
        {/*    <Typography className="text-caption text-neutral-500 text-center">Откроем бот и подтвердим вход кодом</Typography>*/}
        {/*  </>*/}
        {/*)}*/}
      </View>
    </StModal>
  );
};
