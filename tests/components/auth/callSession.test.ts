import { toCallSession } from "@/src/components/auth/callSession";
import type { SendCodeResponse } from "@/src/store/redux/services/api-types";

const response = (extra: Partial<SendCodeResponse> = {}): SendCodeResponse => ({
  status: "verification_started",
  method: "callback",
  call_phone: "78005553535",
  code_length: null,
  expires_in: 600,
  resend_after: 60,
  is_poll: true,
  poll_interval: 3,
  ...extra,
});

describe("toCallSession", () => {
  it("maps a callback answer to a call session", () => {
    expect(toCallSession(response())).toEqual({
      call_phone: "78005553535",
      poll_interval: 3,
      resend_after: 60,
      expires_in: 600,
    });
  });

  it("returns null when the answer has no number", () => {
    expect(toCallSession(response({ call_phone: null }))).toBeNull();
  });

  it.each(["flashcall", "telegram"] as const)(
    "returns null for a %s answer",
    (method) => {
      expect(toCallSession(response({ method }))).toBeNull();
    },
  );
});
