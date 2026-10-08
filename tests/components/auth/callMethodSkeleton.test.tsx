import React from "react";
import { render, screen } from "@testing-library/react-native";

import {
  CALL_METHOD_SKELETON_HEIGHT,
  CallMethodSkeleton,
} from "@/src/components/auth/verify/CallMethodSkeleton";

describe("CallMethodSkeleton", () => {
  it("renders with the height of the real call content", async () => {
    await render(<CallMethodSkeleton />);

    const root = screen.getByTestId("call-method-skeleton");
    expect(root.props.style).toEqual(
      expect.objectContaining({ height: CALL_METHOD_SKELETON_HEIGHT }),
    );
  });

  it("matches the card (80), status row, hint and resend button (50) stack", () => {
    expect(CALL_METHOD_SKELETON_HEIGHT).toBe(80 + 16 + 18 + 16 + 18 + 8 + 50);
  });
});
