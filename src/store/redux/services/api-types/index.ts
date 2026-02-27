// src/store/redux/services/api-types/index.tsx
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
  ServiceCategoryPositionPayload,
  CreateServiceCategoryPayload,
  CreateServiceCategoryResponse,
  UpdateServiceCategoryPayload,
  Service,
  CreateServicePayload,
  UpdateServicePayload,
  AdditionalService,
  CreateAdditionalServicePayload,
  UpdateAdditionalServicePayload,
} from "./service";
export type {
  WorkingDay,
  WorkingDayBreak,
  WorkingDayBreaksAttributesPayload,
  CreateWorkingDayPayload,
  UpdateWorkingDayPayload,
  CreateWorkingDayBreakPayload,
  UpdateWorkingDayBreakPayload,
  WorkingDaysResponse,
  WorkingDayBreaksResponse,
} from "./workingDay";
