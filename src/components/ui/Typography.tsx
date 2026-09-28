import type { TextProps as RNTextProps } from "react-native";
import { AppText } from "./AppText";

export type TextWeight =
  "regular" | "medium" | "semibold" | "bold" | "extrabold";

type TextProps = {
  weight?: TextWeight;
  children: React.ReactNode;
} & RNTextProps;

export function Typography({
  weight = "medium",
  className,
  children,
  ...props
}: TextProps) {
  return (
    <AppText
      className={className ? `${styles[weight]} ${className}` : styles[weight]}
      {...props}
    >
      {children}
    </AppText>
  );
}

const styles = {
  regular: "font-inter-regular",
  medium: "font-inter-medium",
  semibold: "font-inter-semibold",
  bold: "font-inter-bold",
  extrabold: "font-inter-extrabold",
};
