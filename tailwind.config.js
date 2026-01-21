const colors = require("./src/styles/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
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
    },
    extend: {
      fontSize: {
        display: [20, 1.2],
        body: [16, 1.5],
        caption: [13, "18px"],
      },
      letterSpacing: {},
      borderRadius: {
        small: "",
        medium: "25px",
        large: "",
      },
      lineHeight: {},
      boxShadow: {},
      opacity: {},
      colors,
    },
  },
  plugins: [],
};
