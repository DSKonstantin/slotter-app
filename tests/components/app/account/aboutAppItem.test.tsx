import React from "react";
import { render, screen } from "@testing-library/react-native";

import AboutAppItem from "@/src/components/app/account/AboutAppItem";

let mockVersion = "1.0.10";

jest.mock("@/src/utils/appVersion", () => ({
  getAppVersion: () => mockVersion,
}));

jest.mock("@/src/components/ui", () => {
  const { Text, View } = require("react-native");
  return {
    StSvg: ({ name }: any) => <View testID={`icon-${name}`} />,
    Typography: ({ children }: any) => <Text>{children}</Text>,
  };
});

beforeEach(() => {
  mockVersion = "1.0.10";
});

describe("AboutAppItem", () => {
  it("shows the section title", async () => {
    await render(<AboutAppItem userId={1233} />);

    expect(screen.getByText("О приложении")).toBeTruthy();
  });

  it("shows the user id and the app version", async () => {
    await render(<AboutAppItem userId={1233} />);

    expect(
      screen.getByText("Ваш ID: 1233 · Версия приложения: 1.0.10"),
    ).toBeTruthy();
  });

  it("follows the installed version", async () => {
    mockVersion = "2.1.0";
    await render(<AboutAppItem userId={7} />);

    expect(
      screen.getByText("Ваш ID: 7 · Версия приложения: 2.1.0"),
    ).toBeTruthy();
  });

  it("has an info icon and no chevron", async () => {
    await render(<AboutAppItem userId={1233} />);

    expect(screen.getByTestId("icon-Info")).toBeTruthy();
    expect(screen.queryByTestId("icon-Expand_right")).toBeNull();
  });
});
