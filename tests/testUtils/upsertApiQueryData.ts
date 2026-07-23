import { api } from "@/src/store/redux/services/api";

// api.util.upsertQueryData is typed against the endpoints known at the
// `api` slice's own declaration site — individual feature slices
// (workingDaysApi, appointmentsApi, ...) call api.injectEndpoints() but
// don't export the resulting typed reference, so TS sees an empty endpoint
// union here even though the endpoint exists at runtime. Test-only escape
// hatch for seeding RTK Query's cache directly (bypassing the network) when
// writing hook tests.
export const upsertApiQueryData = (
  endpointName: string,
  args: unknown,
  data: unknown,
) =>
  api.util.upsertQueryData(endpointName as never, args as never, data as never);
