// import React from "react";
// import { type ViewProps } from "react-native";
// import { twMerge } from "tailwind-merge";
// import { BlurView } from "expo-blur";
// import {
//   GlassView,
//   isLiquidGlassAvailable,
//   type GlassStyle,
// } from "expo-glass-effect";
//
// type GlassSurfaceProps = ViewProps & {
//   effect?: GlassStyle;
//   interactive?: boolean;
//   fallbackClassName?: string;
// };
//
// export function GlassSurface({
//   effect = "regular",
//   interactive = false,
//   fallbackClassName,
//   className,
//   children,
//   ...props
// }: GlassSurfaceProps) {
//   if (!isLiquidGlassAvailable()) {
//     return (
//       <BlurView
//         tint="light"
//         intensity={80}
//         className={twMerge(className, fallbackClassName)}
//         {...props}
//       >
//         {children}
//       </BlurView>
//     );
//   }
//
//   return (
//     <GlassView
//       glassEffectStyle={effect}
//       isInteractive={interactive}
//       colorScheme="light"
//       className={className}
//       {...props}
//     >
//       {children}
//     </GlassView>
//   );
// }
