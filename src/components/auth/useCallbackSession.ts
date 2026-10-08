import { useCallback, useEffect, useState } from "react";
import { toast } from "@/src/components/ui/toast";

import {
  useConfirmCodeMutation,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type { CallSession } from "@/src/components/auth/types";
import { toCallSession } from "@/src/components/auth/callSession";
import {
  trackAuthCodeFailed,
  trackAuthSuccess,
} from "@/src/services/analytics";
import type { AuthFlow } from "@/src/components/auth/enterCode/route";
import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";
import type { User } from "@/src/store/redux/services/api-types";

type Params = {
  flow?: AuthFlow;
  phone: string;
  referralCode?: string;
  onAuthorized?: (token: string, resource: User) => void | Promise<void>;
};

export const useCallbackSession = ({
  flow = "login",
  phone,
  referralCode,
  onAuthorized,
}: Params) => {
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const handleAuthorized = useHandleAuthorized();
  const [confirmCode] = useConfirmCodeMutation();
  const [sendCode] = useSendCodeMutation();

  useEffect(() => {
    if (!callSession) return;

    const expiryTimeout = setTimeout(() => {
      trackAuthCodeFailed("callback", flow, "timeout");
      setCallSession(null);
      toast.error("Сессия истекла. Попробуйте снова");
    }, callSession.expires_in * 1000);

    const pollInterval = setInterval(async () => {
      try {
        const result = await confirmCode({
          phone,
          type: UserType.USER,
          ...(referralCode && { referral_code: referralCode }),
        }).unwrap();

        if (result.status === "authorized") {
          trackAuthSuccess({
            method: "callback",
            flow,
            isCreated: result.is_created,
          });
          setCallSession(null);
          await (onAuthorized
            ? onAuthorized(result.token, result.resource)
            : handleAuthorized(result.token, result.resource));
        } else if (
          result.status === "expired" ||
          result.status === "deactivated"
        ) {
          trackAuthCodeFailed("callback", flow, result.status);
          setCallSession(null);
          toast.error(
            result.status === "deactivated"
              ? "Аккаунт деактивирован"
              : "Сессия истекла. Попробуйте снова",
          );
        }
      } catch {}
    }, callSession.poll_interval * 1000);

    return () => {
      clearTimeout(expiryTimeout);
      clearInterval(pollInterval);
    };
  }, [
    callSession,
    flow,
    phone,
    referralCode,
    confirmCode,
    handleAuthorized,
    onAuthorized,
  ]);

  const handleResend = useCallback(async () => {
    try {
      const result = await sendCode({
        phone,
        type: UserType.USER,
        method: "callback",
      }).unwrap();
      const next = toCallSession(result);
      if (next) setCallSession((prev) => (prev ? next : null));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode, phone]);

  return { callSession, setCallSession, handleResend };
};
