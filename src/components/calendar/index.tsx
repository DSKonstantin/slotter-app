import { Calendar as RNCalendar, DateData } from "react-native-calendars";

type CalendarProps = {
  selectedDate?: string;
  onSelect: (date: string) => void;
};

export function Calendar({ selectedDate, onSelect }: CalendarProps) {
  return (
    <RNCalendar
      theme={styles}
      onDayPress={(day: DateData) => {
        onSelect(day.dateString);
      }}
      markedDates={
        selectedDate
          ? {
              [selectedDate]: {
                selected: true,
                disableTouchEvent: true,
              },
            }
          : undefined
      }
      firstDay={1}
      enableSwipeMonths
    />
  );
}

const styles = {
  backgroundColor: "#ffffff",
  calendarBackground: "#ffffff",

  textSectionTitleColor: "#8E8E93",
  selectedDayBackgroundColor: "#0088FF",
  selectedDayTextColor: "#ffffff",

  todayTextColor: "#0088FF",
  dayTextColor: "#000000",
  monthTextColor: "#000000",

  textDayFontFamily: "Inter_400Regular",
  textMonthFontFamily: "Inter_600SemiBold",
  textDayHeaderFontFamily: "Inter_500Medium",

  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
};
