const colors = require("./src/styles/colorsTailwind");
const { SCREEN_PADDING } = require("./src/constants/layout");

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    fontFamily: {
      "inter-regular": ["Inter_400Regular"],
      "inter-medium": ["Inter_500Medium"],
      "inter-semibold": ["Inter_600SemiBold"],
      "inter-bold": ["Inter_700Bold"],
      "inter-extrabold": ["Inter_800ExtraBold"],
    },
    extend: {
      fontSize: {
        display: [20, 1.2],
        body: [16, 1.5],
        caption: [13, "18px"],
      },
      letterSpacing: {},
      borderRadius: {
        small: "14px",
        base: "20px",
        medium: "25px",
        large: "36px",
      },
      lineHeight: {},
      boxShadow: {},
      opacity: {},
      spacing: {
        screen: SCREEN_PADDING,
      },
      colors,
    },
  },
  plugins: [],
};
