import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronUp } from "lucide-react-native";

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

export default function WelcomeScreen() {
  const player = useVideoPlayer(
    require("../assets/videos/india.mp4"),
    (player) => {
      player.loop = true;
      player.muted = true;
      player.play();
    }
  );

  const translateY = useSharedValue(0);

  const goNext = () => {
    router.replace("/state-selector");
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const pan = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (translateY.value < -140) {
        runOnJS(goNext)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <VideoView
          style={StyleSheet.absoluteFill}
          player={player}
          contentFit="cover"
        />

        <LinearGradient
          colors={[
            "rgba(0,0,0,0.10)",
            "rgba(0,0,0,0.45)",
            "rgba(0,0,0,0.90)",
          ]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.content}>
          <View style={styles.top}>
            <Text style={styles.title}>
              Explore{"\n"}Incredible India 🇮🇳
            </Text>

            <Text style={styles.subtitle}>
              Discover breathtaking destinations,{"\n"}
              delicious cuisine, vibrant festivals{"\n"}
              and unforgettable experiences.
            </Text>
          </View>

          <GestureDetector gesture={pan}>
            <Animated.View style={[styles.bottom, animatedStyle]}>
              <View style={styles.circle}>
                <ChevronUp color="white" size={30} />
                <ChevronUp
                  color="white"
                  size={30}
                  style={{ marginTop: -18 }}
                />

                <Text style={styles.buttonText}>
                  Explore India
                </Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 110,
    paddingBottom: 55,
  },

  top: {
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 46,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 54,
  },

  subtitle: {
    color: "#E5E5E5",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 28,
  },

  bottom: {
    alignItems: "center",
  },

  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 20,
    marginTop: 10,
  },
});