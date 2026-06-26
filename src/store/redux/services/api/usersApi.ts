import { api } from "../api";
import type {
  UpdateUserPayload,
  User,
} from "@/src/store/redux/services/api-types";

export const usersApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    updateUser: builder.mutation<
      { user: User },
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
  }),
});

export const {
  useUpdateUserMutation,
  useDeleteUserMutation,
  useLazyCheckNicknameQuery,
} = usersApi;
