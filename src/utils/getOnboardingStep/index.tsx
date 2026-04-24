import type { User } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

const getRedirectPath = (user: User) => {
  if (!user.email) {
    return Routers.onboarding.register;
  }

  if (!user.first_name) {
    return Routers.onboarding.personalInformation;
  }

  if (user.onboarding_step === "completed") {
    return Routers.app.root;
  }

  return Routers.auth.root;
};

export default getRedirectPath;
