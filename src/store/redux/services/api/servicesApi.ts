import { api } from "../api";
import type {
  CreateServiceCategoryPayload,
  CreateServicePayload,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceCategoryPositionPayload,
  UpdateServiceCategoryPayload,
  UpdateServicePayload,
} from "@/src/store/redux/services/api-types";

type GetServiceCategoriesQueryArg = {
  userId: number;
  params?: Record<string, string | number>;
};

const servicesApi = api.injectEndpoints({
  overrideExisting: __DEV__,

  endpoints: (builder) => ({
    getServiceCategories: builder.infiniteQuery<
      PaginatedResponse<ServiceCategory>,
      GetServiceCategoriesQueryArg,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/users/${queryArg.userId}/service_categories`,
        method: "GET",
        params: {
          ...queryArg.params,
          page: pageParam,
        },
      }),
      infiniteQueryOptions: {
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
          const { current_page, total_pages } = lastPage.pagination;
          return current_page < total_pages ? current_page + 1 : undefined;
        },
      },
      providesTags: (result) =>
        result
          ? [
              ...result.pages.flatMap((page) =>
                page.service_categories.map((category) => ({
                  type: "ServiceCategories" as const,
                  id: category.id,
                })),
              ),
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

    reorderServiceCategories: builder.mutation<
      PaginatedResponse<ServiceCategory>,
      { userId: number; positions: ServiceCategoryPositionPayload[] }
    >({
      query: ({ userId, positions }) => ({
        url: `/users/${userId}/service_categories/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      async onQueryStarted(
        { userId, positions },
        { dispatch, getState, queryFulfilled },
      ) {
        const isGetCategoriesArg = (
          value: unknown,
        ): value is GetServiceCategoriesQueryArg => {
          if (!value || typeof value !== "object") return false;
          return (
            "userId" in value &&
            typeof (value as { userId?: unknown }).userId === "number"
          );
        };

        const positionById = new Map(
          positions.map(({ id, position }) => [id, position]),
        );

        const cachedQueries = servicesApi.util
          .selectInvalidatedBy(getState(), [
            { type: "ServiceCategories", id: "LIST" },
          ])
          .filter(
            (entry) =>
              entry.endpointName === "getServiceCategories" &&
              isGetCategoriesArg(entry.originalArgs) &&
              entry.originalArgs.userId === userId,
          );

        const patches = cachedQueries.map(({ originalArgs }) =>
          dispatch(
            servicesApi.util.updateQueryData(
              "getServiceCategories",
              originalArgs,
              (draft) => {
                draft.pages.forEach((page) => {
                  page.service_categories.forEach((category) => {
                    const nextPosition = positionById.get(category.id);
                    if (nextPosition != null) {
                      category.position = nextPosition;
                    }
                  });
                });
              },
            ),
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        ...arg.positions.map((position) => ({
          type: "ServiceCategories" as const,
          id: position.id,
        })),
        { type: "ServiceCategories" as const, id: "LIST" },
      ],
    }),

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
        data: CreateServicePayload | FormData;
      }
    >({
      query: ({ categoryId, data }) => {
        const payload = data instanceof FormData ? data : { service: data };

        return {
          url: `/service_categories/${categoryId}/services`,
          method: "POST",
          data: payload,
        };
      },
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
        data: Partial<UpdateServicePayload> | FormData;
      }
    >({
      query: ({ categoryId, id, data }) => {
        const payload = data instanceof FormData ? data : { service: data };

        return {
          url: `/service_categories/${categoryId}/services/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
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
      transformResponse: (response: unknown) => {
        if (response && typeof response === "object" && "service" in response) {
          return (response as { service: Service }).service;
        }

        return response as Service;
      },
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
  useGetServiceCategoriesInfiniteQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
  useReorderServiceCategoriesMutation,

  // services
  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
