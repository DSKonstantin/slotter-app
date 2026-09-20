import { api } from "../api";
import type {
  CreateMarketingBroadcastPayload,
  GetMarketingBroadcastAudiencePayload,
  GetMarketingBroadcastAudienceResponse,
  GetMarketingBroadcastResponse,
  GetMarketingBroadcastsParams,
  GetMarketingBroadcastsResponse,
  MarketingBroadcast,
} from "@/src/store/redux/services/api-types";

const marketingBroadcastsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getMarketingBroadcastsPaginated: builder.infiniteQuery<
      GetMarketingBroadcastsResponse,
      { userId: number } & GetMarketingBroadcastsParams,
      number
    >({
      query: ({ queryArg, pageParam }) => {
        const { userId, ...params } = queryArg;
        return {
          url: `/users/${userId}/marketing_broadcasts`,
          method: "GET",
          params: { ...params, page: pageParam },
        };
      },
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          const { current_page, total_pages } = lastPage.pagination;
          return current_page < total_pages ? current_page + 1 : undefined;
        },
      },
      providesTags: ["MarketingBroadcasts"],
    }),

    getMarketingBroadcast: builder.query<
      GetMarketingBroadcastResponse,
      { userId: number; id: number }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/marketing_broadcasts/${id}`,
        method: "GET",
      }),
      providesTags: ["MarketingBroadcasts"],
    }),

    getMarketingBroadcastAudience: builder.mutation<
      GetMarketingBroadcastAudienceResponse,
      { userId: number; body: GetMarketingBroadcastAudiencePayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/marketing_broadcasts/audience`,
        method: "POST",
        data: body,
      }),
    }),

    createMarketingBroadcast: builder.mutation<
      { marketing_broadcast: MarketingBroadcast },
      {
        userId: number;
        body: CreateMarketingBroadcastPayload;
        idempotencyKey: string;
      }
    >({
      query: ({ userId, body, idempotencyKey }) => ({
        url: `/users/${userId}/marketing_broadcasts`,
        method: "POST",
        data: { marketing_broadcast: body },
        headers: { "Idempotency-Key": idempotencyKey },
      }),
      invalidatesTags: ["MarketingBroadcasts"],
    }),

    cancelMarketingBroadcast: builder.mutation<
      { marketing_broadcast: MarketingBroadcast },
      { userId: number; id: number }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/marketing_broadcasts/${id}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["MarketingBroadcasts"],
    }),
  }),
});

export const {
  useGetMarketingBroadcastsPaginatedInfiniteQuery,
  useGetMarketingBroadcastQuery,
  useGetMarketingBroadcastAudienceMutation,
  useCreateMarketingBroadcastMutation,
  useCancelMarketingBroadcastMutation,
} = marketingBroadcastsApi;
