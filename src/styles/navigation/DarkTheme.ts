import { DarkTheme as BaseDarkTheme } from "expo-router/react-navigation";

const DarkTheme = {
  ...BaseDarkTheme,
  colors: {
    ...BaseDarkTheme.colors,
  },
};

export default DarkTheme;
