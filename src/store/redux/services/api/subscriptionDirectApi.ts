import { api } from "../api";
import { subscribeToResource } from "@/src/services/chat/cableChannels";
import type {
  SubscriptionDirectPlan,
  GetSubscriptionDirectChannelsResponse,
  ResourceChannelEvent,
} from "@/src/store/redux/services/api-types";
import type { RootState } from "@/src/store/redux/store";

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
      async onCacheEntryAdded(
        _arg,
        { cacheDataLoaded, cacheEntryRemoved, dispatch, getState },
      ) {
        const token = (getState() as RootState).auth.token;
        const sub = subscribeToResource(token);
        if (!sub) return;

        try {
          await cacheDataLoaded;

          sub.on("message", (event: ResourceChannelEvent) => {
            if (
              !("event" in event) ||
              event.event !== "direct_channel_activated"
            )
              return;

            dispatch(
              subscriptionDirectApi.util.invalidateTags([
                "SubscriptionDirectChannels",
              ]),
            );
          });
        } catch {}

        await cacheEntryRemoved;
        sub.disconnect();
      },
    }),
  }),
});

export const {
  useGetSubscriptionDirectPlansQuery,
  useGetSubscriptionDirectChannelsQuery,
} = subscriptionDirectApi;
