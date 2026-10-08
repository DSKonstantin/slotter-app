import type { Href } from "expo-router";
import { Routers } from "@/src/constants/routers";
import type {
  SendCodeMethod,
  SendCodeResponse,
} from "@/src/store/redux/services/api-types";

export type AuthFlow = "login" | "reset";

type Params = {
  phone: string;
  method: SendCodeMethod;
  result: SendCodeResponse;
  referralCode?: string;
  flow?: AuthFlow;
};

export const buildEnterCodeRoute = ({
  phone,
  method,
  result,
  referralCode,
  flow = "login",
}: Params): Href => ({
  pathname:
    flow === "reset" ? Routers.resetPassword.enterCode : Routers.auth.enterCode,
  params: {
    phone,
    method,
    flow,
    ...(result.code_length != null && {
      code_length: String(result.code_length),
    }),
    resend_after: String(result.resend_after),
    expires_in: String(result.expires_in),
    ...(result.bot_url && { bot_url: result.bot_url }),
    ...(referralCode && { referralCode }),
  },
});
