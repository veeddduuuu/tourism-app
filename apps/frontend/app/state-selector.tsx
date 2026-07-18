import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Pause, Play, Music2 } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import IndiaMap from "../components/map/IndiaMap";
import StateShape from "../components/map/StateShape";
import PressableScale from "../components/common/PressableScale";
import GuideAvatar from "../components/guide/GuideAvatar";
import { INDIA_STATES } from "../constants/indiaMap";
import { useAppStore } from "../stores/appStore";

// Folk-song tracks per state. Drop an mp3 into assets/audio and map it here to
// enable playback for that state. Only Maharashtra ships with audio for now.
const AUDIO_TRACKS: Record<string, number> = {
  Maharashtra: require("../assets/audio/maharashtra.mp3"),
};

const GREETINGS: Record<string, string> = {
  Kerala: "🌴 Namaskaram!",
  Goa: "🏖️ Welcome to the coast!",
  Karnataka: "🌸 Namaskara!",
  "Tamil Nadu": "🙏 Vanakkam!",
  Gujarat: "🙏 Kem Cho!",
  Rajasthan: "🐪 Khamma Ghani!",
  Maharashtra: "🙏 Namaskar!",
  Delhi: "❤️ Dilli welcomes you!",
  Assam: "🌿 Nomoskar!",
  Punjab: "🪯 Sat Sri Akal!",
  "Jammu & Kashmir": "🏔️ Aadab!",
  "Madhya Pradesh": "🙏 Namaste!",
  "Uttar Pradesh": "🙏 Namaste!",
  Telangana: "🙏 Namaskaram!",
  "Andhra Pradesh": "🙏 Namaskaram!",
  Odisha: "🙏 Namaskar!",
  "West Bengal": "🙏 Nomoshkar!",
  Bihar: "🙏 Pranam!",
  Uttarakhand: "🏔️ Namaste!",
  "Himachal Pradesh": "⛰️ Namaste!",
  Jharkhand: "🙏 Johar!",
  Chhattisgarh: "🙏 Namaskar!",
  Haryana: "🙏 Ram Ram!",
  Sikkim: "🏔️ Khamri!",
  Nagaland: "🌄 Kuknalim!",
  Manipur: "🙏 Khurumjari!",
  Meghalaya: "☁️ Khublei!",
  Tripura: "🙏 Nomoskar!",
  Mizoram: "⛰️ Chibai!",
  "Arunachal Pradesh": "🌄 Namaste!",
};

