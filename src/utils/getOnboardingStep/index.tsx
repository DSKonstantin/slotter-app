import { API } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

const getRedirectPath = (user: API.User) => {
  if (!user.email) return Routers.auth.register;
  if (!user.experience) return Routers.auth.experience;
  if (!user.profession) return Routers.auth.personalInformation;
  return Routers.auth.personalInformation;
  // return Routers.tabs.home;
};

export default getRedirectPath;
