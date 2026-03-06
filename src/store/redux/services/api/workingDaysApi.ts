import { api } from "../api";
import type {
  BulkCreateWorkingDaysPayload,
  CreateWorkingDayBreakPayload,
  CreateWorkingDayPayload,
  UpdateWorkingDayBreakPayload,
  UpdateWorkingDayPayload,
  WorkingDay,
  WorkingDayBreak,
  WorkingDayBreaksResponse,
  WorkingDaysResponse,
} from "@/src/store/redux/services/api-types";

const unwrapWorkingDay = (response: unknown): WorkingDay => {
  if (response && typeof response === "object" && "working_day" in response) {
    return (response as { working_day: WorkingDay }).working_day;
  }

  return response as WorkingDay;
};

const unwrapWorkingDayBreak = (response: unknown): WorkingDayBreak => {
  if (
    response &&
    typeof response === "object" &&
    "working_day_break" in response
  ) {
    return (response as { working_day_break: WorkingDayBreak })
      .working_day_break;
  }

  return response as WorkingDayBreak;
};

const workingDaysApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getWorkingDays: builder.query<
      WorkingDaysResponse,
      { userId: number; date_from?: string; date_to?: string }
    >({
      query: ({ userId, date_from, date_to }) => ({
        url: `/users/${userId}/working_days`,
        method: "GET",
        params: {
          ...(date_from && { date_from }),
          ...(date_to && { date_to }),
        },
      }),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...Object.values(result)
                .filter((wd): wd is WorkingDay => wd !== null)
                .map((wd) => ({ type: "WorkingDays" as const, id: wd.id })),
              { type: "WorkingDays" as const, id: `LIST-${arg.userId}` },
            ]
          : [{ type: "WorkingDays" as const, id: `LIST-${arg.userId}` }],
    }),

    getWorkingDay: builder.query<WorkingDay, { userId: number; id: number }>({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/working_days/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapWorkingDay,
      providesTags: (_result, _error, arg) => [
        { type: "WorkingDays", id: arg.id },
      ],
    }),

    createWorkingDay: builder.mutation<
      WorkingDay,
      { userId: number; data: CreateWorkingDayPayload }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/working_days`,
        method: "POST",
        data: {
          working_day: data,
        },
      }),
      transformResponse: unwrapWorkingDay,
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDays", id: `LIST-${arg.userId}` },
      ],
    }),

    updateWorkingDay: builder.mutation<
      WorkingDay,
      { userId: number; id: number; data: UpdateWorkingDayPayload }
    >({
      query: ({ userId, id, data }) => ({
        url: `/users/${userId}/working_days/${id}`,
        method: "PATCH",
        data: {
          working_day: data,
        },
      }),
      transformResponse: unwrapWorkingDay,
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDays", id: arg.id },
        { type: "WorkingDays", id: `LIST-${arg.userId}` },
        { type: "WorkingDayBreaks", id: `LIST-${arg.id}` },
      ],
    }),

    bulkCreateWorkingDays: builder.mutation<
      WorkingDay[],
      BulkCreateWorkingDaysPayload
    >({
      query: ({ userId, working_days }) => ({
        url: `/users/${userId}/working_days/bulk_create`,
        method: "POST",
        data: { working_days },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDays", id: `LIST-${arg.userId}` },
      ],
    }),

    deleteWorkingDay: builder.mutation<void, { userId: number; id: number }>({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/working_days/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDays", id: arg.id },
        { type: "WorkingDays", id: `LIST-${arg.userId}` },
        { type: "WorkingDayBreaks", id: `LIST-${arg.id}` },
      ],
    }),
    getWorkingDayBreaks: builder.query<
      WorkingDayBreaksResponse,
      { workingDayId: number; params?: Record<string, string | number> }
    >({
      query: ({ workingDayId, params }) => ({
        url: `/working_days/${workingDayId}/working_day_breaks`,
        method: "GET",
        params,
      }),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.working_day_breaks.map((workingDayBreak) => ({
                type: "WorkingDayBreaks" as const,
                id: workingDayBreak.id,
              })),
              {
                type: "WorkingDayBreaks" as const,
                id: `LIST-${arg.workingDayId}`,
              },
            ]
          : [
              {
                type: "WorkingDayBreaks" as const,
                id: `LIST-${arg.workingDayId}`,
              },
            ],
    }),

    getWorkingDayBreak: builder.query<
      WorkingDayBreak,
      { workingDayId: number; id: number }
    >({
      query: ({ workingDayId, id }) => ({
        url: `/working_days/${workingDayId}/working_day_breaks/${id}`,
        method: "GET",
      }),
      transformResponse: unwrapWorkingDayBreak,
      providesTags: (_result, _error, arg) => [
        { type: "WorkingDayBreaks", id: arg.id },
      ],
    }),

    createWorkingDayBreak: builder.mutation<
      WorkingDayBreak,
      { workingDayId: number; data: CreateWorkingDayBreakPayload }
    >({
      query: ({ workingDayId, data }) => ({
        url: `/working_days/${workingDayId}/working_day_breaks`,
        method: "POST",
        data: {
          working_day_break: data,
        },
      }),
      transformResponse: unwrapWorkingDayBreak,
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDayBreaks", id: `LIST-${arg.workingDayId}` },
        { type: "WorkingDays", id: arg.workingDayId },
      ],
    }),

    updateWorkingDayBreak: builder.mutation<
      WorkingDayBreak,
      { workingDayId: number; id: number; data: UpdateWorkingDayBreakPayload }
    >({
      query: ({ workingDayId, id, data }) => ({
        url: `/working_days/${workingDayId}/working_day_breaks/${id}`,
        method: "PATCH",
        data: {
          working_day_break: data,
        },
      }),
      transformResponse: unwrapWorkingDayBreak,
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDayBreaks", id: arg.id },
        { type: "WorkingDayBreaks", id: `LIST-${arg.workingDayId}` },
        { type: "WorkingDays", id: arg.workingDayId },
      ],
    }),

    deleteWorkingDayBreak: builder.mutation<
      void,
      { workingDayId: number; id: number }
    >({
      query: ({ workingDayId, id }) => ({
        url: `/working_days/${workingDayId}/working_day_breaks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "WorkingDayBreaks", id: arg.id },
        { type: "WorkingDayBreaks", id: `LIST-${arg.workingDayId}` },
        { type: "WorkingDays", id: arg.workingDayId },
      ],
    }),
  }),
});

export const {
  useGetWorkingDaysQuery,
  useGetWorkingDayQuery,
  useCreateWorkingDayMutation,
  useBulkCreateWorkingDaysMutation,
  useUpdateWorkingDayMutation,
  useDeleteWorkingDayMutation,
  useGetWorkingDayBreaksQuery,
  useGetWorkingDayBreakQuery,
  useCreateWorkingDayBreakMutation,
  useUpdateWorkingDayBreakMutation,
  useDeleteWorkingDayBreakMutation,
} = workingDaysApi;
