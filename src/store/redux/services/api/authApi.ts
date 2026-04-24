import { api } from "../api";
import type {
  AuthResponse,
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
      { phone: string; type: UserType }
    >({
      query: ({ phone, type }) => ({
        url: "/auth/send_code",
        method: "POST",
        data: { phone, type },
      }),
    }),

    confirmCode: builder.mutation<
      AuthResponse,
      { phone: string; code: string }
    >({
      query: ({ phone, code }) => ({
        url: "/auth/confirm_code",
        method: "POST",
        data: { phone, code },
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
        code: string;
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
      User,
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
  useLoginMutation,
  useResetPasswordMutation,
  useLazyGetMeQuery,
  useLogoutSessionMutation,
  useUpdateCredentialsMutation,
} = authApi;
