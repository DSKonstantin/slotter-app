import { api } from "@/src/store/redux/services/api";

export const upsertApiQueryData = (
  endpointName: string,
  args: unknown,
  data: unknown,
) =>
  api.util.upsertQueryData(endpointName as never, args as never, data as never);
