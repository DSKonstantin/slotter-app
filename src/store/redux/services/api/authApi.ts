import { api } from "../api";
import { API, UserType } from "@/src/store/redux/services/api-types";

// NOTE: these are the _SAME_ API reference!
export const authApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    // 🔹 Telegram Register
    telegramRegister: builder.mutation<
      API.TelegramRegisterResponse,
      { phone: string; type: UserType }
    >({
      query: ({ phone, type }) => ({
        url: "/auth/telegram/register",
        method: "POST",
        data: { phone, type },
      }),
    }),

    getMe: builder.query<API.MeResponse, void>({
      query: () => ({
        url: "/auth/show",
        method: "GET",
      }),
    }),

    // 🔹 Telegram Register Status
    telegramRegisterStatus: builder.query<
      API.TelegramRegisterStatusResponse,
      { uuid: string }
    >({
      query: ({ uuid }) => ({
        url: "/auth/telegram/register_status",
        method: "POST",
        data: { uuid },
      }),
    }),

    // 🔹 Telegram Login (отправка кода)
    telegramLogin: builder.mutation<
      API.TelegramLoginResponse,
      { phone: string; type: UserType }
    >({
      query: ({ phone, type }) => ({
        url: "/auth/telegram/login",
        method: "POST",
        data: { phone, type },
      }),
    }),

    // 🔹 Подтверждение Telegram Login
    confirmTelegramLogin: builder.mutation<
      API.AuthResponse,
      { phone: string; code: string }
    >({
      query: ({ phone, code }) => ({
        url: "/auth/telegram/confirm_login",
        method: "POST",
        data: { phone, code },
      }),
    }),

    // 🔹 Классический login
    login: builder.mutation<
      API.AuthResponse,
      {
        email: string | null;
        phone: string;
        password: string;
        type: UserType;
      }
    >({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        data: body,
      }),
    }),

    updateUser: builder.mutation<
      API.User,
      { id: number; data: Partial<API.UpdateUserPayload> | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
      }),
    }),

    updateCustomer: builder.mutation<
      API.User,
      { id: number; data: Partial<API.UpdateUserPayload> | FormData }
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
  useTelegramRegisterMutation,
  useTelegramRegisterStatusQuery,
  useTelegramLoginMutation,
  useLoginMutation,
  useConfirmTelegramLoginMutation,
  useLazyGetMeQuery,

  useUpdateUserMutation,
  useUpdateCustomerMutation,
} = authApi;
