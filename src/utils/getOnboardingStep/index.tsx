import { API } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

const getRedirectPath = (user: API.User) => {
  if (!user.email) return Routers.auth.register;
  // if (!user.first_name) return Routers.auth.verify;
  // if (!user.profession) return Routers.auth.verify;

  return Routers.auth.register;
  // return Routers.tabs.home;
};

export default getRedirectPath;
