import React from "react";
import { render, screen } from "@testing-library/react-native";

import { SubtitleWithPhone } from "@/src/components/auth/enterCode/SubtitleWithPhone";

jest.mock("@/src/components/ui", () => {
  const { Text } = require("react-native");
  return {
    Typography: ({ children, className }: any) => (
      <Text className={className}>{children}</Text>
    ),
  };
});

const PHONE = "+7 916 123-45-67";

describe("SubtitleWithPhone", () => {
  it("highlights the phone inside the text in black and semibold", async () => {
    await render(
      <SubtitleWithPhone text={`Звонок на ${PHONE} скоро`} phone={PHONE} />,
    );

    const phone = screen.getByText(PHONE);
    expect(phone.props.className).toContain("text-black");
    expect(screen.getByText(`Звонок на ${PHONE} скоро`)).toBeTruthy();
  });

  it("shows the phone on its own line when the text does not mention it", async () => {
    await render(<SubtitleWithPhone text="Без номера" phone={PHONE} />);

    expect(screen.getByText("Без номера")).toBeTruthy();
    expect(screen.getByText(PHONE).props.className).toContain("text-black");
  });

  it("renders just the text for an empty phone", async () => {
    await render(<SubtitleWithPhone text="Только текст" phone="" />);

    expect(screen.getByText("Только текст")).toBeTruthy();
  });
});
