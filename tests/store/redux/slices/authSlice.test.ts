import authReducer, {
  type AuthState,
  extractUser,
  logout,
  setAuthenticatedUser,
  setToken,
  setUserOnly,
} from "@/src/store/redux/slices/authSlice";
import type { User } from "@/src/store/redux/services/api-types";

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    phone: "+79990000000",
    email: null,
    first_name: "Иван",
    last_name: null,
    about_me: null,
    address: null,
    nickname: null,
    profession: null,
    experience: null,
    avatar_url: null,
    avatar_blurhash: null,
    is_home_work: false,
    is_online_work: false,
    is_out_call: false,
    phone_confirmed_at: null,
    telegram_id: null,
    onboarding_step: "done",
    appointment_step: "fifteen_minutes",
    appointment_conditions: null,
    is_notify_new_appointment: true,
    is_notify_customer_cancel: true,
    is_notify_reminders: true,
    gallery_photos: [],
    subscription_membership: undefined as never,
    ...overrides,
  }) as User;

const initialState: AuthState = {
  token: null,
  user: null,
  resourceType: null,
  status: "idle",
};

describe("authSlice reducers", () => {
  it("setToken stores the token", () => {
    const next = authReducer(initialState, setToken("abc123"));
    expect(next.token).toBe("abc123");
  });

  it("setToken(null) clears the token", () => {
    const state = { ...initialState, token: "abc123" };
    expect(authReducer(state, setToken(null)).token).toBeNull();
  });

  it("logout clears the session entirely", () => {
    const state: AuthState = {
      token: "abc123",
      user: buildUser(),
      resourceType: "user",
      status: "authenticated",
    };
    const next = authReducer(state, logout());
    expect(next).toEqual({
      token: null,
      user: null,
      resourceType: null,
      status: "unauthenticated",
    });
  });
});

describe("extractUser", () => {
  it("returns null for a nullish or non-object payload", () => {
    expect(extractUser(null)).toBeNull();
    expect(extractUser(undefined)).toBeNull();
  });

  it("prefers `resource` when present (login/confirmCode/resetPassword shape)", () => {
    const user = buildUser();
    expect(extractUser({ resource: user })).toBe(user);
  });

  it("falls back to `user` (e.g. updateUser response shape)", () => {
    const user = buildUser();
    expect(extractUser({ user })).toBe(user);
  });

  it("treats the payload itself as the user when it looks like one", () => {
    const user = buildUser();
    expect(extractUser(user)).toBe(user);
  });

  it("returns null when nothing matches", () => {
    expect(extractUser({ status: "ok" } as never)).toBeNull();
  });
});

describe("setAuthenticatedUser", () => {
  it("sets user/resourceType/status from a resource_type: 'user' payload", () => {
    const state = { ...initialState };
    const user = buildUser();
    setAuthenticatedUser(state, {
      resource_type: "user",
      resource: user,
    } as never);

    expect(state.user).toBe(user);
    expect(state.resourceType).toBe("user");
    expect(state.status).toBe("authenticated");
  });

  it("does nothing when resource_type is 'customer'", () => {
    const state = { ...initialState };
    setAuthenticatedUser(state, {
      resource_type: "customer",
      resource: buildUser(),
    } as never);

    expect(state).toEqual(initialState);
  });

  it("does nothing when no user can be extracted", () => {
    const state = { ...initialState };
    setAuthenticatedUser(state, {} as never);
    expect(state).toEqual(initialState);
  });
});

describe("setUserOnly", () => {
  it("replaces the user outright when the new payload carries a membership", () => {
    const existing = buildUser({
      subscription_membership: { pro_access: true } as never,
    });
    const state: AuthState = { ...initialState, user: existing };

    const incoming = buildUser({
      first_name: "Пётр",
      subscription_membership: { pro_access: false } as never,
    });
    setUserOnly(state, { user: incoming });

    expect(state.user).toEqual(incoming);
  });

  it("preserves the previously known membership when the new payload omits it", () => {
    const membership = { pro_access: true } as never;
    const existing = buildUser({ subscription_membership: membership });
    const state: AuthState = { ...initialState, user: existing };

    const incoming = buildUser({
      first_name: "Пётр",
      subscription_membership: undefined as never,
    });
    setUserOnly(state, { user: incoming });

    expect(state.user?.subscription_membership).toBe(membership);
    expect(state.user?.first_name).toBe("Пётр");
  });

  it("does nothing when no user can be extracted", () => {
    const existing = buildUser();
    const state: AuthState = { ...initialState, user: existing };
    setUserOnly(state, {});
    expect(state.user).toBe(existing);
  });
});
