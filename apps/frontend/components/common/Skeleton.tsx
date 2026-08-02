import React, { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

/** A single shimmering placeholder block. */
export function Skeleton({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.base, style, anim]} />;
}

/** A horizontal row of card-shaped skeletons for loading list sections. */
export function CardSkeletonRow({
  count = 3,
  width = 250,
  height = 250,
  radius = 20,
}: {
  count?: number;
  width?: number;
  height?: number;
  radius?: number;
}) {
  return (
    <View style={styles.row}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          style={{ width, height, borderRadius: radius, marginRight: 18 }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 12,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 20,
  },
});
