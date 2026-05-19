import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { StModal } from "@/src/components/ui/StModal";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type {
  AdditionalService,
  Service,
} from "@/src/store/redux/services/api-types";
import type { PickedAssets } from "@/src/components/shared/imagePicker/imagePickerTrigger";
import AttachMenu from "./AttachMenu";
import ServicePicker from "./ServicePicker";
import AdditionalServicePicker from "./AdditionalServicePicker";
import DatePicker from "./DatePicker";
import SlotPicker from "./SlotPicker";

type Mode = "menu" | "service" | "appointment";
type AppointmentStage = "service" | "additional-service" | "date" | "slot";

type WizardState = {
  mode: Mode;
  stage: AppointmentStage;
  selectedService: Service | null;
  selectedAdditionalService: AdditionalService | null;
  selectedDate: string | null;
};

const INITIAL_STATE: WizardState = {
  mode: "menu",
  stage: "service",
  selectedService: null,
  selectedAdditionalService: null,
  selectedDate: null,
};

export type ProposeData = {
  service: Service;
  additionalServiceId?: number;
  date: string;
  startTime: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  userId: number;
  isSubmitting?: boolean;
  isUser?: boolean;
  onPickService: (service: Service) => void;
  onProposeAppointment: (data: ProposeData) => void;
  onAttachFile: (assets: PickedAssets) => void;
};

const STAGE_TITLES: Record<AppointmentStage, string> = {
  service: "Выберите услугу",
  "additional-service": "Доп. услуга",
  date: "Выберите день",
  slot: "Выберите время",
};

const AttachSheet = ({
  visible,
  onClose,
  userId,
  isSubmitting,
  isUser,
  onPickService,
  onProposeAppointment,
  onAttachFile,
}: Props) => {
  const [state, setState] = useState<WizardState>(INITIAL_STATE);
  const {
    mode,
    stage,
    selectedService,
    selectedAdditionalService,
    selectedDate,
  } = state;

  const handleBack = useCallback(() => {
    setState((prev) => {
      if (prev.mode === "menu") {
        onClose();
        return prev;
      }
      if (prev.mode === "service") return { ...prev, mode: "menu" };
      if (prev.stage === "slot") return { ...prev, stage: "date" };
      if (prev.stage === "date")
        return { ...prev, stage: "additional-service" };
      if (prev.stage === "additional-service")
        return { ...prev, stage: "service" };
      return { ...prev, mode: "menu" };
    });
  }, [onClose]);

  const handleServiceTapped = useCallback(
    (service: Service) => {
      if (mode === "service") {
        onPickService(service);
        onClose();
        return;
      }
      setState((prev) => ({
        ...prev,
        selectedService: service,
        stage: "additional-service",
      }));
    },
    [mode, onPickService, onClose],
  );

  const handlePickDate = useCallback((date: string) => {
    setState((prev) => ({ ...prev, selectedDate: date, stage: "slot" }));
  }, []);

  const handlePickAdditionalService = useCallback(
    (service: AdditionalService) => {
      setState((prev) => ({
        ...prev,
        selectedAdditionalService: service,
        stage: "date",
      }));
    },
    [],
  );

  const handleSkipAdditionalService = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedAdditionalService: null,
      stage: "date",
    }));
  }, []);

  const handlePickSlot = useCallback(
    (startTime: string) => {
      if (!selectedService || !selectedDate) return;
      onProposeAppointment({
        service: selectedService,
        additionalServiceId: selectedAdditionalService?.id,
        date: selectedDate,
        startTime,
      });
    },
    [
      onProposeAppointment,
      selectedService,
      selectedAdditionalService,
      selectedDate,
    ],
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
          isUser={isUser}
          onPickService={() => setState((p) => ({ ...p, mode: "service" }))}
          onProposeAppointment={() =>
            setState((p) => ({ ...p, mode: "appointment", stage: "service" }))
          }
          onAttachFile={(assets) => {
            onAttachFile(assets);
            onClose();
          }}
        />
      );
    }
    if (stage === "additional-service") {
      return (
        <AdditionalServicePicker
          userId={userId}
          onSelect={handlePickAdditionalService}
          onSkip={handleSkipAdditionalService}
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

  // Reset wizard state whenever the sheet closes — covers backdrop dismiss,
  // parent-driven close (e.g. after a successful proposal), and back navigation.
  // The 200ms delay matches the modal close animation so steps don't visibly
  // jump back during the slide-out.
  useEffect(() => {
    if (visible) return;
    const t = setTimeout(() => setState(INITIAL_STATE), 200);
    return () => clearTimeout(t);
  }, [visible]);

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
        {stage === "additional-service" && (
          <Pressable onPress={handleSkipAdditionalService} hitSlop={8}>
            <Typography className="text-caption text-neutral-500">
              Пропустить
            </Typography>
          </Pressable>
        )}
      </View>
      {renderBody()}
    </StModal>
  );
};

export default AttachSheet;
