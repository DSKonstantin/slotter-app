import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import ProfileAvatar from "@/src/components/app/account/ProfileAvatar";

const mockPush = jest.fn();
const mockRefetchQuota = jest.fn();
let mockIspe = true;
let mockUser: Record<string, unknown> | null = null;
let mockQuotaState: {
  quota?: { used: number; limit: number };
  shouldFetchQuota: boolean;
} = { shouldFetchQuota: true };

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    router: { push: (href: unknown) => mockPush(href) },
    useFocusEffect: (callback: () => void) => {
      React.useEffect(() => callback(), [callback]);
    },
  };
});

jest.mock("@/src/store/redux/store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { user: mockUser }, appVersion: { ispe: mockIspe } }),
}));

jest.mock("@/src/hooks/useSubscriptionQuota", () => ({
  useSubscriptionQuota: () => ({
    ...mockQuotaState,
    refetch: mockRefetchQuota,
  }),
}));

jest.mock("@/src/components/ui", () => {
  const { Text, View } = require("react-native");
  return {
    Avatar: () => <View testID="avatar" />,
    StSvg: () => null,
    Typography: ({ children }: any) => <Text>{children}</Text>,
  };
});

const freeUser = {
  first_name: "Ирина",
  last_name: "Смирнова",
  subscription_membership: { pro_access: false },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIspe = true;
  mockUser = freeUser;
  mockQuotaState = { shouldFetchQuota: true };
});

describe("ProfileAvatar — plan badge", () => {
  it("shows the plan with the used and total appointments", async () => {
    mockQuotaState = { quota: { used: 7, limit: 30 }, shouldFetchQuota: true };
    await render(<ProfileAvatar />);

    expect(screen.getByText("Старт 7/30 записей")).toBeTruthy();
  });

  it("shows a fresh account with zero used", async () => {
    mockQuotaState = { quota: { used: 0, limit: 30 }, shouldFetchQuota: true };
    await render(<ProfileAvatar />);

    expect(screen.getByText("Старт 0/30 записей")).toBeTruthy();
  });

  it("never shows more used than the limit", async () => {
    mockQuotaState = { quota: { used: 31, limit: 30 }, shouldFetchQuota: true };
    await render(<ProfileAvatar />);

    expect(screen.getByText("Старт 30/30 записей")).toBeTruthy();
  });

  it("shows just the plan name until the quota is loaded", async () => {
    mockQuotaState = { quota: undefined, shouldFetchQuota: true };
    await render(<ProfileAvatar />);

    expect(screen.getByText("Старт")).toBeTruthy();
    expect(screen.queryByText(/записей/)).toBeNull();
  });

  it("shows the PRO badge instead for a paid plan", async () => {
    mockUser = {
      ...freeUser,
      subscription_membership: { pro_access: true },
    };
    mockQuotaState = { quota: undefined, shouldFetchQuota: false };
    await render(<ProfileAvatar />);

    expect(screen.getByText("PRO")).toBeTruthy();
    expect(screen.queryByText(/Старт/)).toBeNull();
  });

  it("hides the badge when the paid edition is off", async () => {
    mockIspe = false;
    mockQuotaState = { quota: { used: 7, limit: 30 }, shouldFetchQuota: true };
    await render(<ProfileAvatar />);

    expect(screen.queryByText(/Старт/)).toBeNull();
    expect(screen.queryByText("PRO")).toBeNull();
  });

  it("shows the plain plan name for a user without a membership yet", async () => {
    mockUser = { first_name: "Ирина" };
    mockQuotaState = { quota: undefined, shouldFetchQuota: false };
    await render(<ProfileAvatar />);

    expect(screen.getByText("Старт")).toBeTruthy();
  });
});

describe("ProfileAvatar — fresh numbers", () => {
  it("reloads the quota every time the screen is focused on a free plan", async () => {
    mockQuotaState = { quota: { used: 7, limit: 30 }, shouldFetchQuota: true };
    await render(<ProfileAvatar />);

    expect(mockRefetchQuota).toHaveBeenCalledTimes(1);
  });

  it("does not reload the quota for a paid plan", async () => {
    mockUser = {
      ...freeUser,
      subscription_membership: { pro_access: true },
    };
    mockQuotaState = { quota: undefined, shouldFetchQuota: false };
    await render(<ProfileAvatar />);

    expect(mockRefetchQuota).not.toHaveBeenCalled();
  });

  it("survives a refetch that throws", async () => {
    mockRefetchQuota.mockImplementation(() => {
      throw new Error("query not started");
    });
    mockQuotaState = { quota: undefined, shouldFetchQuota: true };

    await render(<ProfileAvatar />);

    expect(screen.getByText("Старт")).toBeTruthy();
  });
});

describe("ProfileAvatar — screen", () => {
  it("shows the name and opens the personal information", async () => {
    await render(<ProfileAvatar />);

    expect(screen.getByText("Ирина Смирнова")).toBeTruthy();
    await fireEvent.press(screen.getByText("Ирина Смирнова"));

    expect(mockPush).toHaveBeenCalledWith(
      "/(app)/(tabs)/account/personal-information",
    );
  });
});
