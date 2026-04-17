import { api } from "../api";
import type {
  Customer,
  CustomerTag,
  GetCustomersParams,
  GetCustomersResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  AssignTagPayload,
  CreateCustomerTagPayload,
  UpdateCustomerTagPayload,
} from "@/src/store/redux/services/api-types";

const customersApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getCustomers: builder.query<
      GetCustomersResponse,
      { userId: number } & GetCustomersParams
    >({
      query: ({ userId, ...params }) => ({
        url: `/users/${userId}/customers`,
        method: "GET",
        params,
      }),
      providesTags: ["Customers"],
    }),

    getCustomer: builder.query<{ customer: Customer }, { customerId: number }>({
      query: ({ customerId }) => ({
        url: `/customers/${customerId}`,
        method: "GET",
      }),
      providesTags: ["Customers"],
    }),

    createCustomer: builder.mutation<
      { customer: Customer },
      CreateCustomerPayload
    >({
      query: (body) => ({
        url: "/customers",
        method: "POST",
        data: { customer: body },
      }),
      invalidatesTags: ["Customers"],
    }),

    updateCustomer: builder.mutation<
      { customer: Customer },
      { customerId: number; body: UpdateCustomerPayload }
    >({
      query: ({ customerId, body }) => ({
        url: `/customers/${customerId}`,
        method: "PATCH",
        data: { customer: body },
      }),
      invalidatesTags: ["Customers"],
    }),

    deleteCustomer: builder.mutation<void, { customerId: number }>({
      query: ({ customerId }) => ({
        url: `/customers/${customerId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),

    assignTag: builder.mutation<
      { customer: Customer },
      { customerId: number; body: AssignTagPayload }
    >({
      query: ({ customerId, body }) => ({
        url: `/customers/${customerId}/assign_tag`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Customers"],
    }),

    unassignTag: builder.mutation<
      { customer: Customer },
      { customerId: number }
    >({
      query: ({ customerId }) => ({
        url: `/customers/${customerId}/unassign_tag`,
        method: "DELETE",
      }),
      invalidatesTags: ["Customers"],
    }),

    getCustomerTags: builder.query<
      { customer_tags: CustomerTag[] },
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/customer_tags`,
        method: "GET",
      }),
      providesTags: ["CustomerTags"],
    }),

    createCustomerTag: builder.mutation<
      { customer_tag: CustomerTag },
      { userId: number; body: CreateCustomerTagPayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/customer_tags`,
        method: "POST",
        data: { customer_tag: body },
      }),
      invalidatesTags: ["CustomerTags"],
    }),

    updateCustomerTag: builder.mutation<
      { customer_tag: CustomerTag },
      { userId: number; tagId: number; body: UpdateCustomerTagPayload }
    >({
      query: ({ userId, tagId, body }) => ({
        url: `/users/${userId}/customer_tags/${tagId}`,
        method: "PATCH",
        data: { customer_tag: body },
      }),
      invalidatesTags: ["CustomerTags"],
    }),

    deleteCustomerTag: builder.mutation<
      void,
      { userId: number; tagId: number }
    >({
      query: ({ userId, tagId }) => ({
        url: `/users/${userId}/customer_tags/${tagId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerTags"],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useAssignTagMutation,
  useUnassignTagMutation,
  useGetCustomerTagsQuery,
  useCreateCustomerTagMutation,
  useUpdateCustomerTagMutation,
  useDeleteCustomerTagMutation,
} = customersApi;
