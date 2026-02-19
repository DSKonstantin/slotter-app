// src/store/redux/services/api-types/index.ts
export type { BaseResponse, Pagination, PaginatedResponse } from "./common";
export { UserType } from "./user";
export type {
  User,
  AuthResponse,
  TelegramRegisterResponse,
  TelegramRegisterStatusResponse,
  TelegramLoginResponse,
  MeResponse,
  UpdateUserPayload,
} from "./user";
export type {
  ServiceCategory,
  CreateServiceCategoryPayload,
  UpdateServiceCategoryPayload,
  Service,
  CreateServicePayload,
  UpdateServicePayload,
  AdditionalService,
  CreateAdditionalServicePayload,
  UpdateAdditionalServicePayload,
} from "./service";
