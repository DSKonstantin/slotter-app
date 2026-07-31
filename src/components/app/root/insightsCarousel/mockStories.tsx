import React from "react";
import type { Story } from "./NotificationStoriesModal";

import EducationPaymentsOne from "@/src/components/app/root/insightsCarousel/screens/educationPayments/one";
import EducationPaymentsTwo from "@/src/components/app/root/insightsCarousel/screens/educationPayments/two";
import EducationPaymentsThree from "@/src/components/app/root/insightsCarousel/screens/educationPayments/three";
import EducationPaymentsFour from "@/src/components/app/root/insightsCarousel/screens/educationPayments/four";
import EducationPaymentsFive from "@/src/components/app/root/insightsCarousel/screens/educationPayments/five";
import EducationPaymentsSix from "@/src/components/app/root/insightsCarousel/screens/educationPayments/six";
import FillProfileOne from "@/src/components/app/root/insightsCarousel/screens/fillProfile/one";
import FillProfileTwo from "@/src/components/app/root/insightsCarousel/screens/fillProfile/two";
import FillProfileThree from "@/src/components/app/root/insightsCarousel/screens/fillProfile/three";
import FillProfileFour from "@/src/components/app/root/insightsCarousel/screens/fillProfile/four";
import FinancesOne from "@/src/components/app/root/insightsCarousel/screens/finances/one";
import FinancesTwo from "@/src/components/app/root/insightsCarousel/screens/finances/two";
import FinancesThree from "@/src/components/app/root/insightsCarousel/screens/finances/three";
import FinancesFour from "@/src/components/app/root/insightsCarousel/screens/finances/four";
import FinancesFive from "@/src/components/app/root/insightsCarousel/screens/finances/five";
import NotificationOne from "@/src/components/app/root/insightsCarousel/screens/notification/one";
import NotificationTwo from "@/src/components/app/root/insightsCarousel/screens/notification/two";
import NotificationThree from "@/src/components/app/root/insightsCarousel/screens/notification/three";
import NotificationFour from "@/src/components/app/root/insightsCarousel/screens/notification/four";

export { INSIGHT_CATEGORY_CONFIG } from "./config";
export type { InsightCategoryConfig } from "./config";

const TRAINING_STORIES: Story[] = [
  {
    id: "1",
    customScreen: <EducationPaymentsOne />,
  },
  {
    id: "2",
    customScreen: <EducationPaymentsTwo />,
  },
  {
    id: "3",
    customScreen: <EducationPaymentsThree />,
  },
  {
    id: "4",
    customScreen: <EducationPaymentsFour />,
  },
  {
    id: "5",
    customScreen: <EducationPaymentsFive />,
  },
  {
    id: "6",
    customScreen: <EducationPaymentsSix />,
  },
];

const FILL_PROFILE_STORIES: Story[] = [
  {
    id: "1",
    customScreen: <FillProfileOne />,
  },
  {
    id: "2",
    customScreen: <FillProfileTwo />,
  },
  {
    id: "3",
    customScreen: <FillProfileThree />,
  },
  {
    id: "4",
    customScreen: <FillProfileFour />,
  },
];

const FINANCES_STORIES: Story[] = [
  {
    id: "1",
    customScreen: <FinancesOne />,
  },
  {
    id: "2",
    customScreen: <FinancesTwo />,
  },
  {
    id: "3",
    customScreen: <FinancesThree />,
  },
  {
    id: "4",
    customScreen: <FinancesFour />,
  },
  {
    id: "5",
    customScreen: <FinancesFive />,
  },
];

const NOTIFICATION_STORIES: Story[] = [
  {
    id: "1",
    customScreen: <NotificationOne />,
  },
  {
    id: "2",
    customScreen: <NotificationTwo />,
  },
  {
    id: "3",
    customScreen: <NotificationThree />,
  },
  {
    id: "4",
    customScreen: <NotificationFour />,
  },
];

export const MOCK_NOTIFICATION_STORIES: Record<string, Story[]> = {
  education_payments: TRAINING_STORIES,
  fill_profile: FILL_PROFILE_STORIES,
  finances: FINANCES_STORIES,
  notification: NOTIFICATION_STORIES,
};
