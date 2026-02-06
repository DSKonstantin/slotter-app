import { Text as RNText, TextProps as RNTextProps } from "react-native";

type TextWeight = "regular" | "medium" | "semibold" | "bold";

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
    <RNText
      className={className ? `${styles[weight]} ${className}` : styles[weight]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = {
  regular: "font-inter-regular",
  medium: "font-inter-medium",
  semibold: "font-inter-semibold",
  bold: "font-inter-bold",
};
