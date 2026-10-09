import {
  Button,
  Chart,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@expo/ui/swift-ui";
import {
  background,
  buttonStyle,
  containerBackground,
  font,
  foregroundStyle,
  frame,
  lineLimit,
  minimumScaleFactor,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

export type SlotterWidgetTab = "clients" | "finance";

export type SlotterWidgetProps = {
  tab: SlotterWidgetTab;
  amount: string;
  delta: string;
  points: number[];
  appointments: number;
  freeSlots: number;
  newClients: number;
  regularClients: number;
  nextAppointment: string;
};

const SlotterWidgetLayout = (
  props: SlotterWidgetProps,
  environment: WidgetEnvironment,
) => {
  "widget";

  const isFinance = props.tab === "finance";
  const isMedium = environment.widgetFamily === "systemMedium";

  return (
    <VStack
      spacing={10}
      alignment="leading"
      modifiers={[
        padding({ all: 4 }),
        frame({ maxWidth: 10000, maxHeight: 10000, alignment: "topLeading" }),
        containerBackground(
          {
            type: "linearGradient",
            colors: ["#C8F660", "#EFFFCA"],
            startPoint: { x: 0, y: 0 },
            endPoint: { x: 1, y: 1 },
          },
          "widget",
        ),
      ]}
    >
      {!isMedium && (
        <HStack
          spacing={0}
          modifiers={[
            padding({ all: 3 }),
            frame({ maxWidth: 10000 }),
            background("#FFFFFF66", shapes.capsule()),
          ]}
        >
          <Button
            target="tab_clients"
            modifiers={[buttonStyle("plain"), frame({ maxWidth: 10000 })]}
            onPress={() => ({ ...props, tab: "clients" })}
          >
            <HStack
              modifiers={[
                frame({ maxWidth: 10000, height: 32 }),
                ...(isFinance ? [] : [background("#FFFFFF", shapes.capsule())]),
              ]}
            >
              <Spacer />
              <Text
                modifiers={[
                  font({ size: 15, weight: "medium" }),
                  foregroundStyle("#000000"),
                ]}
              >
                Клиенты
              </Text>
              <Spacer />
            </HStack>
          </Button>
          <Button
            target="tab_finance"
            modifiers={[buttonStyle("plain"), frame({ maxWidth: 10000 })]}
            onPress={() => ({ ...props, tab: "finance" })}
          >
            <HStack
              modifiers={[
                frame({ maxWidth: 10000, height: 32 }),
                ...(isFinance ? [background("#FFFFFF", shapes.capsule())] : []),
              ]}
            >
              <Spacer />
              <Text
                modifiers={[
                  font({ size: 15, weight: "medium" }),
                  foregroundStyle("#000000"),
                ]}
              >
                Финансы
              </Text>
              <Spacer />
            </HStack>
          </Button>
        </HStack>
      )}

      {!isMedium && <Spacer />}

      <HStack spacing={8} modifiers={[frame({ maxWidth: 10000 })]}>
        <VStack spacing={2} alignment="leading">
          <Text modifiers={[font({ size: 15 }), foregroundStyle("#000000B3")]}>
            Сегодня
          </Text>
          <Text
            modifiers={[
              font({ size: 32, weight: "bold" }),
              foregroundStyle("#000000"),
              lineLimit(1),
              minimumScaleFactor(0.5),
            ]}
          >
            {isFinance ? props.amount : String(props.appointments)}
          </Text>
        </VStack>
        <Spacer />
        <VStack spacing={6} alignment="trailing">
          <Text
            modifiers={[
              font({ size: 13, weight: "semibold" }),
              foregroundStyle("#FFFFFF"),
              padding({ horizontal: 8, vertical: 3 }),
              background("#34C759", shapes.capsule()),
              lineLimit(1),
            ]}
          >
            {isFinance ? props.delta : "записей"}
          </Text>
          <Chart
            type="area"
            showGrid={false}
            data={props.points.map((value, index) => ({
              x: index,
              y: value,
            }))}
            areaStyle={{ color: "#34C75940" }}
            modifiers={[frame({ width: 140, height: isMedium ? 48 : 64 })]}
          />
        </VStack>
      </HStack>

      {!isMedium && <Spacer />}

      <HStack spacing={8} modifiers={[frame({ maxWidth: 10000 })]}>
        <HStack
          spacing={8}
          modifiers={[
            padding({ all: 10 }),
            frame({ maxWidth: 10000, height: 60 }),
            background(
              "#FFFFFF66",
              shapes.roundedRectangle({ cornerRadius: 16 }),
            ),
          ]}
        >
          <Image systemName="person.2.fill" size={22} color="#319F3A" />
          <VStack spacing={0} alignment="leading">
            <Text
              modifiers={[
                font({ size: 22, weight: "bold" }),
                foregroundStyle("#000000"),
                lineLimit(1),
              ]}
            >
              {String(isFinance ? props.appointments : props.newClients)}
            </Text>
            <Text
              modifiers={[
                font({ size: 13 }),
                foregroundStyle("#000000B3"),
                lineLimit(1),
                minimumScaleFactor(0.7),
              ]}
            >
              {isFinance ? "записей" : "новых"}
            </Text>
          </VStack>
          <Spacer />
        </HStack>
        <HStack
          spacing={8}
          modifiers={[
            padding({ all: 10 }),
            frame({ maxWidth: 10000, height: 60 }),
            background(
              "#FFFFFF66",
              shapes.roundedRectangle({ cornerRadius: 16 }),
            ),
          ]}
        >
          <Image
            systemName={isFinance ? "calendar" : "star.fill"}
            size={22}
            color="#319F3A"
          />
          <VStack spacing={0} alignment="leading">
            <Text
              modifiers={[
                font({ size: 22, weight: "bold" }),
                foregroundStyle("#000000"),
                lineLimit(1),
              ]}
            >
              {String(isFinance ? props.freeSlots : props.regularClients)}
            </Text>
            <Text
              modifiers={[
                font({ size: 13 }),
                foregroundStyle("#000000B3"),
                lineLimit(1),
                minimumScaleFactor(0.7),
              ]}
            >
              {isFinance ? "свободных окна" : "постоянных"}
            </Text>
          </VStack>
          <Spacer />
        </HStack>
      </HStack>

      {!isMedium && (
        <HStack
          spacing={8}
          modifiers={[
            padding({ all: 12 }),
            frame({ maxWidth: 10000 }),
            background(
              "#FFFFFF66",
              shapes.roundedRectangle({ cornerRadius: 16 }),
            ),
          ]}
        >
          <Image systemName="clock" size={20} color="#319F3A" />
          <Text
            modifiers={[
              font({ size: 15 }),
              foregroundStyle("#000000"),
              lineLimit(1),
            ]}
          >
            Следующая запись
          </Text>
          <Text
            modifiers={[
              font({ size: 15, weight: "bold" }),
              foregroundStyle("#000000"),
              lineLimit(1),
            ]}
          >
            {props.nextAppointment}
          </Text>
          <Spacer />
          <Image systemName="chevron.right" size={14} color="#000000B3" />
        </HStack>
      )}
    </VStack>
  );
};

export const SLOTTER_WIDGET_NAME = "SlotterWidget";

export const slotterWidget = createWidget<SlotterWidgetProps>(
  SLOTTER_WIDGET_NAME,
  SlotterWidgetLayout,
);
