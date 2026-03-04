import type { User } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

const getRedirectPath = (user: User) => {
  if (!user.email) {
    return Routers.onboarding.register;
  }

  switch (user.onboarding_step) {
    case "personalInformation":
      return Routers.onboarding.personalInformation;

    case "completed":
      return Routers.app.root;

    default:
      return Routers.auth.root;
  }
};

export default getRedirectPath;
