import { api } from "../api";
import type {
  CreateUserCustomerPayload,
  GetUserCustomerAppointmentsParams,
  GetUserCustomerAppointmentsResponse,
  GetUserCustomerFinancesParams,
  GetUserCustomerFinancesResponse,
  GetUserCustomerResponse,
  GetUserCustomersParams,
  GetUserCustomersResponse,
  GetUserCustomersStatisticsParams,
  GetUserCustomersStatisticsResponse,
  UpdateUserCustomerPayload,
} from "@/src/store/redux/services/api-types";

const userCustomersApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getUserCustomers: builder.query<
      GetUserCustomersResponse,
      { userId: number } & GetUserCustomersParams
    >({
      query: ({ userId, ...params }) => ({
        url: `/users/${userId}/user_customers`,
        method: "GET",
        params,
      }),
      providesTags: ["UserCustomers"],
    }),

    getUserCustomersPaginated: builder.infiniteQuery<
      GetUserCustomersResponse,
      { userId: number } & Omit<GetUserCustomersParams, "page">,
      number
    >({
      query: ({ queryArg, pageParam }) => {
        const { userId, ...params } = queryArg;
        return {
          url: `/users/${userId}/user_customers`,
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
      providesTags: ["UserCustomers"],
    }),

    getUserCustomer: builder.query<
      GetUserCustomerResponse,
      { userId: number; id: number }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/user_customers/${id}`,
        method: "GET",
      }),
      providesTags: ["UserCustomers"],
    }),

    createUserCustomer: builder.mutation<
      GetUserCustomerResponse,
      { userId: number; body: CreateUserCustomerPayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/user_customers`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["UserCustomers"],
    }),

    updateUserCustomer: builder.mutation<
      GetUserCustomerResponse,
      { userId: number; id: number; body: UpdateUserCustomerPayload }
    >({
      query: ({ userId, id, body }) => ({
        url: `/users/${userId}/user_customers/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["UserCustomers"],
    }),

    getUserCustomerAppointments: builder.query<
      GetUserCustomerAppointmentsResponse,
      { userId: number; id: number; params?: GetUserCustomerAppointmentsParams }
    >({
      query: ({ userId, id, params }) => ({
        url: `/users/${userId}/user_customers/${id}/appointments`,
        method: "GET",
        params,
      }),
      providesTags: ["UserCustomers", "Appointments"],
    }),

    getUserCustomerFinances: builder.query<
      GetUserCustomerFinancesResponse,
      { userId: number; id: number; params?: GetUserCustomerFinancesParams }
    >({
      query: ({ userId, id, params }) => ({
        url: `/users/${userId}/user_customers/${id}/finances`,
        method: "GET",
        params,
      }),
      providesTags: ["UserCustomers"],
    }),

    getUserCustomersStatistics: builder.query<
      GetUserCustomersStatisticsResponse,
      { userId: number; params?: GetUserCustomersStatisticsParams }
    >({
      query: ({ userId, params }) => ({
        url: `/users/${userId}/user_customers/statistics`,
        method: "GET",
        params,
      }),
      providesTags: ["UserCustomers"],
    }),
  }),
});

export const {
  useGetUserCustomersQuery,
  useGetUserCustomersPaginatedInfiniteQuery,
  useGetUserCustomerQuery,
  useCreateUserCustomerMutation,
  useUpdateUserCustomerMutation,
  useGetUserCustomerAppointmentsQuery,
  useGetUserCustomerFinancesQuery,
  useGetUserCustomersStatisticsQuery,
} = userCustomersApi;
