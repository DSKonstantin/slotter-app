// src/store/redux/services/api-types/index.tsx
export type { BaseResponse, Pagination, PaginatedResponse } from "./common";
export { UserType } from "./user";
export type {
  User,
  AppointmentStep,
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
  Appointment,
  AppointmentStatus,
  AppointmentCustomer,
  AppointmentService,
  PaymentMethod,
  GetAppointmentsParams,
  GetAppointmentsResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
  ReschedulePayload,
  CancelPayload,
} from "./appointment";
export type {
  Customer,
  CustomerTag,
  CustomerStats,
  CustomerStatPoint,
  CustomerStatsResponse,
  CustomerBalancePoint,
  CustomerBalanceResponse,
  GetCustomersParams,
  GetCustomersResponse,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  AssignTagPayload,
  CreateCustomerTagPayload,
  UpdateCustomerTagPayload,
} from "./customer";
export type {
  WorkingDay,
  WorkingDayBreak,
  WorkingDayBreaksAttributesPayload,
  CreateWorkingDayPayload,
  BulkCreateWorkingDayItem,
  BulkCreateWorkingDaysPayload,
  UpdateWorkingDayPayload,
  CreateWorkingDayBreakPayload,
  UpdateWorkingDayBreakPayload,
  WorkingDaysResponse,
  WorkingDayBreaksResponse,
} from "./workingDay";
export type {
  GalleryPhoto,
  GalleryPhotosResponse,
  GalleryPhotoCropData,
  CreateGalleryPhotoPayload,
  BulkCreateGalleryPhotosPayload,
  UpdateGalleryPhotoPayload,
  GalleryPhotoPositionPayload,
} from "./galleryPhoto";
