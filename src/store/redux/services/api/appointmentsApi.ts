import { api } from "@/src/store/redux/services/api";
import type {
  Appointment,
  GetCustomerUpcomingAppointmentsResponse,
  GetCustomerVisitedUsersResponse,
} from "@/src/store/redux/services/api-types";

const appointmentsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    customerAcceptAppointment: builder.mutation<Appointment, number>({
      query: (id) => ({
        url: `/appointments/${id}/customer_accept`,
        method: "PATCH",
      }),
    }),

    getCustomerUpcomingAppointments: builder.query<
      GetCustomerUpcomingAppointmentsResponse,
      number
    >({
      query: (customerId) => ({
        url: `/customers/${customerId}/upcoming_appointments`,
        method: "GET",
      }),
    }),

    getCustomerVisitedUsers: builder.query<
      GetCustomerVisitedUsersResponse,
      number
    >({
      query: (customerId) => ({
        url: `/customers/${customerId}/visited_users`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCustomerAcceptAppointmentMutation,
  useGetCustomerUpcomingAppointmentsQuery,
  useGetCustomerVisitedUsersQuery,
} = appointmentsApi;
