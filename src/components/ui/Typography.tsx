import { Text as RNText, TextProps as RNTextProps } from "react-native";

type TextWeight = "regular" | "medium" | "semibold";

type TextProps = {
  weight?: TextWeight;
} & RNTextProps;

export function Typography({
  weight = "medium",
  className,
  ...props
}: TextProps) {
  return (
    <RNText
      className={className ? `${styles[weight]} ${className}` : styles[weight]}
      {...props}
    />
  );
}

const styles = {
  regular: "font-inter-regular",
  medium: "font-inter-medium",
  semibold: "font-inter-semibold",
};
