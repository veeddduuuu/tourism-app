import React from "react";
import { Pressable, PressableProps, ViewStyle, StyleProp } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** How far the element shrinks while pressed. Default 0.96. */
  scaleTo?: number;
  /** Fire a light haptic tap on press. Default true. */
  haptic?: boolean;
}

/**
 * A drop-in replacement for TouchableOpacity that adds a smooth spring
 * scale-down on press plus optional haptic feedback — the standard
 * "tactile" interaction used across the app's cards and buttons.
 */
export default function PressableScale({
  children,
  style,
  scaleTo = 0.96,
  haptic = true,
  onPress,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      {...rest}
      onPress={(e) => {
        if (haptic) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.(e);
      }}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 15, stiffness: 260 });
        opacity.value = withTiming(0.92, { duration: 90 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 260 });
        opacity.value = withTiming(1, { duration: 120 });
      }}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
}
