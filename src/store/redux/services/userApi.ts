import { api } from "./api";
import { API } from "@/src/store/redux/services/api-types";

const authApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    updateUser: builder.mutation<
      API.User,
      { id: number; data: Partial<API.UpdateUserPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
    }),

    // 🔹 Update Customer
    updateCustomer: builder.mutation<
      API.User,
      { id: number; data: Partial<API.UpdateUserPayload> }
    >({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PATCH",
        data,
      }),
    }),
  }),
});

export const { useUpdateUserMutation, useUpdateCustomerMutation } = authApi;
