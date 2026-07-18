import React, { useEffect, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ChevronUp, ArrowRight } from "lucide-react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
  runOnJS,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const GOLD = "#E8B45C";
const CREAM = "#F6F1E7";
const SERIF = Platform.select({
  ios: "Georgia",
  android: "serif",
  web: "Georgia, 'Times New Roman', serif",
  default: "serif",
});

// Cycling word in the tagline, and rotating location captions.
const WORDS = ["streets", "forests", "temples", "backwaters", "mountains"];
const PLACES = [
  "Munnar tea hills, Kerala",
  "Pink streets of Jaipur",
  "Varanasi ghats at dawn",
  "Palm-lined Goa coast",
];

// Subtle, deterministic firefly field.
const PARTICLES = Array.from({ length: 11 }, (_, i) => ({
  left: (i * 71) % 100,
  size: 2 + (i % 3),
  delay: (i * 520) % 5200,
  duration: 8000 + (i % 4) * 1600,
  drift: (i % 2 ? 1 : -1) * (10 + (i % 4) * 6),
}));

function Firefly({ p, height }: { p: (typeof PARTICLES)[number]; height: number }) {
  const y = useSharedValue(0);
  const o = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(
      p.delay,
      withRepeat(
        withTiming(-height * 1.15, { duration: p.duration, easing: Easing.linear }),
        -1,
        false
      )
    );
    o.value = withDelay(
      p.delay,
      withRepeat(withTiming(1, { duration: p.duration / 2.4 }), -1, true)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: o.value * 0.5,
    transform: [
      { translateY: y.value },
      { translateX: Math.sin(y.value * 0.02) * p.drift },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.firefly,
        { left: `${p.left}%`, width: p.size, height: p.size, borderRadius: p.size },
        style,
      ]}
    />
  );
}

