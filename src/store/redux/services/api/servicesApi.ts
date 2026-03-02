import { api } from "../api";
import {
  CreateServiceCategoryResponse,
  CreateServiceCategoryPayload,
  CreateServicePayload,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceCategoryPositionPayload,
  UpdateServiceCategoryPayload,
  UpdateServicePayload,
  AdditionalService,
} from "@/src/store/redux/services/api-types";
import { PaginatedServiceCategoriesResponse } from "@/src/store/redux/services/api-types/common";

type GetServiceCategoriesQueryArg = {
  userId: number;
  params?: Record<string, string | number>;
};

const isGetCategoriesArg = (
  value: unknown,
): value is GetServiceCategoriesQueryArg => {
  if (!value || typeof value !== "object") return false;
  return (
    "userId" in value &&
    typeof (value as { userId?: unknown }).userId === "number"
  );
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
      CreateServiceCategoryResponse,
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
      async onQueryStarted(
        { userId, id, data },
        { dispatch, getState, queryFulfilled },
      ) {
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
                  const category = page.service_categories.find(
                    (item) => item.id === id,
                  );

                  if (category) {
                    Object.assign(category, data);
                  }
                });
              },
            ),
          ),
        );

        try {
          const { data: updatedCategory } = await queryFulfilled;

          cachedQueries.forEach(({ originalArgs }) => {
            dispatch(
              servicesApi.util.updateQueryData(
                "getServiceCategories",
                originalArgs,
                (draft) => {
                  draft.pages.forEach((page) => {
                    const category = page.service_categories.find(
                      (item) => item.id === id,
                    );

                    if (category) {
                      Object.assign(category, updatedCategory);
                    }
                  });
                },
              ),
            );
          });
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
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
      async onQueryStarted(
        { categoryId, id },
        { dispatch, getState, queryFulfilled },
      ) {
        const patches = [
          dispatch(
            servicesApi.util.updateQueryData(
              "getServices",
              { categoryId },
              (draft) => {
                const serviceIndex = draft.findIndex(
                  (service) => service.id === id,
                );

                if (serviceIndex !== -1) {
                  draft.splice(serviceIndex, 1);
                }
              },
            ),
          ),
        ];

        const cachedCategoryQueries = servicesApi.util
          .selectInvalidatedBy(getState(), [
            { type: "ServiceCategories", id: "LIST" },
          ])
          .filter(
            (entry) =>
              entry.endpointName === "getServiceCategories" &&
              isGetCategoriesArg(entry.originalArgs) &&
              entry.originalArgs.params?.view === "with_services",
          );

        cachedCategoryQueries.forEach(({ originalArgs }) => {
          const patch = dispatch(
            servicesApi.util.updateQueryData(
              "getServiceCategories",
              originalArgs,
              (draft) => {
                draft.pages.forEach((page) => {
                  const category = page.service_categories.find(
                    (item) => item.id === categoryId,
                  );

                  if (!category?.services) return;

                  const serviceIndex = category.services.findIndex(
                    (service) => service.id === id,
                  );

                  if (serviceIndex === -1) return;

                  const [removedService] = category.services.splice(
                    serviceIndex,
                    1,
                  );

                  if (
                    removedService?.is_active &&
                    typeof category.activeServicesCount === "number"
                  ) {
                    category.activeServicesCount = Math.max(
                      0,
                      category.activeServicesCount - 1,
                    );
                  }
                });
              },
            ),
          );

          patches.push(patch);
        });

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    getAdditionalServices: builder.infiniteQuery<
      PaginatedServiceCategoriesResponse<AdditionalService>,
      GetServiceCategoriesQueryArg,
      number
    >({
      query: ({ queryArg, pageParam }) => ({
        url: `/users/${queryArg.userId}/additional_services`,
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
                page.additional_services.map((service) => ({
                  type: "AdditionalServices" as const,
                  id: service.id,
                })),
              ),
              { type: "AdditionalServices" as const, id: "LIST" },
            ]
          : [{ type: "AdditionalServices" as const, id: "LIST" }],
    }),

    getAdditionalService: builder.query<
      Service,
      { userId: number | string; id: number | string }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/additional_services/${id}`,
        method: "GET",
      }),
      transformResponse: (response: unknown) => {
        if (
          response &&
          typeof response === "object" &&
          "additional_service" in response
        ) {
          return (response as { additional_service: Service })
            .additional_service;
        }

        return response as Service;
      },
      providesTags: (_result, _error, arg) => [
        { type: "AdditionalServices", id: arg.id },
      ],
    }),

    createAdditionalService: builder.mutation<
      Service,
      { userId: number; data: CreateServicePayload | FormData }
    >({
      query: ({ userId, data }) => {
        const payload =
          data instanceof FormData ? data : { additional_service: data };

        return {
          url: `/users/${userId}/additional_services`,
          method: "POST",
          data: payload,
        };
      },
      invalidatesTags: [{ type: "AdditionalServices", id: "LIST" }],
    }),

    updateAdditionalService: builder.mutation<
      Service,
      {
        userId: number;
        id: number;
        data: Partial<UpdateServicePayload> | FormData;
      }
    >({
      query: ({ userId, id, data }) => {
        const payload =
          data instanceof FormData ? data : { additional_service: data };

        return {
          url: `/users/${userId}/additional_services/${id}`,
          method: "PATCH",
          data: payload,
        };
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "AdditionalServices", id: arg.id },
        { type: "AdditionalServices", id: "LIST" },
      ],
    }),

    deleteAdditionalService: builder.mutation<
      void,
      { userId: number | string; id: number | string }
    >({
      query: ({ userId, id }) => ({
        url: `/users/${userId}/additional_services/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "AdditionalServices", id: arg.id },
        { type: "AdditionalServices", id: "LIST" },
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
        const positionById = new Map(
          positions.map(({ id, position }) => [id, position]),
        );
        const patchAndRebuildPages = (
          draft: { pages: { service_categories: ServiceCategory[] }[] },
          patchCategory: (category: ServiceCategory) => void,
        ) => {
          const orderedCategories = draft.pages.flatMap(
            (page) => page.service_categories,
          );

          orderedCategories.forEach((category) => {
            patchCategory(category);
          });

          orderedCategories.sort((a, b) => a.position - b.position);

          let startIndex = 0;
          draft.pages.forEach((page) => {
            const pageSize = page.service_categories.length;
            page.service_categories = orderedCategories.slice(
              startIndex,
              startIndex + pageSize,
            );
            startIndex += pageSize;
          });
        };

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
                patchAndRebuildPages(draft, (category) => {
                  const nextPosition = positionById.get(category.id);
                  if (nextPosition != null) {
                    category.position = nextPosition;
                  }
                });
              },
            ),
          ),
        );

        try {
          const { data: serverResponse } = await queryFulfilled;
          const categoriesById = new Map(
            serverResponse.service_categories.map((category) => [
              category.id,
              category,
            ]),
          );

          cachedQueries.forEach(({ originalArgs }) => {
            dispatch(
              servicesApi.util.updateQueryData(
                "getServiceCategories",
                originalArgs,
                (draft) => {
                  patchAndRebuildPages(draft, (category) => {
                    const serverCategory = categoriesById.get(category.id);
                    if (serverCategory) {
                      Object.assign(category, serverCategory);
                    }
                  });
                },
              ),
            );
          });
        } catch {
          patches.forEach((patch) => patch.undo());
        }
      },
    }),

    reorderServices: builder.mutation<
      void,
      {
        categoryId: number;
        positions: { id: number; position: number }[];
      }
    >({
      query: ({ categoryId, positions }) => ({
        url: `/service_categories/${categoryId}/services/reorder`,
        method: "PATCH",
        data: positions,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Services", id: `LIST-${arg.categoryId}` },
        { type: "ServiceCategories", id: "LIST" },
      ],
    }),

    reorderAdditionalServices: builder.mutation<
      void,
      {
        userId: number;
        positions: { id: number; position: number }[];
      }
    >({
      query: ({ userId, positions }) => ({
        url: `/users/${userId}/additional_services/reorder`,
        method: "PATCH",
        data: positions,
      }),
      invalidatesTags: [{ type: "AdditionalServices", id: "LIST" }],
    }),
  }),
});

export const {
  useGetServiceCategoriesInfiniteQuery,
  useCreateServiceCategoryMutation,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,

  useGetServicesQuery,
  useGetServiceQuery,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,

  useGetAdditionalServicesInfiniteQuery,
  useGetAdditionalServiceQuery,
  useCreateAdditionalServiceMutation,
  useUpdateAdditionalServiceMutation,
  useDeleteAdditionalServiceMutation,

  useReorderServiceCategoriesMutation,
  useReorderServicesMutation,
  useReorderAdditionalServicesMutation,
} = servicesApi;
