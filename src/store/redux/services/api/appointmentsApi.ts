import { api } from "../api";
import type {
  Appointment,
  GetAppointmentsParams,
  GetAppointmentsResponse,
  GetUpcomingAppointmentsResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  ReschedulePayload,
  CancelPayload,
} from "@/src/store/redux/services/api-types";

const appointmentsApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getAppointments: builder.query<
      GetAppointmentsResponse,
      { userId: number; params?: GetAppointmentsParams }
    >({
      query: ({ userId, params }) => ({
        url: `/users/${userId}/appointments`,
        method: "GET",
        params: params
          ? {
              ...params,
              ...(params.status && { status: params.status.join(",") }),
            }
          : undefined,
      }),
      providesTags: ["Appointments"],
    }),

    getAppointment: builder.query<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: "GET",
      }),
      providesTags: (_, __, id) => [{ type: "Appointment", id }],
    }),

    getUpcomingAppointments: builder.query<
      GetUpcomingAppointmentsResponse,
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/upcoming_appointments`,
        method: "GET",
      }),
    }),

    getAvailableSlots: builder.query<
      string[],
      {
        userId: number;
        date: string;
        step?: 5 | 10 | 15 | 30 | 60;
        appointment_id?: number;
      }
    >({
      query: ({ userId, date, step = 15, appointment_id }) => ({
        url: `/users/${userId}/available_slots`,
        method: "GET",
        params: {
          date,
          step,
          ...(appointment_id && { appointment_id }),
        },
      }),
      transformResponse: (
        raw: string[] | { available_slots: string[] },
      ): string[] => (Array.isArray(raw) ? raw : (raw.available_slots ?? [])),
    }),

    createAppointment: builder.mutation<
      Appointment,
      { userId: number; body: CreateAppointmentPayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/appointments`,
        method: "POST",
        data: { appointment: body },
      }),
      invalidatesTags: ["Appointments"],
    }),

    updateAppointment: builder.mutation<
      { appointment: Appointment },
      { id: number; body: UpdateAppointmentPayload }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}`,
        method: "PATCH",
        data: { appointment: body },
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: ({ id, body }, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(id, body, dispatch, queryFulfilled),
    }),

    confirmAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/confirm`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: (id, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(
          id,
          { status: "confirmed" },
          dispatch,
          queryFulfilled,
        ),
    }),

    arriveAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/arrive`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: (id, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(
          id,
          { status: "arrived" },
          dispatch,
          queryFulfilled,
        ),
    }),

    markLateAppointment: builder.mutation<{ appointment: Appointment }, number>(
      {
        query: (id) => ({
          url: `/appointments/${id}/mark_late`,
          method: "PATCH",
        }),
        invalidatesTags: ["Appointments"],
        onQueryStarted: (id, { dispatch, queryFulfilled }) =>
          syncAppointmentCache(
            id,
            { status: "late" },
            dispatch,
            queryFulfilled,
          ),
      },
    ),

    markNoShowAppointment: builder.mutation<
      { appointment: Appointment },
      number
    >({
      query: (id) => ({
        url: `/appointments/${id}/mark_no_show`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: (id, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(
          id,
          { status: "no_show" },
          dispatch,
          queryFulfilled,
        ),
    }),

    completeAppointment: builder.mutation<{ appointment: Appointment }, number>(
      {
        query: (id) => ({
          url: `/appointments/${id}/complete`,
          method: "PATCH",
        }),
        invalidatesTags: ["Appointments"],
        onQueryStarted: (id, { dispatch, queryFulfilled }) =>
          syncAppointmentCache(
            id,
            { status: "completed" },
            dispatch,
            queryFulfilled,
          ),
      },
    ),

    cancelAppointment: builder.mutation<
      { appointment: Appointment },
      { id: number; body?: CancelPayload }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}/cancel`,
        method: "PATCH",
        data: { appointment: body ?? {} },
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: ({ id }, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(
          id,
          { status: "cancelled" },
          dispatch,
          queryFulfilled,
        ),
    }),

    rescheduleAppointment: builder.mutation<
      { appointment: Appointment },
      { id: number; body: ReschedulePayload }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}/reschedule`,
        method: "PATCH",
        data: { appointment: body },
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: ({ id, body }, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(id, body, dispatch, queryFulfilled),
    }),

    remindAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/remind`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: (id, { dispatch, queryFulfilled }) =>
        syncAppointmentCache(id, null, dispatch, queryFulfilled),
    }),

    cancelAppointmentByToken: builder.mutation<
      { appointment: Appointment },
      string
    >({
      query: (publicToken) => ({
        url: `/appointments/by_token/${publicToken}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            appointmentsApi.util.updateQueryData(
              "getAppointment",
              data.appointment.id,
              () => data.appointment,
            ),
          );
        } catch {
          // no optimistic patch to undo
        }
      },
    }),

    customerAcceptAppointment: builder.mutation<
      { appointment: Appointment },
      number
    >({
      query: (id) => ({
        url: `/appointments/${id}/customer_accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
    }),

    customerDeclineAppointment: builder.mutation<
      { appointment: Appointment },
      number
    >({
      query: (id) => ({
        url: `/appointments/${id}/customer_decline`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
    }),
  }),
});

async function syncAppointmentCache(
  id: number,
  body: Partial<Appointment> | null | undefined,
  dispatch: (action: any) => any,
  queryFulfilled: Promise<{ data: { appointment: Appointment } }>,
): Promise<void> {
  const patch = body
    ? dispatch(
        appointmentsApi.util.updateQueryData("getAppointment", id, (draft) => {
          Object.assign(draft, body);
        }),
      )
    : null;
  try {
    const { data } = await queryFulfilled;
    dispatch(
      appointmentsApi.util.updateQueryData(
        "getAppointment",
        id,
        () => data.appointment,
      ),
    );
  } catch {
    patch?.undo();
  }
}

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useGetUpcomingAppointmentsQuery,
  useGetAvailableSlotsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useConfirmAppointmentMutation,
  useArriveAppointmentMutation,
  useMarkLateAppointmentMutation,
  useMarkNoShowAppointmentMutation,
  useCompleteAppointmentMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useRemindAppointmentMutation,
  useCancelAppointmentByTokenMutation,
  useCustomerAcceptAppointmentMutation,
  useCustomerDeclineAppointmentMutation,
} = appointmentsApi;
