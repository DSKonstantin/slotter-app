import { api } from "../api";
import {
  CreateUserLinkPayload,
  UpdateUserLinkPayload,
  UserLink,
} from "@/src/store/redux/services/api-types";

export const userLinksApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    getUserLinks: builder.query<UserLink[], number>({
      query: (userId) => ({
        url: `/users/${userId}/user_links`,
        method: "GET",
      }),

      transformResponse: (response: { user_links: UserLink[] }) =>
        response.user_links,

      providesTags: (result, error, userId) => [
        {
          type: "UserLinks",
          id: userId,
        },
      ],
    }),

    createUserLink: builder.mutation<
      UserLink,
      {
        userId: number;
        data: CreateUserLinkPayload;
      }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/user_links`,
        method: "POST",

        data: {
          user_link: data,
        },
      }),

      transformResponse: (response: { user_link: UserLink }) =>
        response.user_link,

      invalidatesTags: (result, error, { userId }) => [
        {
          type: "UserLinks",
          id: userId,
        },
      ],
    }),

    updateUserLink: builder.mutation<
      UserLink,
      {
        userId: number;
        id: number;
        data: UpdateUserLinkPayload;
      }
    >({
      query: ({ userId, id, data }) => ({
        url: `/users/${userId}/user_links/${id}`,

        method: "PATCH",

        data: {
          user_link: data,
        },
      }),

      transformResponse: (response: { user_link: UserLink }) =>
        response.user_link,

      invalidatesTags: (result, error, { userId }) => [
        {
          type: "UserLinks",
          id: userId,
        },
      ],
    }),

    deleteUserLink: builder.mutation<
      void,
      {
        userId: number;
        id: number;
      }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/user_links/${id}`,

        method: "DELETE",
      }),

      invalidatesTags: (result, error, { userId }) => [
        {
          type: "UserLinks",
          id: userId,
        },
      ],
    }),
  }),
});

export const {
  useGetUserLinksQuery,
  useCreateUserLinkMutation,
  useUpdateUserLinkMutation,
  useDeleteUserLinkMutation,
} = userLinksApi;
