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

    // TODO: заменить мок на реальный эндпоинт
    checkNickname: builder.query<
      { available: boolean; suggestions?: string[] },
      string
    >({
      queryFn: async (nickname) => {
        await new Promise((r) => setTimeout(r, 500));
        const taken = ["ivan", "barber", "admin", "test"];
        const isAvailable = !taken.includes(nickname.toLowerCase());
        return {
          data: isAvailable
            ? { available: true }
            : {
                available: false,
                suggestions: [
                  `${nickname}.pro`,
                  `${nickname}_master`,
                  `${nickname}.barber`,
                ],
              },
        };
      },
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
