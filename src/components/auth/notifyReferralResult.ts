import { toast } from "@backpackapp-io/react-native-toast";
import type { ConfirmCodeAuthorizedResponse } from "@/src/store/redux/services/api-types";

export const notifyReferralResult = (
  result: ConfirmCodeAuthorizedResponse,
  hadReferralCode: boolean,
): void => {
  if (!hadReferralCode || !result.is_created) return;

  if (result.is_referral_applied) {
    toast.success("Промокод применён");
  } else if (result.referral_error) {
    toast.error(result.referral_error);
  }
};
