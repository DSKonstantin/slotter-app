import type { CallSession } from "@/src/components/auth/types";
import type { SendCodeResponse } from "@/src/store/redux/services/api-types";

export const toCallSession = (result: SendCodeResponse): CallSession | null =>
  result.method === "callback" && result.call_phone
    ? {
        call_phone: result.call_phone,
        poll_interval: result.poll_interval,
        resend_after: result.resend_after,
        expires_in: result.expires_in,
      }
    : null;
