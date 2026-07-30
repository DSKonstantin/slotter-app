import { api } from "../api";
import type {
  SubscriptionMembership,
  SubscriptionPlanWithPrices,
  SubscriptionQuota,
  SubscriptionPayment,
  SubscriptionPaymentMethodType,
  CheckoutResponse,
  RenewWithCardResponse,
} from "@/src/store/redux/services/api-types";

export const subscriptionApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlanWithPrices[], void>({
      query: () => ({
        url: "/subscription_plans",
        method: "GET",
      }),
      providesTags: ["SubscriptionPlans"],
    }),

    getSubscriptionMembership: builder.query<
      SubscriptionMembership,
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/subscription_membership`,
        method: "GET",
      }),
      providesTags: ["SubscriptionMembership"],
    }),

    checkout: builder.mutation<
      CheckoutResponse,
      {
        userId: number;
        subscriptionPlanPriceId: number;
        paymentMethodType?: SubscriptionPaymentMethodType;
        applyBalance?: boolean;
      }
    >({
      query: ({
        userId,
        subscriptionPlanPriceId,
        paymentMethodType,
        applyBalance,
      }) => ({
        url: `/users/${userId}/subscription_membership/checkout`,
        method: "POST",
        data: {
          subscription_plan_price_id: subscriptionPlanPriceId,
          payment_method_type: paymentMethodType,
          apply_balance: applyBalance,
        },
      }),
    }),

    cancelSubscription: builder.mutation<
      SubscriptionMembership,
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/subscription_membership/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["SubscriptionMembership"],
    }),

    getSubscriptionQuota: builder.query<SubscriptionQuota, { userId: number }>({
      query: ({ userId }) => ({
        url: `/users/${userId}/subscription_quota`,
        method: "GET",
      }),
    }),

    getSubscriptionPayment: builder.query<
      SubscriptionPayment,
      { userId: number; paymentId: string }
    >({
      query: ({ userId, paymentId }) => ({
        url: `/users/${userId}/subscription_payments/${paymentId}`,
        method: "GET",
      }),
    }),

    toggleAutoRenew: builder.mutation<
      SubscriptionMembership,
      { userId: number; isAutoRenew: boolean }
    >({
      query: ({ userId, isAutoRenew }) => ({
        url: `/users/${userId}/subscription_membership/toggle_auto_renew`,
        method: "POST",
        data: { is_auto_renew: isAutoRenew },
      }),
      invalidatesTags: ["SubscriptionMembership"],
    }),

    changeCard: builder.mutation<
      CheckoutResponse,
      { userId: number; paymentMethodType?: SubscriptionPaymentMethodType }
    >({
      query: ({ userId, paymentMethodType }) => ({
        url: `/users/${userId}/subscription_membership/change_card`,
        method: "POST",
        data: paymentMethodType
          ? { payment_method_type: paymentMethodType }
          : undefined,
      }),
    }),

    renewWithCard: builder.mutation<RenewWithCardResponse, { userId: number }>({
      query: ({ userId }) => ({
        url: `/users/${userId}/subscription_membership/renew_with_card`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionMembershipQuery,
  useLazyGetSubscriptionMembershipQuery,
  useCheckoutMutation,
  useCancelSubscriptionMutation,
  useGetSubscriptionQuotaQuery,
  useGetSubscriptionPaymentQuery,
  useToggleAutoRenewMutation,
  useChangeCardMutation,
  useRenewWithCardMutation,
} = subscriptionApi;
