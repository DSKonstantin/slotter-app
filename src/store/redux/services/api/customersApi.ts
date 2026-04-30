import { api } from "../api";
import type {
  CustomerTag,
  CreateCustomerTagPayload,
  UpdateCustomerTagPayload,
} from "@/src/store/redux/services/api-types";

const customersApi = api.injectEndpoints({
  overrideExisting: __DEV__,
  endpoints: (builder) => ({
    getCustomerTags: builder.query<
      { customer_tags: CustomerTag[] },
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/customer_tags`,
        method: "GET",
      }),
      providesTags: ["CustomerTags"],
    }),

    createCustomerTag: builder.mutation<
      { customer_tag: CustomerTag },
      { userId: number; body: CreateCustomerTagPayload }
    >({
      query: ({ userId, body }) => ({
        url: `/users/${userId}/customer_tags`,
        method: "POST",
        data: { customer_tag: body },
      }),
      invalidatesTags: ["CustomerTags"],
    }),

    updateCustomerTag: builder.mutation<
      { customer_tag: CustomerTag },
      { userId: number; tagId: number; body: UpdateCustomerTagPayload }
    >({
      query: ({ userId, tagId, body }) => ({
        url: `/users/${userId}/customer_tags/${tagId}`,
        method: "PATCH",
        data: { customer_tag: body },
      }),
      invalidatesTags: ["CustomerTags"],
    }),

    deleteCustomerTag: builder.mutation<
      void,
      { userId: number; tagId: number }
    >({
      query: ({ userId, tagId }) => ({
        url: `/users/${userId}/customer_tags/${tagId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["CustomerTags"],
    }),
  }),
});

export const {
  useGetCustomerTagsQuery,
  useCreateCustomerTagMutation,
  useUpdateCustomerTagMutation,
  useDeleteCustomerTagMutation,
} = customersApi;
