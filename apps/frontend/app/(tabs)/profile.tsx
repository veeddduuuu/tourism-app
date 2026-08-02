import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { usePassportStore, TITLE_BADGES } from "../../stores/passportStore";

export default function ProfileScreen() {
  const router = useRouter();
  const stamps = usePassportStore((state) => state.stamps);
  const collectedStampIds = usePassportStore((state) => state.collectedStampIds);
  const totalCollected = collectedStampIds.length;
  const activeTitles = TITLE_BADGES.filter((title) =>
    title.condition(totalCollected, stamps, collectedStampIds)
  );
  const currentTitle = activeTitles[activeTitles.length - 1]?.name || "Cultural Novice";
  const currentTitleIcon = activeTitles[activeTitles.length - 1]?.icon || "🎒";

  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={{
          uri: "https://i.pravatar.cc/250",
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>
        Explorer
      </Text>

      <Text style={styles.titleBadgeText}>
        {currentTitleIcon} {currentTitle} • {totalCollected} Stamps
      </Text>

      <Text style={styles.email}>
        explore@tourism.ai
      </Text>

      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.push("/passport" as any)}>
          <Text style={styles.item}>📖 Cultural Passport</Text>
        </TouchableOpacity>
        <Text style={styles.item}>❤️ Saved Places</Text>
        <Text style={styles.item}>🧳 My Trips</Text>
        <Text style={styles.item}>🌎 Language</Text>
        <Text style={styles.item}>🔔 Notifications</Text>
        <Text style={styles.item}>⚙ Settings</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    paddingTop: 40,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  name: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 20,
  },

  titleBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FF9933",
    marginTop: 6,
    backgroundColor: "rgba(255, 153, 51, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },

  email: {
    color: "#666",
    marginBottom: 30,
  },

  card: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
  },

  item: {
    fontSize: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});