import { Redirect } from "expo-router";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppSelector } from "@/src/store/redux/store";
import getRedirectPath from "@/src/utils/getOnboardingStep";

export default function OnboardingIndex() {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);

  if (!auth || !user) return null;

  return <Redirect href={getRedirectPath(user)} />;
}
