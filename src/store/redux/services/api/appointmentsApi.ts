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

const pessimisticAppointment =
  <TArg>(getId: (arg: TArg) => number) =>
  async (arg: TArg, { dispatch, queryFulfilled }: any): Promise<void> => {
    try {
      const { data } = await queryFulfilled;
      dispatch(
        appointmentsApi.util.updateQueryData(
          "getAppointment",
          getId(arg),
          () => data,
        ),
      );
    } catch {}
  };

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
        service_id?: number;
        appointment_id?: number;
      }
    >({
      query: ({ userId, date, step, service_id, appointment_id }) => ({
        url: `/users/${userId}/available_slots`,
        method: "GET",
        params: {
          date,
          ...(step && { step }),
          ...(service_id && { service_id }),
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
      Appointment,
      { id: number; body: UpdateAppointmentPayload }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}`,
        method: "PATCH",
        data: { appointment: body },
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: async ({ id }, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            appointmentsApi.util.updateQueryData(
              "getAppointment",
              id,
              () => data,
            ),
          );
        } catch {}
      },
    }),

    userAcceptAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/user_accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment((id) => id),
    }),

    userDeclineAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/user_decline`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment((id) => id),
    }),

    arriveAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({ url: `/appointments/${id}/arrive`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment((id) => id),
    }),

    markDelayedAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/mark_delayed`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment((id) => id),
    }),

    markMissedAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/mark_missed`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment((id) => id),
    }),

    completeAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/complete`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment((id) => id),
    }),

    cancelAppointment: builder.mutation<
      Appointment,
      { id: number; body?: CancelPayload }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}/cancel`,
        method: "PATCH",
        data: { appointment: body ?? {} },
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment(({ id }) => id),
    }),

    rescheduleAppointment: builder.mutation<
      Appointment,
      { id: number; body: ReschedulePayload }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}/reschedule`,
        method: "PATCH",
        data: { appointment: body },
      }),
      invalidatesTags: ["Appointments"],
      onQueryStarted: pessimisticAppointment(({ id }) => id),
    }),

    remindAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({ url: `/appointments/${id}/remind`, method: "PATCH" }),
      invalidatesTags: (_, __, id) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    cancelAppointmentByToken: builder.mutation<
      { appointment: Appointment },
      string
    >({
      query: (publicToken) => ({
        url: `/appointments/by_token/${publicToken}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: (result) =>
        result
          ? ["Appointments", { type: "Appointment", id: result.appointment.id }]
          : ["Appointments"],
    }),

    customerAcceptAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/customer_accept`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
    }),

    customerDeclineAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/customer_decline`,
        method: "PATCH",
      }),
      invalidatesTags: ["Appointments"],
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
  useGetUpcomingAppointmentsQuery,
  useGetAvailableSlotsQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useUserAcceptAppointmentMutation,
  useUserDeclineAppointmentMutation,
  useArriveAppointmentMutation,
  useMarkDelayedAppointmentMutation,
  useMarkMissedAppointmentMutation,
  useCompleteAppointmentMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useRemindAppointmentMutation,
  useCancelAppointmentByTokenMutation,
  useCustomerAcceptAppointmentMutation,
  useCustomerDeclineAppointmentMutation,
} = appointmentsApi;
