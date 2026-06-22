import React from "react";
import { useAppSelector } from "@/src/store/redux/store";
import RetryInline from "@/src/components/shared/retryInline";
import { useHomeAssistantState } from "../useHomeAssistantState";
import AssistantSkeleton from "./AssistantSkeleton";
import AfterOnboarding from "./AfterOnboarding";
import SetupScheduleVariant from "./SetupScheduleVariant";
import ScheduleClosedVariant from "./ScheduleClosedVariant";
import FreeDayVariant from "./FreeDayVariant";
import WaitingNext from "./WaitingNext";
import CurrentAndNext from "./CurrentAndNext";
import CompletedDay from "./CompletedDay";

const SpecialistHomeAssistant = () => {
  const nickname = useAppSelector((s) => s.auth.user?.nickname ?? "");
  const firstName = useAppSelector((s) => s.auth.user?.first_name ?? "");
  const { state, refetch } = useHomeAssistantState();
  // const state = {
  //   kind: "waiting_next",
  //   hasTodaySchedule: false,
  //   appointments: {},
  // };
  //
  // // no_schedule

  switch (state.kind) {
    case "loading":
      return <AssistantSkeleton />;
    case "error":
      return <RetryInline onRetry={refetch} />;
    case "onboarding":
      return (
        <AfterOnboarding
          nickname={nickname}
          hasTodaySchedule={state.hasTodaySchedule}
        />
      );
    case "no_schedule":
      return <SetupScheduleVariant />;
    case "day_off":
      return <ScheduleClosedVariant />;
    case "free_day":
      return (
        <FreeDayVariant
          nickname={nickname}
          startAt={state.startAt}
          endAt={state.endAt}
        />
      );
    case "waiting_next":
      return <WaitingNext appointments={state.appointments} />;
    case "current_and_next":
      return (
        <CurrentAndNext
          current={state.current}
          appointments={state.appointments}
        />
      );
    case "completed":
      return <CompletedDay firstName={firstName} />;
    default:
      return <AfterOnboarding nickname={nickname} hasTodaySchedule={false} />;
  }
};

export default SpecialistHomeAssistant;
