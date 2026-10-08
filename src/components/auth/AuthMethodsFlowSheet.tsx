import React from "react";
import { AuthMethodSheet } from "@/src/components/auth/verify/AuthMethodSheet";
import { CallMethod } from "@/src/components/auth/verify/CallMethod";
import { TelegramMethod } from "@/src/components/auth/verify/TelegramMethod";
import type { useAuthMethodsFlow } from "@/src/components/auth/useAuthMethodsFlow";

type AuthMethodsFlowSheetProps = {
  flow: ReturnType<typeof useAuthMethodsFlow>;
};

export const AuthMethodsFlowSheet = ({ flow }: AuthMethodsFlowSheetProps) => (
  <AuthMethodSheet {...flow.sheetProps}>
    <CallMethod {...flow.callMethodProps} />
    <TelegramMethod {...flow.telegramMethodProps} />
  </AuthMethodSheet>
);
