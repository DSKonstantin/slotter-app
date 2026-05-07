import { api } from "../api";
import type {
  GetNotificationsParams,
  GetNotificationsResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
} from "@/src/store/redux/services/api-types";

const notificationsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getNotifications: builder.query<
      GetNotificationsResponse,
      GetNotificationsParams | void
    >({
      query: (params) => ({
        url: `/notifications`,
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["Notifications"],
    }),

    getNotificationsPaginated: builder.infiniteQuery<
      GetNotificationsResponse,
      Omit<GetNotificationsParams, "page">,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/notifications`,
        method: "GET",
        params: { ...queryArg, page: pageParam },
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          const { current_page, total_pages } = lastPage.pagination;
          return current_page < total_pages ? current_page + 1 : undefined;
        },
      },
      providesTags: ["Notifications"],
    }),

    markNotificationRead: builder.mutation<
      MarkNotificationReadResponse,
      number
    >({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),

    markAllNotificationsRead: builder.mutation<
      MarkAllNotificationsReadResponse,
      void
    >({
      query: () => ({
        url: `/notifications/read_all`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationsPaginatedInfiniteQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationsApi;
