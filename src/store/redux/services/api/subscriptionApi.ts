import { api } from "../api";
import type {
  SubscriptionMembership,
  SubscriptionPlan,
  SubscriptionQuota,
  SubscriptionPayment,
  CheckoutResponse,
} from "@/src/store/redux/services/api-types";

const subscriptionApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
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
      { userId: number; subscriptionPlanId: number }
    >({
      query: ({ userId, subscriptionPlanId }) => ({
        url: `/users/${userId}/subscription_membership/checkout`,
        method: "POST",
        data: { subscription_plan_id: subscriptionPlanId },
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
      { userId: number; paymentId: number }
    >({
      query: ({ userId, paymentId }) => ({
        url: `/users/${userId}/subscription_payments/${paymentId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetSubscriptionPlansQuery,
  useGetSubscriptionMembershipQuery,
  useCheckoutMutation,
  useCancelSubscriptionMutation,
  useGetSubscriptionQuotaQuery,
  useGetSubscriptionPaymentQuery,
} = subscriptionApi;
