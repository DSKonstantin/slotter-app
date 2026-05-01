import type { User } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

export const ONBOARDING_STEPS = {
  personal_information: Routers.onboarding.personalInformation,
  service: Routers.onboarding.service,
  schedule: Routers.onboarding.schedule,
  notification: Routers.onboarding.notification,
  link: Routers.onboarding.link,
  completed: Routers.app.root,
} as const;

export type OnboardingStepKey = keyof typeof ONBOARDING_STEPS;

export const STEP_PROGRESS: Partial<Record<OnboardingStepKey, number>> = {
  personal_information: 1,
  service: 2,
  schedule: 3,
};

export const TOTAL_STEPS = 3;

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

  const step = user.onboarding_step as OnboardingStepKey;
  return ONBOARDING_STEPS[step] ?? Routers.onboarding.personalInformation;
};

export default getRedirectPath;
