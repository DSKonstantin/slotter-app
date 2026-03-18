import { api } from "../api";
import type {
  AuthResponse,
  MeResponse,
  TelegramLoginResponse,
  TelegramRegisterResponse,
  TelegramRegisterStatusResponse,
  UpdateUserPayload,
  User,
  UserType,
} from "@/src/store/redux/services/api-types";

// NOTE: these are the _SAME_ API reference!
export const authApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    // 🔹 Telegram Register
    telegramRegister: builder.mutation<
      TelegramRegisterResponse,
      { phone: string; type: UserType }
    >({
      query: ({ phone, type }) => ({
        url: "/auth/telegram/register",
        method: "POST",
        data: { phone, type },
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => ({
        url: "/auth/show",
        method: "GET",
      }),
    }),

    // 🔹 Telegram Register Status
    telegramRegisterStatus: builder.query<
      TelegramRegisterStatusResponse,
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
      TelegramLoginResponse,
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
      AuthResponse,
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
      AuthResponse,
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
      User,
      { id: number; data: Partial<UpdateUserPayload> | FormData }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        data,
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
  useTelegramRegisterMutation,
  useTelegramRegisterStatusQuery,
  useTelegramLoginMutation,
  useLoginMutation,
  useConfirmTelegramLoginMutation,
  useLazyGetMeQuery,

  useUpdateUserMutation,
  useUpdateCustomerMutation,
} = authApi;
