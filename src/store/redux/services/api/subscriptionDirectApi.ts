import { api } from "../api";
import type {
  SubscriptionDirectPlan,
  GetSubscriptionDirectChannelsResponse,
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
  }),
});

export const {
  useGetSubscriptionDirectPlansQuery,
  useGetSubscriptionDirectChannelsQuery,
} = subscriptionDirectApi;
