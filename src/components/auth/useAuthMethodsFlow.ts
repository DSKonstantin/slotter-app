import { useCallback, useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { toast } from "@/src/components/ui/toast";
import { resolveCodeMethod } from "@/src/components/auth/enterCode/codeMethods";
import type { CodeMethodId } from "@/src/components/auth/enterCode/codeMethods";
import {
  buildEnterCodeRoute,
  type AuthFlow,
} from "@/src/components/auth/enterCode/route";
import { trackAuthMethodPicked } from "@/src/services/analytics";
import { toCallSession } from "@/src/components/auth/callSession";
import { useCallbackSession } from "@/src/components/auth/useCallbackSession";
import { useRequestCode } from "@/src/components/auth/useRequestCode";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { UserType, type User } from "@/src/store/redux/services/api-types";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";

const METHOD_SHEET_DELAY_MS = 450;

type Params = {
  flow?: AuthFlow;
  phone: string;
  referralCode?: string;
  onCallbackAuthorized?: (
    token: string,
    resource: User,
  ) => void | Promise<void>;
  onAccountDeactivated: () => void;
};

export const useAuthMethodsFlow = ({
  flow = "login",
  phone,
  referralCode,
  onCallbackAuthorized,
  onAccountDeactivated,
}: Params) => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [isRequestingCall, setIsRequestingCall] = useState(false);

  const pendingRouteRef = useRef<Href | null>(null);

  const { openMethods } = useLocalSearchParams<{ openMethods?: string }>();
  const [sendCode] = useSendCodeMutation();
  const { requestCode, pendingMethod } = useRequestCode({
    flow,
    onAccountDeactivated,
  });
  const { callSession, setCallSession, handleResend } = useCallbackSession({
    flow,
    phone,
    referralCode,
    onAuthorized: onCallbackAuthorized,
  });

  const openSheet = useCallback(() => {
    setSheetVisible(true);
  }, []);

  const requestCall = useCallback(async () => {
    trackAuthMethodPicked("callback", flow);
    setIsRequestingCall(true);
    try {
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method: "callback",
      }).unwrap();

      const session = toCallSession(result);
      if (session) {
        setCallSession(session);
      } else {
        pendingRouteRef.current = buildEnterCodeRoute({
          phone,
          method: resolveCodeMethod(result.method),
          result,
          referralCode,
          flow,
        });
        setSheetVisible(false);
      }
    } catch (e) {
      const code = getApiErrorCode(e);
      if (code === "account_deactivated") {
        onAccountDeactivated();
      } else if (code === "spend_unavailable") {
        toast.error("Звонки временно недоступны. Попробуйте позже");
      } else if (code === "gonec_unavailable") {
        toast.error("Сервис временно недоступен. Попробуйте позже");
      } else {
        toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
      }
    } finally {
      setIsRequestingCall(false);
    }
  }, [
    sendCode,
    phone,
    referralCode,
    flow,
    setCallSession,
    onAccountDeactivated,
  ]);

  const requestCodeMethod = useCallback(
    async (method: CodeMethodId) => {
      trackAuthMethodPicked(method, flow);
      const route = await requestCode({ phone, method, referralCode });
      if (!route) return;
      pendingRouteRef.current = route;
      setCallSession(null);
      setSheetVisible(false);
    },
    [requestCode, phone, referralCode, flow, setCallSession],
  );

  const switchToFlashcall = useCallback(async () => {
    await requestCodeMethod("flashcall");
  }, [requestCodeMethod]);

  const handleHidden = useCallback(() => {
    const route = pendingRouteRef.current;
    if (!route) return;
    pendingRouteRef.current = null;
    router.push(route);
  }, []);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    setCallSession(null);
  }, [setCallSession]);

  useEffect(() => {
    if (!openMethods) return;
    const timeout = setTimeout(() => {
      setSheetVisible(true);
      router.setParams({ openMethods: undefined });
      if (openMethods === "call") requestCall();
    }, METHOD_SHEET_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [openMethods, requestCall]);

  const isPending = isRequestingCall || pendingMethod !== null;

  return {
    openSheet,
    isPending,
    sheetProps: {
      visible: sheetVisible,
      onClose: handleClose,
      onHidden: handleHidden,
      dismissible: !callSession,
    },
    callMethodProps: {
      session: callSession && {
        call_phone: callSession.call_phone,
        expiresIn: callSession.expires_in,
        resendAfter: callSession.resend_after,
        onResend: handleResend,
        onSwitchToFlashcall: switchToFlashcall,
        isSwitchingToFlashcall: pendingMethod === "flashcall",
      },
      pending: isRequestingCall,
      disabled: isPending,
      onPress: requestCall,
    },
    telegramMethodProps: {
      pending: pendingMethod === "telegram",
      disabled: isPending,
      onPress: () => requestCodeMethod("telegram"),
    },
  };
};
