import { useEffect } from "react";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Svg, { Rect } from "react-native-svg";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

const STROKE_WIDTH = 2.5;
const CORNER_RADIUS = 7;
const DASH_RATIO = 0.28;
const SPIN_DURATION_MS = 1200;

type TraceSpinnerProps = {
  size?: number;
  color?: string;
};

export function TraceSpinner({
  size = 28,
  color = "#FFFFFF",
}: TraceSpinnerProps) {
  const inset = STROKE_WIDTH / 2;
  const boxSize = size - STROKE_WIDTH;
  const perimeter =
    2 * (boxSize - 2 * CORNER_RADIUS) +
    2 * (boxSize - 2 * CORNER_RADIUS) +
    2 * Math.PI * CORNER_RADIUS;
  const dashLength = perimeter * DASH_RATIO;

  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withRepeat(
      withTiming(-perimeter, {
        duration: SPIN_DURATION_MS,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [offset, perimeter]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <AnimatedRect
        x={inset}
        y={inset}
        width={boxSize}
        height={boxSize}
        rx={CORNER_RADIUS}
        ry={CORNER_RADIUS}
        fill="none"
        stroke={color}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={`${dashLength} ${perimeter - dashLength}`}
        animatedProps={animatedProps}
      />
    </Svg>
  );
}
