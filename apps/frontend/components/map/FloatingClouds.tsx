import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Text } from "react-native";

export default function Clouds() {
  const x = useSharedValue(-150);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(400, {
        duration: 15000,
      }),
      -1,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: 120,
    transform: [{ translateX: x.value }],
  }));

  return (
    <Animated.View style={style}>
      <Text style={{ fontSize: 50 }}>☁️ ☁️ ☁️</Text>
    </Animated.View>
  );
}