import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit";
import type { api } from "../../api";
import type { ServiceCategoryPositionPayload } from "@/src/store/redux/services/api-types";

// ── Type guards ──────────────────────────────────────────────────────

type UserIdArg = {
  userId: number;
  params?: Record<string, string | number | boolean>;
};

export const isUserIdArg = (value: unknown): value is UserIdArg => {
  if (!value || typeof value !== "object") return false;
  return (
    "userId" in value &&
    typeof (value as { userId?: unknown }).userId === "number"
  );
};

// ── Response helpers ─────────────────────────────────────────────────

export const unwrapResponse =
  <T>(key: string) =>
  (response: unknown): T => {
    if (response && typeof response === "object" && key in response) {
      return (response as Record<string, T>)[key];
    }
    return response as T;
  };

// ── Position / reorder helpers ───────────────────────────────────────

export const buildPositionMap = (positions: ServiceCategoryPositionPayload[]) =>
  new Map(positions.map(({ id, position }) => [id, position]));

export const applyPositionOrder = <T extends { id: number; position?: number }>(
  items: T[],
  positionById: Map<number, number>,
) => {
  items.forEach((item) => {
    const nextPosition = positionById.get(item.id);
    if (nextPosition != null) item.position = nextPosition;
  });

  items.sort(
    (a, b) =>
      (a.position ?? Number.MAX_SAFE_INTEGER) -
      (b.position ?? Number.MAX_SAFE_INTEGER),
  );
};

export const reorderPaginatedPages = <
  T extends { id: number; position?: number },
>(
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

// ── Optimistic update helpers ────────────────────────────────────────

export const applyWithRollback = async (
  patches: { undo: () => void }[],
  queryFulfilled: Promise<unknown>,
) => {
  try {
    await queryFulfilled;
  } catch {
    patches.forEach((patch) => patch.undo());
  }
};

type ApiInstance = typeof api;
type ApiState = Parameters<ApiInstance["util"]["selectInvalidatedBy"]>[0];
type ApiTag = Parameters<ApiInstance["util"]["selectInvalidatedBy"]>[1][number];
type Dispatch = ThunkDispatch<unknown, unknown, UnknownAction>;

/**
 * Find all cached queries matching a tag + endpoint filter,
 * then apply an optimistic update to each.
 * Returns patches array for use with applyWithRollback.
 */
export const patchMatchingCaches = <EndpointName extends string, Draft>(
  apiInstance: ApiInstance,
  getState: () => unknown,
  dispatch: Dispatch,
  tag: ApiTag,
  endpointName: EndpointName,
  filter: (originalArgs: unknown) => boolean,
  updater: (draft: Draft) => void,
) => {
  return apiInstance.util
    .selectInvalidatedBy(getState() as ApiState, [tag])
    .filter(
      (entry) =>
        entry.endpointName === endpointName && filter(entry.originalArgs),
    )
    .map(({ originalArgs }) =>
      dispatch(
        (apiInstance.util.updateQueryData as any)(
          endpointName,
          originalArgs,
          updater,
        ),
      ),
    );
};
