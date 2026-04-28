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

    checkNickname: builder.query<{ available: boolean }, string>({
      query: (nickname) => ({
        url: `/users/nickname_availability`,
        params: { nickname },
      }),
    }),

    updateCustomer: builder.mutation<
      User,
      { id: number; data: Partial<UpdateUserPayload> | FormData }
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
  useLazyCheckNicknameQuery,
} = usersApi;
