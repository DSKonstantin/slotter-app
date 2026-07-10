import { api } from "../api";
import type {
  SubscriptionDirectPlan,
  GetSubscriptionDirectChannelsResponse,
  DirectChannelKind,
  DirectChannelCheckoutResponse,
  DirectChannelAuthStartResponse,
  DirectChannelAuthCodeResponse,
  DirectChannelAuthPasswordResponse,
  DirectChannelAuthStatusResponse,
} from "@/src/store/redux/services/api-types";

const subscriptionDirectApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getSubscriptionDirectPlans: builder.query<SubscriptionDirectPlan[], void>({
      query: () => ({
        url: "/subscription_direct_plans",
        method: "GET",
      }),
    }),

    getSubscriptionDirectChannels: builder.query<
      GetSubscriptionDirectChannelsResponse,
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/subscription/direct_channels`,
        method: "GET",
      }),
      providesTags: ["SubscriptionDirectChannels"],
    }),

    checkoutDirectChannel: builder.mutation<
      DirectChannelCheckoutResponse,
      { userId: number; kind: DirectChannelKind }
    >({
      query: ({ userId, kind }) => ({
        url: `/users/${userId}/subscription/direct_channels/${kind}/checkout`,
        method: "POST",
      }),
      invalidatesTags: ["SubscriptionDirectChannels"],
    }),

    cancelDirectChannel: builder.mutation<
      { subscription_direct_channel: unknown },
      { userId: number; kind: DirectChannelKind }
    >({
      query: ({ userId, kind }) => ({
        url: `/users/${userId}/subscription/direct_channels/${kind}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["SubscriptionDirectChannels"],
    }),

    startDirectChannelAuth: builder.mutation<
      DirectChannelAuthStartResponse,
      { userId: number; kind: DirectChannelKind; phone?: string }
    >({
      query: ({ userId, kind, phone }) => ({
        url: `/users/${userId}/subscription/direct_channels/${kind}/auth/start`,
        method: "POST",
        data: phone ? { phone } : undefined,
      }),
    }),

    submitDirectChannelAuthCode: builder.mutation<
      DirectChannelAuthCodeResponse,
      { userId: number; kind: DirectChannelKind; code: string }
    >({
      query: ({ userId, kind, code }) => ({
        url: `/users/${userId}/subscription/direct_channels/${kind}/auth/code`,
        method: "POST",
        data: { code },
      }),
    }),

    submitDirectChannelAuthPassword: builder.mutation<
      DirectChannelAuthPasswordResponse,
      { userId: number; kind: DirectChannelKind; password: string }
    >({
      query: ({ userId, kind, password }) => ({
        url: `/users/${userId}/subscription/direct_channels/${kind}/auth/password`,
        method: "POST",
        data: { password },
      }),
    }),

    getDirectChannelAuthStatus: builder.query<
      DirectChannelAuthStatusResponse,
      { userId: number; kind: DirectChannelKind }
    >({
      query: ({ userId, kind }) => ({
        url: `/users/${userId}/subscription/direct_channels/${kind}/auth/status`,
        method: "GET",
      }),
      providesTags: ["SubscriptionDirectChannels"],
    }),
  }),
});

export const {
  useGetSubscriptionDirectPlansQuery,
  useGetSubscriptionDirectChannelsQuery,
  useCheckoutDirectChannelMutation,
  useCancelDirectChannelMutation,
  useStartDirectChannelAuthMutation,
  useSubmitDirectChannelAuthCodeMutation,
  useSubmitDirectChannelAuthPasswordMutation,
  useGetDirectChannelAuthStatusQuery,
} = subscriptionDirectApi;
