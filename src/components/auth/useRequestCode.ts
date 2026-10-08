import { useCallback, useState } from "react";
import type { Href } from "expo-router";
import { toast } from "@/src/components/ui/toast";
import {
  CODE_METHODS,
  type CodeMethodId,
} from "@/src/components/auth/enterCode/codeMethods";
import {
  buildEnterCodeRoute,
  type AuthFlow,
} from "@/src/components/auth/enterCode/route";
import { useSendCodeMutation } from "@/src/store/redux/services/api/authApi";
import { trackAuthCodeFailed } from "@/src/services/analytics";
import { UserType } from "@/src/store/redux/services/api-types";
import { getApiErrorCode, getApiErrorMessage } from "@/src/utils/apiError";

type Params = {
  flow?: AuthFlow;
  onAccountDeactivated: () => void;
};

type RequestCodeArgs = {
  phone: string;
  method: CodeMethodId;
  referralCode?: string;
};

export const useRequestCode = ({
  flow = "login",
  onAccountDeactivated,
}: Params) => {
  const [pendingMethod, setPendingMethod] = useState<CodeMethodId | null>(null);

  const [sendCode] = useSendCodeMutation();

  const requestCode = useCallback(
    async ({
      phone,
      method,
      referralCode,
    }: RequestCodeArgs): Promise<Href | null> => {
      const config = CODE_METHODS[method];
      setPendingMethod(method);
      try {
        const result = await sendCode({
          phone,
          type: UserType.USER,
          method,
        }).unwrap();

        if (result.method !== method) {
          toast.error(config.unavailableText);
          return null;
        }

        return buildEnterCodeRoute({
          phone,
          method,
          result,
          referralCode,
          flow,
        });
      } catch (e) {
        const code = getApiErrorCode(e);
        trackAuthCodeFailed(method, flow, code ?? "unknown");
        if (code === "account_deactivated") {
          onAccountDeactivated();
        } else {
          toast.error(
            config.errors[code ?? ""] ??
              getApiErrorMessage(e, "Не удалось отправить код"),
          );
        }
        return null;
      } finally {
        setPendingMethod(null);
      }
    },
    [sendCode, flow, onAccountDeactivated],
  );

  return { requestCode, pendingMethod };
};
