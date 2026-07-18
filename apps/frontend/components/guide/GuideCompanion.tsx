import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";

import PressableScale from "../common/PressableScale";
import GuideAvatar from "./GuideAvatar";
import { useAppStore, Guide } from "../../stores/appStore";

/**
 * Floating guide companion shown on top of a screen. Reads the guide chosen on
 * the guide-selector page and offers contextual tips. Pass screen-specific
 * `tips` to override the guide's default tips.
 */
export default function GuideCompanion({ tips }: { tips?: string[] }) {
  const guide = useAppStore((s: any) => s.guide) as Guide | null;
  const [open, setOpen] = useState(true);
  const [idx, setIdx] = useState(-1); // -1 => greeting, then cycles tips

  if (!guide) return null;

  const list = tips && tips.length ? tips : guide.tips;
  const message = idx < 0 ? guide.greeting : list[idx % list.length];

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      {open && (
        <Animated.View
          entering={FadeInDown.springify().damping(16)}
          exiting={FadeOutDown.duration(150)}
          style={[styles.bubble, { borderColor: guide.color }]}
        >
          <Text style={[styles.name, { color: guide.color }]}>
            {guide.name} · {guide.role}
          </Text>
          <Text style={styles.msg}>{message}</Text>
          <PressableScale haptic={false} onPress={() => setIdx((i) => i + 1)}>
            <Text style={[styles.more, { color: guide.color }]}>Next tip →</Text>
          </PressableScale>
        </Animated.View>
      )}

      <PressableScale
        style={[styles.fab, { borderColor: guide.color }]}
        onPress={() => setOpen((o) => !o)}
      >
        <GuideAvatar
          id={guide.id}
          gender={guide.gender}
          age={guide.ageGroup}
          color={guide.color}
          size={52}
          background={false}
        />
        <View style={[styles.totem, { backgroundColor: guide.color }]}>
          <Text style={styles.totemText}>{guide.totem}</Text>
        </View>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    right: 16,
    bottom: 96,
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: 250,
    backgroundColor: "rgba(20,24,32,0.94)",
    borderRadius: 18,
    borderBottomRightRadius: 4,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
  },
  name: { fontSize: 12, fontWeight: "800", letterSpacing: 0.3, marginBottom: 5 },
  msg: { color: "#EDF2F8", fontSize: 14, lineHeight: 20 },
  more: { fontSize: 12, fontWeight: "700", marginTop: 10, textAlign: "right" },

  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "rgba(20,24,32,0.94)",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  avatar: { fontSize: 30 },
  totem: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0A0A0A",
  },
  totemText: { fontSize: 11 },
});
