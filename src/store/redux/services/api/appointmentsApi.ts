import { api } from "../api";
import type {
  Appointment,
  GetAppointmentsParams,
  GetAppointmentsResponse,
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
      providesTags: ["Appointments"],
    }),

    getAvailableSlots: builder.query<
      string[],
      { userId: number; date: string; step?: 5 | 10 | 15 }
    >({
      query: ({ userId, date, step = 15 }) => ({
        url: `/users/${userId}/available_slots`,
        method: "GET",
        params: { date, step },
      }),
    }),

    createAppointment: builder.mutation<
      { appointment: Appointment },
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
    }),

    confirmAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/confirm`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
    }),

    arriveAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/arrive`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
    }),

    markLateAppointment: builder.mutation<{ appointment: Appointment }, number>(
      {
        query: (id) => ({
          url: `/appointments/${id}/mark_late`,
          method: "PATCH",
        }),
        invalidatesTags: ["Appointments"],
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
    }),

    completeAppointment: builder.mutation<{ appointment: Appointment }, number>(
      {
        query: (id) => ({
          url: `/appointments/${id}/complete`,
          method: "PATCH",
        }),
        invalidatesTags: ["Appointments"],
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
    }),

    remindAppointment: builder.mutation<{ appointment: Appointment }, number>({
      query: (id) => ({ url: `/appointments/${id}/remind`, method: "PATCH" }),
      invalidatesTags: ["Appointments"],
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
    }),
  }),
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentQuery,
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
} = appointmentsApi;
