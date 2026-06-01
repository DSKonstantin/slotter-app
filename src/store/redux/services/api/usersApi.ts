import { api } from "../api";
import type {
  UpdateUserPayload,
  User,
} from "@/src/store/redux/services/api-types";

export const usersApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    updateUser: builder.mutation<
      User,
      { id: number; data: Partial<UpdateUserPayload> | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
    }),

    deleteUser: builder.mutation<void, number>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
    }),

    checkNickname: builder.query<{ available: boolean }, string>({
      query: (nickname) => ({
        url: `/users/nickname_availability`,
        params: { nickname },
      }),
    }),

    getCustomer: builder.query<{ customer: User }, number>({
      query: (id) => ({
        url: `/customers/${id}`,
        method: "GET",
      }),
    }),

    updateCustomer: builder.mutation<
      { customer: User },
      { id: number; data: Record<string, unknown> | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/customers/${id}`,
        method: "PATCH",
        data,
      }),
    }),
  }),
});

export const {
  useUpdateUserMutation,
  useUpdateCustomerMutation,
  useDeleteUserMutation,
  useLazyCheckNicknameQuery,
  useGetCustomerQuery,
} = usersApi;
