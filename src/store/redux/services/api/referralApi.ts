import { api } from "../api";

type ValidateReferralCodeResponse =
  | { valid: true; trial_days: number }
  | { valid: false; error: string };

const referralApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    validateReferralCode: builder.query<
      ValidateReferralCodeResponse,
      { code: string }
    >({
      query: ({ code }) => ({
        url: "/referral/validate_code",
        method: "POST",
        data: { code },
      }),
    }),
  }),
});

export const { useLazyValidateReferralCodeQuery } = referralApi;
