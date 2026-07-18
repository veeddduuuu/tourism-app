import React, { useEffect } from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";

interface Props {
  name: string;
  d: string;
  bbox: [number, number, number, number];
  size?: number;
}

/**
 * Renders a single state as a glowing, pseudo-3D shape that rises and gently
 * floats when it mounts. Depth is faked with a stack of dark offset copies
 * (the "extrusion wall"); the glow is a soft pulsing halo plus translucent
 * stroke layers. Re-mount it with a `key` to replay the entrance.
 */
export default function StateShape({ name, d, bbox, size = 170 }: Props) {
  const [bx, by, bw, bh] = bbox;
  const span = Math.max(bw, bh);
  const pad = span * 0.22;
  const viewBox = `${bx - pad} ${by - pad} ${bw + 2 * pad} ${bh + 2 * pad}`;

  const depth = Math.max(5, span * 0.05);
  const steps = Math.round(depth);

  const mount = useSharedValue(0);
  const floatY = useSharedValue(0);

  useEffect(() => {
    mount.value = withSpring(1, { damping: 11, stiffness: 120 });
    floatY.value = withRepeat(withTiming(1, { duration: 1900 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: mount.value,
    transform: [
      {
        translateY:
          interpolate(mount.value, [0, 1], [45, 0]) +
          interpolate(floatY.value, [0, 1], [0, -7]),
      },
      { scale: interpolate(mount.value, [0, 1], [0.55, 1]) },
    ],
  }));

  return (
    <Animated.View style={[{ width: size, height: size }, containerStyle]}>
      <Svg width={size} height={size} viewBox={viewBox}>
        <Defs>
          <LinearGradient id="face" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFC79A" />
            <Stop offset="1" stopColor="#FF6B35" />
          </LinearGradient>
        </Defs>

        {/* Extrusion wall: dark copies offset downward, deepest first */}
        {Array.from({ length: steps }).map((_, i) => {
          const dy = steps - i;
          return (
            <Path
              key={`ex-${i}`}
              d={d}
              fill="#7C2409"
              transform={`translate(0 ${dy})`}
            />
          );
        })}

        {/* Glow halo (translucent stroke layers) */}
        <Path d={d} fill="none" stroke="#FF8C42" strokeWidth={depth * 1.8} opacity={0.18} strokeLinejoin="round" />
        <Path d={d} fill="none" stroke="#FFB703" strokeWidth={depth} opacity={0.28} strokeLinejoin="round" />

        {/* Top face */}
        <Path
          d={d}
          fill="url(#face)"
          stroke="#FFE3C7"
          strokeWidth={1.2}
          strokeLinejoin="round"
        />
      </Svg>
    </Animated.View>
  );
}