export default function StateSelector() {
  const { width } = useWindowDimensions();
  const guide = useAppStore((s: any) => s.guide);
  const setDestinationState = useAppStore((s: any) => s.setDestinationState);
  const guideName = guide?.name ?? "Aarohi";
  const [selected, setSelected] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const selectedShape = useMemo(
    () => INDIA_STATES.find((s) => s.name === selected) ?? null,
    [selected]
  );
  const hasTrack = selected ? Boolean(AUDIO_TRACKS[selected]) : false;
  const shapeSize = Math.min(width * 0.74, 320);

  async function stopFolk() {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
    setIsPlaying(false);
  }

  async function playFolk(state: string) {
    await stopFolk();
    const src = AUDIO_TRACKS[state];
    if (!src) return;
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(src, {
        shouldPlay: true,
        isLooping: true,
      });
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.log("folk audio error:", err);
      setIsPlaying(false);
    }
  }

  async function togglePlay() {
    const sound = soundRef.current;
    if (!sound) {
      if (selected) playFolk(selected);
      return;
    }
    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }

  useEffect(() => {
    return () => {
      stopFolk();
    };
  }, []);

  const handleSelect = (name: string) => {
    Haptics.selectionAsync().catch(() => {});
    setSelected(name);
    // Persist the choice globally so any screen can read the destination state.
    setDestinationState(name);
    playFolk(name);
  };

  const handleChange = () => {
    stopFolk();
    setSelected(null);
  };

  return (
    <LinearGradient colors={["#04122A", "#0A2E5C", "#123E78"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        {!selected ? (
          /* ---------- SELECTION VIEW: chatbot + interactive map ---------- */
          <Animated.View key="picker" style={styles.fill} entering={FadeIn.duration(300)}>
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.kicker}>PLAN YOUR JOURNEY</Text>

              <Animated.View
                entering={FadeInDown.springify().damping(16)}
                style={styles.botRow}
              >
                <View style={styles.avatar}>
                  <GuideAvatar
                    id={guide?.id}
                    gender={guide?.gender ?? "female"}
                    age={guide?.ageGroup ?? "adult"}
                    color={guide?.color ?? "#FF6B35"}
                    size={38}
                    background={false}
                  />
                </View>
                <View style={[styles.bubble, styles.botBubble]}>
                  <Text style={styles.botText}>
                    🙏 Namaste! I'm {guideName}, your travel guide. Which state are
                    you visiting? Tap it on the map below 👇
                  </Text>
                </View>
              </Animated.View>

              <View style={styles.mapWrap}>
                <IndiaMap selected={selected} onSelect={handleSelect} />
              </View>

              <Animated.Text entering={FadeIn.delay(200)} style={styles.hint}>
                👆 Tap any state to select it
              </Animated.Text>

              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        ) : (
          /* ---------- FULLSCREEN STATE VIEW: only the glowing state ---------- */
          <Animated.View key="state" style={styles.fill} entering={FadeIn.duration(350)}>
            <ScrollView
              contentContainerStyle={styles.stateContent}
              showsVerticalScrollIndicator={false}
            >
              <Animated.Text entering={FadeInDown} style={styles.kicker}>
                YOUR DESTINATION
              </Animated.Text>

              {selectedShape && (
                <StateShape
                  key={selected}
                  name={selected}
                  d={selectedShape.d}
                  bbox={selectedShape.bbox}
                  size={shapeSize}
                />
              )}

              <Animated.Text entering={FadeInUp.delay(150)} style={styles.stateName}>
                {selected}
              </Animated.Text>
              <Animated.Text entering={FadeInUp.delay(220)} style={styles.greeting}>
                {GREETINGS[selected] ?? "🙏 Welcome!"}
              </Animated.Text>

              {/* Folk-song player */}
              <Animated.View entering={FadeInUp.delay(300)} style={styles.playerWrap}>
                <PressableScale
                  style={styles.player}
                  haptic={false}
                  onPress={togglePlay}
                  disabled={!hasTrack}
                >
                  <View style={[styles.playIcon, !hasTrack && styles.playIconMuted]}>
                    {hasTrack && isPlaying ? (
                      <Pause color="#04122A" size={18} fill="#04122A" />
                    ) : (
                      <Play color="#04122A" size={18} fill="#04122A" />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.playerTitle}>
                      {hasTrack ? `${selected} folk tune` : "Folk tune coming soon"}
                    </Text>
                    <Text style={styles.playerSub}>
                      {hasTrack
                        ? isPlaying
                          ? "Now playing • tap to pause"
                          : "Tap to play"
                        : `No track for ${selected} yet`}
                    </Text>
                  </View>
                  <Music2 color={hasTrack ? "#FFB703" : "#5C7CA6"} size={20} />
                </PressableScale>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(380)} style={styles.actions}>
                <PressableScale
                  style={styles.secondaryBtn}
                  haptic={false}
                  onPress={handleChange}
                >
                  <Text style={styles.secondaryText}>← Change</Text>
                </PressableScale>

                <PressableScale
                  style={styles.primaryBtn}
                  onPress={() => {
                    stopFolk();
                    setDestinationState(selected);
                    router.replace("/trip-preferences" as any);
                  }}
                >
                  <Text style={styles.primaryText}>Explore {selected} →</Text>
                </PressableScale>
              </Animated.View>
            </ScrollView>
          </Animated.View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 24 },
  stateContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  kicker: {
    color: "#7FB0E8",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 8,
    marginBottom: 14,
    textAlign: "center",
  },

  botRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: 10 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  avatarText: { fontSize: 18 },
  bubble: { maxWidth: "82%", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  botBubble: {
    backgroundColor: "rgba(255,255,255,0.10)",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  botText: { color: "#EAF3FF", fontSize: 15, lineHeight: 21 },

  mapWrap: { alignItems: "center", marginTop: 8 },
  hint: { color: "#9EC3EC", textAlign: "center", marginTop: 12, fontSize: 14 },

  stateName: {
    color: "white",
    fontSize: 40,
    fontWeight: "800",
    marginTop: 18,
    textAlign: "center",
  },
  greeting: { color: "#DCEEFF", fontSize: 20, marginTop: 10, textAlign: "center" },

  playerWrap: { alignSelf: "stretch", marginTop: 26 },
  player: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    gap: 12,
  },
  playIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFB703",
    justifyContent: "center",
    alignItems: "center",
  },
  playIconMuted: { backgroundColor: "#5C7CA6" },
  playerTitle: { color: "white", fontWeight: "700", fontSize: 15 },
  playerSub: { color: "#9EC3EC", fontSize: 12, marginTop: 2 },

  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    gap: 12,
    alignSelf: "stretch",
  },
  secondaryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  secondaryText: { color: "#DCEEFF", fontWeight: "700", fontSize: 15 },
  primaryBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: "#FF6B35",
  },
  primaryText: { color: "white", fontWeight: "800", fontSize: 15 },
});