export default function WelcomeScreen() {
  const { width, height } = useWindowDimensions();

  const playerA = useVideoPlayer(require("../assets/videos/india.mp4"), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  const playerB = useVideoPlayer(require("../assets/videos/indiaa.mp4"), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const [wi, setWi] = useState(0);
  const [pi, setPi] = useState(0);

  // Crossfade between the two clips; 0 => clip A, 1 => clip B.
  const mix = useSharedValue(0);
  // Slow cinematic push-in shared by both clips.
  const zoom = useSharedValue(0);
  // CTA breathing + swipe-hint bounce.
  const bounce = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Web blocks autoplay if play() runs before the <video> element is mounted &
  // muted. Re-assert muted + play after mount (and once more shortly after) so
  // both clips actually start rolling instead of freezing on the first frame.
  useEffect(() => {
    const start = () => {
      for (const p of [playerA, playerB]) {
        try {
          p.muted = true;
          p.play();
        } catch {}
      }
    };
    start();
    const t = setTimeout(start, 400);

    // Web fallback: if the browser still blocked autoplay, kick it off on the
    // very first interaction anywhere on the page.
    let cleanupGesture: (() => void) | undefined;
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const onGesture = () => start();
      document.addEventListener("pointerdown", onGesture, { once: true });
      document.addEventListener("keydown", onGesture, { once: true });
      cleanupGesture = () => {
        document.removeEventListener("pointerdown", onGesture);
        document.removeEventListener("keydown", onGesture);
      };
    }

    return () => {
      clearTimeout(t);
      cleanupGesture?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    zoom.value = withRepeat(
      withTiming(1, { duration: 16000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    bounce.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    let showB = false;
    const cross = setInterval(() => {
      showB = !showB;
      mix.value = withTiming(showB ? 1 : 0, {
        duration: 1800,
        easing: Easing.inOut(Easing.ease),
      });
    }, 6000);

    const t1 = setInterval(() => setWi((v) => (v + 1) % WORDS.length), 2300);
    const t2 = setInterval(() => setPi((v) => (v + 1) % PLACES.length), 3000);

    return () => {
      clearInterval(cross);
      clearInterval(t1);
      clearInterval(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    router.replace("/guide-selector" as any);
  };

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(zoom.value, [0, 1], [1.05, 1.15]) }],
  }));
  const clipBStyle = useAnimatedStyle(() => ({ opacity: mix.value }));

  const ctaStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: interpolate(bounce.value, [0, 1], [1, 1.03]) },
    ],
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bounce.value, [0, 1], [4, -5]) }],
    opacity: interpolate(bounce.value, [0, 1], [0.5, 1]),
  }));

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY < 0) translateY.value = e.translationY;
    })
    .onEnd(() => {
      if (translateY.value < -120) runOnJS(goNext)();
      else translateY.value = withSpring(0);
    });
  const tap = Gesture.Tap().onEnd(() => runOnJS(goNext)());
  const gesture = Gesture.Exclusive(pan, tap);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Clip A */}
        <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
          <VideoView
            style={StyleSheet.absoluteFill}
            player={playerA}
            contentFit="cover"
            nativeControls={false}
          />
        </Animated.View>

        {/* Clip B crossfaded on top */}
        <Animated.View style={[StyleSheet.absoluteFill, clipBStyle]}>
          <Animated.View style={[StyleSheet.absoluteFill, zoomStyle]}>
            <VideoView
              style={StyleSheet.absoluteFill}
              player={playerB}
              contentFit="cover"
              nativeControls={false}
            />
          </Animated.View>
        </Animated.View>

        {/* Cinematic grade */}
        <LinearGradient
          colors={["rgba(6,16,31,0.30)", "rgba(6,16,31,0.30)", "rgba(6,16,31,0.97)"]}
          locations={[0, 0.4, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Svg
          width={width}
          height={height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Defs>
            <RadialGradient id="vig" cx="50%" cy="40%" r="75%">
              <Stop offset="0.5" stopColor="#000000" stopOpacity="0" />
              <Stop offset="1" stopColor="#000000" stopOpacity="0.6" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={width} height={height} fill="url(#vig)" />
        </Svg>

        {/* Fireflies */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {PARTICLES.map((p, i) => (
            <Firefly key={i} p={p} height={height} />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Animated.View entering={FadeIn.duration(800)} style={styles.brand}>
            <View style={styles.brandLine} />
            <Text style={styles.brandText}>A A R O H</Text>
            <View style={styles.brandLine} />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700).delay(150)} style={styles.hero}>
            <Text style={styles.kicker}>DISCOVER</Text>
            <Text style={styles.titleTop}>Incredible</Text>
            <Text style={styles.titleMain}>India</Text>

            <View style={styles.taglineRow}>
              <Text style={styles.tagline}>wander through the </Text>
              <Animated.Text
                key={WORDS[wi]}
                entering={FadeInDown.duration(450)}
                style={styles.taglineWord}
              >
                {WORDS[wi]}
              </Animated.Text>
            </View>
          </Animated.View>

          {/* Premium glass CTA */}
          <GestureDetector gesture={gesture}>
            <Animated.View style={[styles.ctaWrap, ctaStyle]}>
              <Animated.View style={[styles.swipeHint, chevronStyle]}>
                <ChevronUp color={GOLD} size={26} />
              </Animated.View>

              <Animated.Text
                key={PLACES[pi]}
                entering={FadeIn.duration(600)}
                style={styles.place}
              >
                ✦ {PLACES[pi]}
              </Animated.Text>

              <View style={styles.glass}>
                <LinearGradient
                  colors={["#F2C879", GOLD, "#C98F3C"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.pill}
                >
                  <Text style={styles.pillText}>Begin the Journey</Text>
                  <ArrowRight color="#3A2708" size={20} />
                </LinearGradient>
                <Text style={styles.hint}>Swipe up or tap to enter</Text>
              </View>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#06101F" },

  firefly: {
    position: "absolute",
    bottom: -10,
    backgroundColor: "#FFE3B0",
    shadowColor: "#FFCF87",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
  },

  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 46,
    paddingHorizontal: 26,
  },

  brand: { flexDirection: "row", alignItems: "center", gap: 12 },
  brandLine: { width: 26, height: 1, backgroundColor: "rgba(232,180,92,0.6)" },
  brandText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 6,
  },

  hero: { alignItems: "center" },
  kicker: {
    color: "rgba(246,241,231,0.7)",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 8,
    marginBottom: 10,
  },
  titleTop: {
    color: CREAM,
    fontSize: 34,
    fontWeight: "300",
    letterSpacing: 1,
    fontFamily: SERIF,
    lineHeight: 40,
  },
  titleMain: {
    color: GOLD,
    fontSize: 76,
    fontFamily: SERIF,
    lineHeight: 82,
    marginTop: -2,
  },
  taglineRow: { flexDirection: "row", alignItems: "baseline", marginTop: 18 },
  tagline: { color: "rgba(246,241,231,0.75)", fontSize: 17, letterSpacing: 0.3 },
  taglineWord: {
    color: CREAM,
    fontSize: 17,
    fontWeight: "700",
    fontStyle: "italic",
  },

  ctaWrap: { alignItems: "center", alignSelf: "stretch" },
  swipeHint: { marginBottom: 6 },
  place: {
    color: "rgba(246,241,231,0.8)",
    fontSize: 14,
    letterSpacing: 0.5,
    marginBottom: 18,
  },
  glass: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(246,241,231,0.16)",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    alignSelf: "stretch",
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  pillText: { color: "#3A2708", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
  hint: {
    color: "rgba(246,241,231,0.55)",
    marginTop: 14,
    fontSize: 13,
    letterSpacing: 0.4,
  },
});
