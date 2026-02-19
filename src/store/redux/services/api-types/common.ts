// src/store/redux/services/api-types/common.ts
export type BaseResponse = {
  httpStatus: 200;
  created_at: string;
};

export interface Pagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

export interface PaginatedResponse<T> {
  service_categories: T[];
  pagination: Pagination;
}
