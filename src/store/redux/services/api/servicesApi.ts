import { api } from "../api";
import type {
  AdditionalService,
  CreateAdditionalServicePayload,
  CreateServiceCategoryPayload,
  CreateServicePayload,
  PaginatedResponse,
  Service,
  ServiceCategory,
  UpdateServiceCategoryPayload,
  UpdateServicePayload,
} from "@/src/store/redux/services/api-types";

const servicesApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    // =========================
    // SERVICE CATEGORIES
    // =========================

    getServiceCategories: builder.query<
      PaginatedResponse<ServiceCategory>,
      { userId: number; params?: Record<string, string | number> }
    >({
      query: ({ userId, params }) => ({
        url: `/users/${userId}/service_categories`,
        method: "GET",
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.service_categories.map((category) => ({
                type: "ServiceCategories" as const,
                id: category.id,
              })),
              { type: "ServiceCategories" as const, id: "LIST" },
            ]
          : [{ type: "ServiceCategories" as const, id: "LIST" }],
    }),

    createServiceCategory: builder.mutation<
      ServiceCategory,
      { userId: number; data: CreateServiceCategoryPayload }
    >({
      query: ({ userId, data }) => ({
        url: `/users/${userId}/service_categories`,
        method: "POST",
        data: {
          service_category: data,
        },
      }),
      invalidatesTags: [{ type: "ServiceCategories", id: "LIST" }],
    }),

    updateServiceCategory: builder.mutation<
      ServiceCategory,
      {
        userId: number;
        id: number;
        data: Partial<UpdateServiceCategoryPayload>;
      }
    >({
      query: ({ userId, id, data }) => ({
        url: `/users/${userId}/service_categories/${id}`,
        method: "PATCH",
        data: {
          service_category: data,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ServiceCategories", id: arg.id },
        { type: "ServiceCategories", id: "LIST" },
      ],
    }),

    deleteServiceCategory: builder.mutation<
      void,
      { userId: number; id: number }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/service_categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "ServiceCategories", id: arg.id },
        { type: "ServiceCategories", id: "LIST" },
      ],
    }),

    // =========================
    // SERVICES
    // =========================

    getServices: builder.query<Service[], { categoryId: number }>({
      query: ({ categoryId }) => ({
        url: `/service_categories/${categoryId}/services`,
        method: "GET",
      }),
      providesTags: (result, _error, arg) =>
        result
          ? [
              ...result.map((service) => ({
                type: "Services" as const,
                id: service.id,
              })),
              { type: "Services" as const, id: `LIST-${arg.categoryId}` },
            ]
          : [{ type: "Services" as const, id: `LIST-${arg.categoryId}` }],
    }),

    createService: builder.mutation<
      Service,
      {
        categoryId: number;
        data: CreateServicePayload;
      }
    >({
      query: ({ categoryId, data }) => ({
        url: `/service_categories/${categoryId}/services`,
        method: "POST",
        data: {
          service: data,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Services", id: `LIST-${arg.categoryId}` },
        { type: "ServiceCategories", id: "LIST" },
      ],
    }),

    updateService: builder.mutation<
      Service,
      {
        categoryId: number;
        id: number;
        data: Partial<UpdateServicePayload>;
      }
    >({
      query: ({ categoryId, id, data }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "PATCH",
        data: {
          service: data,
        },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Services", id: arg.id },
        { type: "Services", id: `LIST-${arg.categoryId}` },
        { type: "ServiceCategories", id: "LIST" },
      ],
    }),

    getService: builder.query<
      Service,
      {
        categoryId: number;
        id: number;
      }
    >({
      query: ({ categoryId, id }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Services", id: arg.id },
      ],
    }),

    deleteService: builder.mutation<
      void,
      {
        categoryId: number;
        id: number;
      }
    >({
      query: ({ categoryId, id }) => ({
        url: `/service_categories/${categoryId}/services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Services", id: arg.id },
        { type: "Services", id: `LIST-${arg.categoryId}` },
        { type: "ServiceCategories", id: "LIST" },
      ],
    }),
  }),
});

export const {
  // categories
  useGetServiceCategoriesQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,

  // services
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
