import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { BookOpen, Sparkles, ChevronRight } from "lucide-react-native";
import COLORS from "../../constants/colors";
import { usePassportStore, TITLE_BADGES } from "../../stores/passportStore";

export default function PassportWidget() {
  const router = useRouter();
  const stamps = usePassportStore((state) => state.stamps);
  const collectedStampIds = usePassportStore((state) => state.collectedStampIds);
  
  const totalCollected = collectedStampIds.length;
  const totalStamps = stamps.length;
  const progressPercent = totalStamps > 0 ? (totalCollected / totalStamps) * 100 : 0;

  // Calculate current active title
  const activeTitles = TITLE_BADGES.filter((title) =>
    title.condition(totalCollected, stamps, collectedStampIds)
  );
  const currentTitle = activeTitles[activeTitles.length - 1]?.name || "Cultural Novice";
  const currentTitleIcon = activeTitles[activeTitles.length - 1]?.icon || "🎒";

  // Last 4 collected stamps
  const collectedStamps = stamps.filter(s => collectedStampIds.includes(s.id));
  const recentStamps = collectedStamps.slice(-4);

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => router.push("/passport" as any)}>
        <LinearGradient
          colors={["rgba(30, 41, 59, 0.8)", "rgba(15, 23, 42, 0.9)"]}
          style={styles.card}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <BookOpen color={COLORS.saffron} size={20} style={styles.icon} />
              <View>
                <Text style={styles.label}>CULTURAL PASSPORT</Text>
                <Text style={styles.title}>
                  {currentTitleIcon} {currentTitle}
                </Text>
              </View>
            </View>
            <View style={styles.arrowBg}>
              <ChevronRight color={COLORS.text} size={18} />
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Stamps Collected</Text>
              <Text style={styles.progressValue}>
                {totalCollected} / {totalStamps}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <LinearGradient
                colors={[COLORS.saffron, COLORS.marigold]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
              />
            </View>
          </View>

          {/* Recent stamps collected */}
          {recentStamps.length > 0 && (
            <View style={styles.footer}>
              <Text style={styles.footerLabel}>Recently Collected:</Text>
              <View style={styles.stampList}>
                {recentStamps.map((stamp) => (
                  <View key={stamp.id} style={styles.miniStamp}>
                    <Text style={styles.miniStampEmoji}>{stamp.emoji}</Text>
                  </View>
                ))}
                {totalCollected > 4 && (
                  <View style={styles.plusMore}>
                    <Text style={styles.plusText}>+{totalCollected - 4}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.subtitle,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  arrowBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.subtitle,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 12,
  },
  footerLabel: {
    fontSize: 11,
    color: COLORS.muted,
    fontWeight: "500",
  },
  stampList: {
    flexDirection: "row",
    alignItems: "center",
  },
  miniStamp: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 153, 51, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 153, 51, 0.2)",
  },
  miniStampEmoji: {
    fontSize: 14,
  },
  plusMore: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  plusText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.text,
  },
});
