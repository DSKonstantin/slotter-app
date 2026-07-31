import { router } from "expo-router";
import { useSafeBack } from "@/src/hooks/useSafeBack";

jest.mock("expo-router", () => ({
  router: {
    canGoBack: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockRouter = router as unknown as {
  canGoBack: jest.Mock;
  back: jest.Mock;
  replace: jest.Mock;
};

describe("useSafeBack", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("goes back when there is history to go back to", () => {
    mockRouter.canGoBack.mockReturnValue(true);
    const goBack = useSafeBack("/fallback" as never);

    goBack();

    expect(mockRouter.back).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });

  it("falls back to the given href when there is no history", () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const goBack = useSafeBack("/fallback" as never);

    goBack();

    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).toHaveBeenCalledWith("/fallback" as never);
  });

  it("does nothing when there is no history and no fallback was given", () => {
    mockRouter.canGoBack.mockReturnValue(false);
    const goBack = useSafeBack();

    goBack();

    expect(mockRouter.back).not.toHaveBeenCalled();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
