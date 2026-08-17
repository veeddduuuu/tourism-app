import { Bell } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import THEME from "../../constants/theme";
import { useAppAuth } from "../../providers/authContext";

export default function AppHeader() {
  const { isSignedIn, user } = useAppAuth();
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const name = isSignedIn
    ? user?.firstName || user?.email?.split("@")[0] || "Explorer"
    : "Explore Incredible India";

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.greeting}>{greeting} 👋</Text>

        <Text style={styles.name}>{name}</Text>
      </View>

      <View style={styles.right}>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Bell color="white" size={22} />
          <View style={styles.badge} />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            router.push(
              (isSignedIn ? "/(tabs)/profile" : "/(auth)/login") as any
            )
          }
        >
          <View style={styles.avatarRing}>
            <Image
              source={{
                uri: user?.imageUrl || "https://i.pravatar.cc/100",
              }}
              style={styles.avatar}
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginHorizontal: 20,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: THEME.colors.subtitle,
    fontSize: 14,
  },

  name: {
    color: THEME.colors.white,
    fontWeight: "700",
    fontSize: 26,
    marginTop: 5,
  },

  right: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconButton: {
    marginRight: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  badge: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.colors.primary,
    borderWidth: 1.5,
    borderColor: "#09090B",
  },

  avatarRing: {
    padding: 2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: THEME.colors.primary,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
});
