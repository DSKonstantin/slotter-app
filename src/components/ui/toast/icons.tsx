import Svg, { Circle, Path, Rect } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
};

export function ErrorTriangleIcon({ size = 28, color = "#FF3B30" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        fill={color}
      />
      <Rect x="11" y="9" width="2" height="6" rx="1" fill="#FFFFFF" />
      <Circle cx="12" cy="17" r="1.1" fill="#FFFFFF" />
    </Svg>
  );
}
