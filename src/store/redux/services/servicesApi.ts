import { api } from "./api";
import { API } from "@/src/store/redux/services/api-types";

const servicesApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    // =========================
    // SERVICE CATEGORIES
    // =========================

    getServiceCategories: builder.query<
      API.ServiceCategory[],
      { userId: number }
    >({
      query: ({ userId }) => ({
        url: `/users/${userId}/service_categories`,
        method: "GET",
      }),
    }),

    createServiceCategory: builder.mutation<
      API.ServiceCategory,
      { userId: number; data: API.CreateServiceCategoryPayload }
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
      API.ServiceCategory,
      {
        userId: number;
        id: number;
        data: Partial<API.UpdateServiceCategoryPayload>;
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

    getServices: builder.query<API.Service[], { categoryId: number }>({
      query: ({ categoryId }) => ({
        url: `/service_categories/${categoryId}/services`,
        method: "GET",
      }),
    }),

    createService: builder.mutation<
      API.Service,
      {
        categoryId: number;
        data: API.CreateServicePayload;
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
      API.Service,
      {
        categoryId: number;
        id: number;
        data: Partial<API.UpdateServicePayload>;
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
      API.AdditionalService[],
      { serviceId: number }
    >({
      query: ({ serviceId }) => ({
        url: `/services/${serviceId}/additional_services`,
        method: "GET",
      }),
    }),

    createAdditionalService: builder.mutation<
      API.AdditionalService,
      {
        serviceId: number;
        data: API.CreateAdditionalServicePayload;
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
