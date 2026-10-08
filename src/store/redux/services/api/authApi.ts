import { api } from "../api";
import type {
  AuthResponse,
  ConfirmCodeMethod,
  SendCodeMethod,
  ConfirmCodeResponse,
  MeResponse,
  SendCodeResponse,
  UpdateCredentialsPayload,
  User,
  UserType,
} from "@/src/store/redux/services/api-types";

export const authApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    sendCode: builder.mutation<
      SendCodeResponse,
      {
        phone: string;
        type: UserType;
        method?: SendCodeMethod;
      }
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
        method?: ConfirmCodeMethod;
        referral_code?: string;
      }
    >({
      query: ({ phone, type, code, method, referral_code }) => ({
        url: "/auth/confirm_code",
        method: "POST",
        data: {
          phone,
          ...(type && { type }),
          ...(code && { code }),
          ...(method && { method }),
          ...(referral_code && { referral_code }),
        },
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
      { user?: User },
      {
        id: number;
        data: UpdateCredentialsPayload;
      }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/credentials`,
        method: "PATCH",
        data,
      }),
    }),
  }),
});

export const {
  useSendCodeMutation,
  useConfirmCodeMutation,
  useLoginMutation,
  useResetPasswordMutation,
  useLazyGetMeQuery,
  useLogoutSessionMutation,
  useUpdateCredentialsMutation,
} = authApi;
