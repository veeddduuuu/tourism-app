import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "react-native";

export default function Birds() {
  const x = useSharedValue(350);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(-100, {
        duration: 10000,
      }),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: 210,
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={style}>
      <Text style={{ fontSize: 30 }}>🕊️ 🕊️</Text>
    </Animated.View>
  );
}