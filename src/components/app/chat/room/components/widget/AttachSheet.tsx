import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { StModal } from "@/src/components/ui/StModal";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { Service } from "@/src/store/redux/services/api-types";
import AttachMenu from "./AttachMenu";
import ServicePicker from "./ServicePicker";
import DatePicker from "./DatePicker";
import SlotPicker from "./SlotPicker";

type Mode = "menu" | "service" | "appointment";
type AppointmentStage = "service" | "date" | "slot";

export type ProposeData = {
  service: Service;
  date: string;
  startTime: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: number;
  isSubmitting?: boolean;
  onPickService: (service: Service) => void;
  onProposeAppointment: (data: ProposeData) => void;
};

const STAGE_TITLES: Record<AppointmentStage, string> = {
  service: "Выберите услугу",
  date: "Выберите день",
  slot: "Выберите время",
};

const AttachSheet = ({
  visible,
  onClose,
  userId,
  isSubmitting,
  onPickService,
  onProposeAppointment,
}: Props) => {
  const [mode, setMode] = useState<Mode>("menu");
  const [stage, setStage] = useState<AppointmentStage>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Reset wizard state whenever the sheet closes — covers backdrop dismiss,
  // parent-driven close (e.g. after a successful proposal), and back navigation.
  // The 200ms delay matches the modal close animation so steps don't visibly
  // jump back during the slide-out.
  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => {
      setMode("menu");
      setStage("service");
      setSelectedService(null);
      setSelectedDate(null);
    }, 200);
    return () => clearTimeout(t);
  }, [visible]);

  const handleBack = useCallback(() => {
    if (mode === "menu") {
      onClose();
      return;
    }
    if (mode === "service") {
      setMode("menu");
      return;
    }
    if (stage === "slot") setStage("date");
    else if (stage === "date") setStage("service");
    else setMode("menu");
  }, [mode, stage, onClose]);

  const handleServiceTapped = useCallback(
    (service: Service) => {
      if (mode === "service") {
        onPickService(service);
        onClose();
        return;
      }
      setSelectedService(service);
      setStage("date");
    },
    [mode, onPickService, onClose],
  );

  const handlePickDate = useCallback((date: string) => {
    setSelectedDate(date);
    setStage("slot");
  }, []);

  const handlePickSlot = useCallback(
    (startTime: string) => {
      if (!selectedService || !selectedDate) return;
      onProposeAppointment({
        service: selectedService,
        date: selectedDate,
        startTime,
      });
    },
    [onProposeAppointment, selectedService, selectedDate],
  );

  const title = useMemo(() => {
    if (mode === "menu") return "Прикрепить";
    if (mode === "service") return "Прикрепить услугу";
    return STAGE_TITLES[stage];
  }, [mode, stage]);

  const renderBody = () => {
    if (mode === "menu") {
      return (
        <AttachMenu
          onPickService={() => setMode("service")}
          onProposeAppointment={() => {
            setMode("appointment");
            setStage("service");
          }}
        />
      );
    }
    if (mode === "service" || stage === "service") {
      return <ServicePicker userId={userId} onSelect={handleServiceTapped} />;
    }
    if (stage === "date") {
      return <DatePicker userId={userId} onPick={handlePickDate} />;
    }
    if (selectedDate) {
      return (
        <SlotPicker
          userId={userId}
          date={selectedDate}
          isSubmitting={isSubmitting}
          onPick={handlePickSlot}
        />
      );
    }
    return null;
  };

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="flex-row items-center mb-4 gap-2">
        <IconButton
          icon={
            mode === "menu" ? (
              <StSvg name="Close_round" size={24} color={colors.neutral[900]} />
            ) : (
              <StSvg name="Expand_left" size={24} color={colors.neutral[900]} />
            )
          }
          onPress={handleBack}
        />
        <Typography
          weight="semibold"
          className="text-neutral-900 text-body flex-1"
        >
          {title}
        </Typography>
      </View>
      {renderBody()}
    </StModal>
  );
};

export default AttachSheet;
