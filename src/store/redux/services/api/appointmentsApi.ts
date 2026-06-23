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
      invalidatesTags: (_, __, { id }) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    confirmAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/confirm`, method: "PATCH" }),
      invalidatesTags: (_, __, id) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    arriveAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/arrive`, method: "PATCH" }),
      invalidatesTags: (_, __, id) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    markLateAppointment: builder.mutation<{ appointment: Appointment }, number>(
      {
        query: (id) => ({
          url: `/appointments/${id}/mark_late`,
          method: "PATCH",
        }),
        invalidatesTags: (_, __, id) => [
          "Appointments",
          { type: "Appointment", id },
        ],
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
      invalidatesTags: (_, __, id) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    completeAppointment: builder.mutation<{ appointment: Appointment }, number>(
      {
        query: (id) => ({
          url: `/appointments/${id}/complete`,
          method: "PATCH",
        }),
        invalidatesTags: (_, __, id) => [
          "Appointments",
          { type: "Appointment", id },
        ],
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
      invalidatesTags: (_, __, { id }) => [
        "Appointments",
        { type: "Appointment", id },
      ],
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
      invalidatesTags: (_, __, { id }) => [
        "Appointments",
        { type: "Appointment", id },
      ],
    }),

    remindAppointment: builder.mutation<{ appointment: Appointment }, number>({
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
