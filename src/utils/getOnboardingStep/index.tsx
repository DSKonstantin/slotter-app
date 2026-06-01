import type { User } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

const getRedirectPath = (user: User) => {
  if (!user.email) {
    return Routers.onboarding.register;
  }

  if (!user.name) {
    return Routers.onboarding.personalName;
  }

  return Routers.app.root;
};

export default getRedirectPath;
