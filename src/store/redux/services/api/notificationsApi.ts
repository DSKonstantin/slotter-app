import { api } from "../api";
import type {
  GetNotificationsParams,
  GetNotificationsResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  GetNotificationSettingsResponse,
  UpdateNotificationSettingsPayload,
  NotificationStatsResponse,
  GetNotificationStatsParams,
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

    getNotificationSettings: builder.query<
      GetNotificationSettingsResponse,
      number
    >({
      query: (userId) => ({
        url: `/users/${userId}/notification_settings`,
        method: "GET",
      }),
      providesTags: ["NotificationSettings"],
    }),

    getNotificationStats: builder.query<
      NotificationStatsResponse,
      GetNotificationStatsParams
    >({
      query: ({ userId, from, to }) => ({
        url: `/users/${userId}/notification_stats`,
        method: "GET",
        params: { from, to },
      }),
    }),

    updateNotificationSettings: builder.mutation<
      GetNotificationSettingsResponse,
      UpdateNotificationSettingsPayload
    >({
      query: ({ userId, settings }) => ({
        url: `/users/${userId}/notification_settings`,
        method: "PATCH",
        data: { settings },
      }),
      async onQueryStarted({ userId, settings }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (api as any).util.updateQueryData(
            "getNotificationSettings",
            userId,
            (draft: GetNotificationSettingsResponse) => {
              draft.notification_settings.forEach((s) => {
                if (s.kind in settings) s.enabled = settings[s.kind]!;
              });
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationsPaginatedInfiniteQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetNotificationSettingsQuery,
  useUpdateNotificationSettingsMutation,
  useGetNotificationStatsQuery,
} = notificationsApi;
