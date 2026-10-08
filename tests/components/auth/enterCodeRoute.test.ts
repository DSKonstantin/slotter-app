import { buildEnterCodeRoute } from "@/src/components/auth/enterCode/route";
import type { SendCodeResponse } from "@/src/store/redux/services/api-types";

const response = (extra: Partial<SendCodeResponse> = {}): SendCodeResponse => ({
  status: "verification_started",
  method: "telegram",
  call_phone: null,
  code_length: 6,
  expires_in: 600,
  resend_after: 30,
  is_poll: false,
  poll_interval: 3,
  ...extra,
});

describe("buildEnterCodeRoute", () => {
  it("builds telegram params from the response", () => {
    const route = buildEnterCodeRoute({
      phone: "+79161234567",
      method: "telegram",
      result: response({
        is_code_sent: false,
        bot_url: "https://t.me/slotter_robot?start=login",
      }),
      referralCode: "FRIEND",
    });

    expect(route).toEqual({
      pathname: "/(auth)/enter-code",
      params: {
        phone: "+79161234567",
        method: "telegram",
        flow: "login",
        code_length: "6",
        resend_after: "30",
        expires_in: "600",
        bot_url: "https://t.me/slotter_robot?start=login",
        referralCode: "FRIEND",
      },
    });
  });

  it("omits fields the response does not have", () => {
    const route = buildEnterCodeRoute({
      phone: "+79161234567",
      method: "flashcall",
      result: response({ method: "flashcall", code_length: null }),
    });

    expect(route).toEqual({
      pathname: "/(auth)/enter-code",
      params: {
        phone: "+79161234567",
        method: "flashcall",
        flow: "login",
        resend_after: "30",
        expires_in: "600",
      },
    });
  });

  it("sends the reset flow to the password reset stack", () => {
    const route = buildEnterCodeRoute({
      phone: "+79161234567",
      method: "telegram",
      result: response(),
      flow: "reset",
    });

    expect(route).toEqual(
      expect.objectContaining({
        pathname: "/(password-reset)/enter-code",
        params: expect.objectContaining({ flow: "reset", method: "telegram" }),
      }),
    );
  });

  it("defaults to the login stack", () => {
    const route = buildEnterCodeRoute({
      phone: "+79161234567",
      method: "flashcall",
      result: response({ method: "flashcall" }),
    });

    expect(route).toEqual(
      expect.objectContaining({ pathname: "/(auth)/enter-code" }),
    );
  });
});
