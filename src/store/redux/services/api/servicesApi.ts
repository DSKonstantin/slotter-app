import { api } from "../api";
import type {
  AdditionalService,
  CreateAdditionalServicePayload,
  CreateServiceCategoryPayload,
  CreateServicePayload,
  PaginatedResponse,
  Service,
  ServiceCategory,
  UpdateAdditionalServicePayload,
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
    }),

    deleteServiceCategory: builder.mutation<
      void,
      { userId: number; id: number }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/service_categories/${id}`,
        method: "DELETE",
      }),
    }),

    // =========================
    // SERVICES
    // =========================

    getServices: builder.query<Service[], { categoryId: number }>({
      query: ({ categoryId }) => ({
        url: `/service_categories/${categoryId}/services`,
        method: "GET",
      }),
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
    }),

    // =========================
    // ADDITIONAL SERVICES
    // =========================

    getAdditionalServices: builder.query<
      AdditionalService[],
      { serviceId: number }
    >({
      query: ({ serviceId }) => ({
        url: `/services/${serviceId}/additional_services`,
        method: "GET",
      }),
    }),

    createAdditionalService: builder.mutation<
      AdditionalService,
      {
        serviceId: number;
        data: CreateAdditionalServicePayload;
      }
    >({
      query: ({ serviceId, data }) => ({
        url: `/services/${serviceId}/additional_services`,
        method: "POST",
        data: {
          additional_service: data,
        },
      }),
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
  useCreateServiceMutation,
  useUpdateServiceMutation,

  // additional services
  useGetAdditionalServicesQuery,
  useCreateAdditionalServiceMutation,
} = servicesApi;
