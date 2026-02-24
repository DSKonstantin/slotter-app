import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import { Routers } from "@/src/constants/routers";
import type { RootState } from "@/src/store/redux/store";

export default function OnboardingIndex() {
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return <Redirect href={Routers.auth.root} />;
  }

  if (!user.email) {
    return <Redirect href={Routers.onboarding.register} />;
  }

  if (!user.profession) {
    return <Redirect href={Routers.onboarding.personalInformation} />;
  }

  return <Redirect href={Routers.onboarding.personalInformation} />;
  // return <Redirect href={Routers.app.root} />;
}
