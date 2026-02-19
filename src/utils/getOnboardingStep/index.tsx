import { API } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

const getRedirectPath = (user: API.User) => {
  if (!user.email) return Routers.onboarding.register;
  if (!user.profession) return Routers.onboarding.personalInformation;

  return Routers.app.root;
};

export default getRedirectPath;
