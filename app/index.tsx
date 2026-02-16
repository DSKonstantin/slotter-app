import { useSelector } from "react-redux";
import { Redirect } from "expo-router";
import { RootState } from "@/src/store/redux/store";
import getRedirectPath from "@/src/utils/getOnboardingStep";
import { Routers } from "@/src/constants/routers";

export default function Index() {
  const user = useSelector((state: RootState) => state.auth.user);
  const status = useSelector((state: RootState) => state.auth.status);

  console.log(user, "authApi");

  if (status === "idle" || status === "loading") {
    return null;
  }

  if (status === "authenticated" && user) {
    return <Redirect href={getRedirectPath(user)} />;
  }

  return <Redirect href={Routers.auth.root} />;
}
