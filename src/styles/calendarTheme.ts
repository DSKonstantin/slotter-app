import { StyleSheet } from "react-native";
import { colors } from "@/src/styles/colors";

export const calendarStyle = StyleSheet.create({
  calendar: {
    paddingLeft: 0,
    paddingRight: 0,
  },
});

const styles = StyleSheet.create({
  monthView: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  week: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scheduleMonthView: {
    backgroundColor: "transparent",
  },
  scheduleWeek: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  mainWeek: {
    marginVertical: 4,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  scheduleMainWeek: {
    marginVertical: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

const baseCalendarTheme = {
  calendarBackground: "transparent",
  textSectionTitleColor: colors.neutral[400],
  todayTextColor: colors.primary?.blue[500],
  dayTextColor: colors.neutral[900],
  textDisabledColor: colors.neutral[300],
  selectedDayBackgroundColor: colors.primary.blue[500],
  selectedDayTextColor: colors.neutral[0],
  arrowColor: colors.neutral[900],
  textDayFontFamily: "Inter_400Regular",
  textMonthFontFamily: "Inter_500Medium",
  textMonthFontWeight: "500" as const,
  textDayHeaderFontFamily: "Inter_600SemiBold",
  textDayHeaderFontSize: 13,
  textDayFontSize: 15,
  monthTextColor: colors.neutral[900],
  textMonthFontSize: 16,
};

export const calendarTheme = {
  ...baseCalendarTheme,
  "stylesheet.calendar.main": {
    monthView: styles.monthView,
    week: styles.mainWeek,
  },
  "stylesheet.calendar.header": {
    week: styles.week,
  },
};

export const pickerCalendarTheme = {
  ...baseCalendarTheme,
  "stylesheet.calendar.main": {
    monthView: styles.monthView,
    week: styles.mainWeek,
  },
  "stylesheet.calendar.header": {
    week: styles.week,
  },
};

export const scheduleCalendarTheme = {
  ...baseCalendarTheme,
  "stylesheet.calendar.main": {
    monthView: styles.scheduleMonthView,
    week: styles.scheduleMainWeek,
  },
  "stylesheet.calendar.header": {
    week: styles.scheduleWeek,
  },
};
