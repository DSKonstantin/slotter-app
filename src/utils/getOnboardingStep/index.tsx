import type { User } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

export const ONBOARDING_STEPS = {
  register: Routers.onboarding.register,
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
  return (
    ONBOARDING_STEPS[user.onboarding_step as OnboardingStepKey] ??
    Routers.onboarding.register
  );
};

export default getRedirectPath;
