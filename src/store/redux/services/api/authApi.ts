import { api } from "../api";
import type {
  AuthResponse,
  ConfirmCodeResponse,
  MeResponse,
  ResetPasswordResponse,
  SendCodeResponse,
  TelegramIntentResponse,
  TelegramSessionResponse,
  UpdateCredentialsPayload,
  User,
  UserType,
} from "@/src/store/redux/services/api-types";

export const authApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    sendCode: builder.mutation<
      SendCodeResponse,
      { phone: string; type: UserType; method?: "flashcall" | "callback" }
    >({
      query: ({ phone, type, method }) => ({
        url: "/auth/send_code",
        method: "POST",
        data: { phone, type, ...(method && { method }) },
      }),
    }),

    confirmCode: builder.mutation<
      ConfirmCodeResponse,
      {
        phone: string;
        type?: UserType;
        code?: string;
        referral_code?: string;
      }
    >({
      query: ({ phone, type, code, referral_code }) => ({
        url: "/auth/confirm_code",
        method: "POST",
        data: {
          phone,
          ...(type && { type }),
          ...(code && { code }),
          ...(referral_code && { referral_code }),
        },
      }),
    }),

    createTelegramIntent: builder.mutation<
      TelegramIntentResponse,
      { type: UserType }
    >({
      query: ({ type }) => ({
        url: "/auth/telegram_intents",
        method: "POST",
        data: { type },
      }),
    }),

    getTelegramSession: builder.query<
      TelegramSessionResponse,
      { code: string }
    >({
      query: ({ code }) => ({
        url: "/auth/telegram_sessions",
        method: "GET",
        params: { code },
      }),
    }),

    login: builder.mutation<
      AuthResponse,
      {
        email?: string;
        phone?: string;
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

    resetPassword: builder.mutation<
      AuthResponse,
      {
        phone: string;
        code?: string;
        password: string;
        password_confirmation: string;
        type: UserType;
      }
    >({
      query: (body) => ({
        url: "/auth/reset_password",
        method: "POST",
        data: body,
      }),
    }),

    getMe: builder.query<MeResponse, void>({
      query: () => ({
        url: "/auth/show",
        method: "GET",
      }),
    }),

    logoutSession: builder.mutation<{ status: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "DELETE",
      }),
    }),

    updateCredentials: builder.mutation<
      { user?: User; customer?: User },
      {
        resourceType: "user" | "customer";
        id: number;
        data: UpdateCredentialsPayload;
      }
    >({
      query: ({ resourceType, id, data }) => ({
        url:
          resourceType === "customer"
            ? `/customers/${id}/credentials`
            : `/users/${id}/credentials`,
        method: "PATCH",
        data,
      }),
    }),
  }),
});

export const {
  useSendCodeMutation,
  useConfirmCodeMutation,
  useCreateTelegramIntentMutation,
  useLazyGetTelegramSessionQuery,
  useLoginMutation,
  useResetPasswordMutation,
  useLazyGetMeQuery,
  useLogoutSessionMutation,
  useUpdateCredentialsMutation,
} = authApi;
