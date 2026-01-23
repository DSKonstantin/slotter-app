import createIconSetFromIcoMoon from "@expo/vector-icons/createIconSetFromIcoMoon";

export const StSvg = createIconSetFromIcoMoon(
  require("@/assets/icomoon/selection.json"),
  "IcoMoon",
  "icomoon.ttf",
);

// import React from "react";
// import createIconSet from "@react-native-vector-icons/icomoon";
// import icoMoonConfig from "./selection.json";
// import { IconProps } from "@react-native-vector-icons/common";
//
// const SvgIcon = createIconSet(icoMoonConfig);
//
// interface CustomIconProps extends IconProps<string> {
//   name: string;
// }
//
// const StSvg: React.FC<CustomIconProps> = ({ name, ...props }) => {
//   return <SvgIcon name={name} {...props} />;
// };
//
// export default StSvg;
