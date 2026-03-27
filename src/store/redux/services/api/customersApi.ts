import { api } from "../api";
import type {
  Customer,
  CustomerStatsResponse,
  CustomerBalanceResponse,
  GetCustomersParams,
  GetCustomersResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/src/store/redux/services/api-types";

const customersApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getCustomers: builder.query<
      GetCustomersResponse,
      { userId: number; params?: GetCustomersParams }
    >({
      query: ({ userId, params }) => ({
        url: `/users/${userId}/customers`,
        method: "GET",
        params,
      }),
      providesTags: ["Customers"],
    }),

    getCustomer: builder.query<
      { customer: Customer },
      { userId: number; customerId: number }
    >({
      query: ({ userId, customerId }) => ({
        url: `/users/${userId}/customers/${customerId}`,
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),

    getCustomerStats: builder.query<
      CustomerStatsResponse,
      { userId: number; customerId: number; period?: string }
    >({
      query: ({ userId, customerId, period }) => ({
        url: `/users/${userId}/customers/${customerId}/stats`,
        method: "GET",
        params: period ? { period } : undefined,
      }),
    }),

    getCustomerBalance: builder.query<
      CustomerBalanceResponse,
      { userId: number; customerId: number; period?: string }
    >({
      query: ({ userId, customerId, period }) => ({
        url: `/users/${userId}/customers/${customerId}/balance`,
        method: "GET",
        params: period ? { period } : undefined,
      }),
    }),

    createCustomer: builder.mutation<
      { customer: Customer },
      { userId: number; body: CreateCustomerPayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/customers`,
        method: "POST",
        data: { customer: body },
      }),
      invalidatesTags: ["Customers"],
    }),

    updateCustomer: builder.mutation<
      { customer: Customer },
      { userId: number; customerId: number; body: UpdateCustomerPayload }
    >({
      query: ({ userId, customerId, body }) => ({
        url: `/users/${userId}/customers/${customerId}`,
        method: "PATCH",
        data: { customer: body },
      }),
      invalidatesTags: ["Customers"],
    }),

    deleteCustomer: builder.mutation<
      void,
      { userId: number; customerId: number }
    >({
      query: ({ userId, customerId }) => ({
        url: `/users/${userId}/customers/${customerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useGetCustomerStatsQuery,
  useGetCustomerBalanceQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi;
