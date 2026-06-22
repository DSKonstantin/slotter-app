import { useCallback, useEffect, useState } from "react";
import { toast } from "@backpackapp-io/react-native-toast";

import {
  useConfirmCodeMutation,
  useSendCodeMutation,
} from "@/src/store/redux/services/api/authApi";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type { CallSession } from "@/src/components/auth/types";
import { useHandleAuthorized } from "@/src/components/auth/useHandleAuthorized";
import type { User } from "@/src/store/redux/services/api-types";

type Params = {
  phone: string;
  referralCode?: string;
  onAuthorized?: (token: string, resource: User) => void | Promise<void>;
};

export const useCallbackSession = ({
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
          setCallSession(null);
          await (onAuthorized
            ? onAuthorized(result.token, result.resource)
            : handleAuthorized(result.token, result.resource));
        } else if (
          result.status === "expired" ||
          result.status === "deactivated"
        ) {
          setCallSession(null);
          toast.error(
            result.status === "deactivated"
              ? "Аккаунт деактивирован"
              : "Сессия истекла. Попробуйте снова",
          );
        }
      } catch {
        // network error — keep trying
      }
    }, callSession.poll_interval * 1000);

    return () => {
      clearTimeout(expiryTimeout);
      clearInterval(pollInterval);
    };
  }, [
    callSession,
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
      if (result.call_phone) {
        setCallSession((prev) =>
          prev
            ? {
                ...prev,
                call_phone: result.call_phone!,
                resend_after: result.resend_after,
                expires_in: result.expires_in,
              }
            : null,
        );
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"));
    }
  }, [sendCode, phone]);

  return { callSession, setCallSession, handleResend };
};
