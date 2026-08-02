import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Lock,
  Sparkles,
  RotateCcw,
  BookOpen,
  Award,
} from "lucide-react-native";
import COLORS from "../constants/colors";
import {
  usePassportStore,
  TITLE_BADGES,
  Stamp,
  StampCategory,
} from "../stores/passportStore";

const { width } = Dimensions.get("window");

export default function PassportScreen() {
  const router = useRouter();
  const stamps = usePassportStore((state) => state.stamps);
  const collectedStampIds = usePassportStore((state) => state.collectedStampIds);
  const collectStamp = usePassportStore((state) => state.collectStamp);
  const resetStamps = usePassportStore((state) => state.resetStamps);

  const [activeCategory, setActiveCategory] = useState<StampCategory>("states");
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);

  // Calculate current active titles
  const totalCollected = collectedStampIds.length;
  const activeTitles = TITLE_BADGES.filter((title) =>
    title.condition(totalCollected, stamps, collectedStampIds)
  );
  // Highest unlocked title
  const currentTitle = activeTitles[activeTitles.length - 1]?.name || "Cultural Novice";
  const currentTitleIcon = activeTitles[activeTitles.length - 1]?.icon || "🎒";

  const categories: { key: StampCategory; label: string; icon: string }[] = [
    { key: "states", label: "States", icon: "📍" },
    { key: "languages", label: "Languages", icon: "🗣️" },
    { key: "foods", label: "Foods", icon: "🍲" },
    { key: "festivals", label: "Festivals", icon: "🪔" },
    { key: "unesco", label: "UNESCO", icon: "🏛️" },
    { key: "handicrafts", label: "Crafts", icon: "🧣" },
  ];

  const handleCollectStamp = (id: string) => {
    collectStamp(id);
    // Find the stamp to update the modal view state
    const updated = stamps.find((s) => s.id === id);
    if (updated) {
      setSelectedStamp({ ...updated, collectedDate: new Date().toLocaleDateString() });
    }
  };

  const handleReset = () => {
    Alert.alert(
      "Reset Passport",
      "Are you sure you want to clear your stamp book?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            resetStamps();
            Alert.alert("Success", "Passport reset completed.");
          },
        },
      ]
    );
  };

  const filteredStamps = stamps.filter((s) => s.category === activeCategory);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, "#131F37", "#0B1326"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cultural Passport</Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <RotateCcw color={COLORS.subtitle} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Passport Cover / Identity Card */}
          <LinearGradient
            colors={["#800000", "#4A0000"]} // Deep Maroon Passport color
            style={styles.passportCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.passportPattern}>
              <View style={styles.passportHeader}>
                <Text style={styles.passportSub}>REPUBLIC OF INDIA</Text>
                <Text style={styles.passportMain}>CULTURAL PASSPORT</Text>
              </View>

              <View style={styles.passportEmblemContainer}>
                <Text style={styles.emblemText}>🇮🇳</Text>
              </View>

              <View style={styles.passportFooter}>
                <View>
                  <Text style={styles.passportLabel}>HOLDER TITLE</Text>
                  <Text style={styles.passportValue}>{currentTitleIcon} {currentTitle}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.passportLabel}>STAMPS RECORDED</Text>
                  <Text style={styles.passportValue}>{totalCollected} / {stamps.length}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Badges Achievements Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Award color={COLORS.saffron} size={20} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Achievement Badges</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeScrollView}>
              {TITLE_BADGES.map((badge) => {
                const isUnlocked = badge.condition(totalCollected, stamps, collectedStampIds);
                return (
                  <TouchableOpacity
                    key={badge.id}
                    style={[styles.badgeCard, !isUnlocked && styles.badgeCardLocked]}
                    onPress={() =>
                      Alert.alert(
                        badge.name,
                        `${badge.description}\n\nStatus: ${
                          isUnlocked ? "🎉 Unlocked!" : "🔒 Locked"
                        }`
                      )
                    }
                  >
                    <View style={[styles.badgeIconBg, !isUnlocked && styles.badgeIconBgLocked]}>
                      <Text style={[styles.badgeIcon, !isUnlocked && styles.badgeIconLocked]}>
                        {badge.icon}
                      </Text>
                    </View>
                    <Text style={styles.badgeName} numberOfLines={1}>
                      {badge.name}
                    </Text>
                    <Text style={styles.badgeStatus}>
                      {isUnlocked ? "Unlocked" : "Locked"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {categories.map((cat) => {
              const active = activeCategory === cat.key;
              const count = stamps.filter(
                (s) => s.category === cat.key && collectedStampIds.includes(s.id)
              ).length;
              return (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.tab, active && styles.activeTab]}
                  onPress={() => setActiveCategory(cat.key)}
                >
                  <Text style={styles.tabIcon}>{cat.icon}</Text>
                  <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                    {cat.label}
                  </Text>
                  <View style={[styles.tabCount, active && styles.activeTabCount]}>
                    <Text style={styles.tabCountText}>{count}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Stamp Grid */}
          <View style={styles.gridContainer}>
            {filteredStamps.map((stamp) => {
              const isCollected = collectedStampIds.includes(stamp.id);
              return (
                <TouchableOpacity
                  key={stamp.id}
                  style={[styles.stampWrapper, isCollected ? styles.stampCollected : styles.stampLocked]}
                  onPress={() => setSelectedStamp(stamp)}
                >
                  {isCollected ? (
                    <LinearGradient
                      colors={["rgba(255, 153, 51, 0.15)", "rgba(245, 158, 11, 0.05)"]}
                      style={styles.stampInner}
                    >
                      <View style={styles.stampCircle}>
                        <Text style={styles.stampEmoji}>{stamp.emoji}</Text>
                      </View>
                      <Text style={styles.stampName}>{stamp.name}</Text>
                      <View style={styles.collectedTag}>
                        <Text style={styles.collectedTagText}>PASSED</Text>
                      </View>
                    </LinearGradient>
                  ) : (
                    <View style={styles.stampInner}>
                      <View style={styles.stampCircleLocked}>
                        <Lock color={COLORS.muted} size={18} />
                      </View>
                      <Text style={styles.stampNameLocked}>{stamp.name}</Text>
                      <Text style={styles.hintText}>{stamp.state}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Details Modal */}
        {selectedStamp && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setSelectedStamp(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={["#1E293B", "#0F172A"]}
                  style={styles.modalInner}
                >
                  {/* Decorative stamp frame */}
                  <View style={styles.stampFrame}>
                    <Text style={styles.modalEmoji}>{selectedStamp.emoji}</Text>
                  </View>

                  <Text style={styles.modalName}>{selectedStamp.name}</Text>
                  <Text style={styles.modalState}>Origin: {selectedStamp.state}</Text>

                  <View style={styles.divider} />

                  <Text style={styles.modalDescription}>
                    {selectedStamp.description}
                  </Text>

                  <View style={styles.hintContainer}>
                    <Text style={styles.hintTitle}>How to Collect:</Text>
                    <Text style={styles.hintDetail}>{selectedStamp.hint}</Text>
                  </View>

                  {collectedStampIds.includes(selectedStamp.id) ? (
                    <View style={styles.unlockedBanner}>
                      <Sparkles color="#22C55E" size={16} style={{ marginRight: 6 }} />
                      <Text style={styles.unlockedText}>
                        Collected on {stamps.find(s => s.id === selectedStamp.id)?.collectedDate || "Aug 2, 2026"}
                      </Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.collectButton}
                      onPress={() => handleCollectStamp(selectedStamp.id)}
                    >
                      <LinearGradient
                        colors={[COLORS.saffron, COLORS.marigold]}
                        style={styles.collectButtonGrad}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      >
                        <Text style={styles.collectButtonText}>Stamp Passport</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setSelectedStamp(null)}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1326",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
  },
  resetButton: {
    padding: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  passportCard: {
    margin: 20,
    borderRadius: 16,
    height: 220,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1.5,
    borderColor: "#EAB308", // Golden outline for passport
  },
  passportPattern: {
    flex: 1,
    padding: 24,
    justifyContent: "space-between",
  },
  passportHeader: {
    alignItems: "center",
  },
  passportSub: {
    fontSize: 10,
    color: "#FCD34D",
    letterSpacing: 2,
    fontWeight: "600",
  },
  passportMain: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 4,
  },
  passportEmblemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emblemText: {
    fontSize: 54,
  },
  passportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  passportLabel: {
    fontSize: 8,
    color: "#FCD34D",
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 4,
  },
  passportValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  sectionContainer: {
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
  },
  badgeScrollView: {
    paddingBottom: 8,
  },
  badgeCard: {
    width: 100,
    backgroundColor: "#131F37",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 153, 51, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeIconBgLocked: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeIconLocked: {
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  badgeStatus: {
    fontSize: 9,
    color: COLORS.saffron,
    fontWeight: "600",
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131F37",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  activeTab: {
    backgroundColor: COLORS.saffron,
  },
  tabIcon: {
    marginRight: 6,
    fontSize: 14,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.subtitle,
  },
  activeTabLabel: {
    color: "#000",
  },
  tabCount: {
    marginLeft: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  activeTabCount: {
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  tabCountText: {
    fontSize: 9,
    fontWeight: "800",
    color: COLORS.text,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  stampWrapper: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
  },
  stampCollected: {
    borderWidth: 2,
    borderColor: COLORS.saffron,
  },
  stampLocked: {
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(19, 31, 55, 0.3)",
  },
  stampInner: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stampCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 153, 51, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  stampCircleLocked: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  stampEmoji: {
    fontSize: 32,
  },
  stampName: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 4,
  },
  stampNameLocked: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.muted,
    textAlign: "center",
    marginBottom: 4,
  },
  collectedTag: {
    backgroundColor: COLORS.saffron,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  collectedTagText: {
    fontSize: 8,
    fontWeight: "900",
    color: "#000",
  },
  hintText: {
    fontSize: 10,
    color: COLORS.muted,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.85,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.saffron,
  },
  modalInner: {
    padding: 24,
    alignItems: "center",
  },
  stampFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.saffron,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "rgba(255,153,51,0.05)",
  },
  modalEmoji: {
    fontSize: 48,
  },
  modalName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
  },
  modalState: {
    fontSize: 12,
    color: COLORS.saffron,
    fontWeight: "600",
    marginTop: 4,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 16,
  },
  modalDescription: {
    fontSize: 14,
    color: COLORS.subtitle,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
  },
  hintContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  hintTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  hintDetail: {
    fontSize: 12,
    color: COLORS.subtitle,
    lineHeight: 16,
  },
  collectButton: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
  },
  collectButtonGrad: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  collectButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#000",
  },
  unlockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    width: "100%",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)",
  },
  unlockedText: {
    fontSize: 13,
    color: "#22C55E",
    fontWeight: "700",
  },
  closeButton: {
    paddingVertical: 10,
  },
  closeButtonText: {
    fontSize: 14,
    color: COLORS.subtitle,
    fontWeight: "600",
  },
});
