import { useAppSelector } from "@/src/store/redux/store";
import { appointmentStepToMinutes } from "@/src/utils/schedule/appointmentStepToMinutes";
import type { AppointmentStepMinutes } from "@/src/utils/schedule/appointmentStepToMinutes";

type SlotStep = {
  stepMinutes: AppointmentStepMinutes;
  useHourGrouping: boolean;
};

export function useSlotStep(): SlotStep {
  const appointmentStep = useAppSelector((s) => s.auth.user?.appointment_step);
  const stepMinutes: AppointmentStepMinutes = appointmentStep
    ? appointmentStepToMinutes(appointmentStep)
    : 60;
  return {
    stepMinutes,
    useHourGrouping: stepMinutes < 60,
  };
}
