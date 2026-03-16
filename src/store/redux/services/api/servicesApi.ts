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

const buildPositionMap = (positions: ServiceCategoryPositionPayload[]) =>
  new Map(positions.map(({ id, position }) => [id, position]));

const applyPositionOrder = <T extends { id: number; position?: number }>(
  items: T[],
  positionById: Map<number, number>,
) => {
  items.forEach((item) => {
    const nextPosition = positionById.get(item.id);

    if (nextPosition != null) {
      item.position = nextPosition;
    }
  });

  items.sort(
    (a, b) =>
      (a.position ?? Number.MAX_SAFE_INTEGER) -
      (b.position ?? Number.MAX_SAFE_INTEGER),
  );
};

const reorderPaginatedPages = <T extends { id: number; position?: number }>(
  draft: { pages: Record<string, T[]>[] },
  key: string,
  positionById: Map<number, number>,
) => {
  const allItems = draft.pages.flatMap((page) => page[key]);
  applyPositionOrder(allItems, positionById);

  let startIndex = 0;
  draft.pages.forEach((page) => {
    const count = page[key].length;
    page[key] = allItems.slice(startIndex, startIndex + count);
    startIndex += count;
  });
};

const unwrapResponse =
  <T>(key: string) =>
  (response: unknown): T => {
    if (response && typeof response === "object" && key in response) {
      return (response as Record<string, T>)[key];
    }
    return response as T;
  };

const applyWithRollback = async (
  patches: { undo: () => void }[],
  queryFulfilled: Promise<unknown>,
) => {
  try {
    await queryFulfilled;
  } catch {
    patches.forEach((patch) => patch.undo());
  }
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
      transformResponse: unwrapResponse<Service>("service"),
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

        servicesApi.util
          .selectInvalidatedBy(getState(), [
            { type: "ServiceCategories", id: "LIST" },
          ])
          .filter(
            (entry) =>
              entry.endpointName === "getServiceCategories" &&
              isGetCategoriesArg(entry.originalArgs) &&
              entry.originalArgs.params?.view === "public_profile",
          )
          .forEach(({ originalArgs }) => {
            patches.push(
              dispatch(
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
              ),
            );
          });

        await applyWithRollback(patches, queryFulfilled);
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
      transformResponse: unwrapResponse<Service>("additional_service"),
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
      void,
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
        const positionById = buildPositionMap(positions);

        const patches = servicesApi.util
          .selectInvalidatedBy(getState(), [
            { type: "ServiceCategories", id: "LIST" },
          ])
          .filter(
            (entry) =>
              entry.endpointName === "getServiceCategories" &&
              isGetCategoriesArg(entry.originalArgs) &&
              entry.originalArgs.userId === userId,
          )
          .map(({ originalArgs }) =>
            dispatch(
              servicesApi.util.updateQueryData(
                "getServiceCategories",
                originalArgs,
                (draft) => {
                  reorderPaginatedPages(
                    draft as unknown as {
                      pages: Record<string, ServiceCategory[]>[];
                    },
                    "service_categories",
                    positionById,
                  );
                },
              ),
            ),
          );

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    reorderServices: builder.mutation<
      void,
      {
        categoryId: number;
        positions: ServiceCategoryPositionPayload[];
      }
    >({
      query: ({ categoryId, positions }) => ({
        url: `/service_categories/${categoryId}/services/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      async onQueryStarted(
        { categoryId, positions },
        { dispatch, getState, queryFulfilled },
      ) {
        const positionById = buildPositionMap(positions);
        const patches = [
          dispatch(
            servicesApi.util.updateQueryData(
              "getServices",
              { categoryId },
              (draft) => {
                applyPositionOrder(draft, positionById);
              },
            ),
          ),
        ];

        servicesApi.util
          .selectInvalidatedBy(getState(), [
            { type: "ServiceCategories", id: "LIST" },
          ])
          .filter(
            (entry) =>
              entry.endpointName === "getServiceCategories" &&
              isGetCategoriesArg(entry.originalArgs) &&
              entry.originalArgs.params?.view === "public_profile",
          )
          .forEach(({ originalArgs }) => {
            patches.push(
              dispatch(
                servicesApi.util.updateQueryData(
                  "getServiceCategories",
                  originalArgs,
                  (draft) => {
                    draft.pages.forEach((page) => {
                      const category = page.service_categories.find(
                        (item) => item.id === categoryId,
                      );

                      if (!category?.services?.length) return;
                      applyPositionOrder(category.services, positionById);
                    });
                  },
                ),
              ),
            );
          });

        await applyWithRollback(patches, queryFulfilled);
      },
    }),

    reorderAdditionalServices: builder.mutation<
      void,
      {
        userId: number;
        positions: ServiceCategoryPositionPayload[];
      }
    >({
      query: ({ userId, positions }) => ({
        url: `/users/${userId}/additional_services/reorder`,
        method: "PATCH",
        data: { positions },
      }),
      async onQueryStarted(
        { userId, positions },
        { dispatch, getState, queryFulfilled },
      ) {
        const positionById = buildPositionMap(positions);

        const patches = servicesApi.util
          .selectInvalidatedBy(getState(), [
            { type: "AdditionalServices", id: "LIST" },
          ])
          .filter(
            (entry) =>
              entry.endpointName === "getAdditionalServices" &&
              isGetCategoriesArg(entry.originalArgs) &&
              entry.originalArgs.userId === userId,
          )
          .map(({ originalArgs }) =>
            dispatch(
              servicesApi.util.updateQueryData(
                "getAdditionalServices",
                originalArgs,
                (draft) => {
                  reorderPaginatedPages(
                    draft as unknown as {
                      pages: Record<string, AdditionalService[]>[];
                    },
                    "additional_services",
                    positionById,
                  );
                },
              ),
            ),
          );

        await applyWithRollback(patches, queryFulfilled);
      },
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
