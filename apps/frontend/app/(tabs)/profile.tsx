import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PressableScale from "../../components/common/PressableScale";
import { useAppAuth } from "../../providers/authContext";
import { isClerkConfigured } from "../../lib/clerk";

function displayName(first: string | null, last: string | null, email: string | null) {
  const name = [first, last].filter(Boolean).join(" ").trim();
  if (name) return name;
  if (email) return email.split("@")[0];
  return "Explorer";
}

export default function ProfileScreen() {
  const { isLoaded, isSignedIn, user, signOut } = useAppAuth();

  const name = displayName(
    user?.firstName ?? null,
    user?.lastName ?? null,
    user?.email ?? null
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Image
          source={{
            uri: user?.imageUrl || "https://i.pravatar.cc/250",
          }}
          style={styles.avatar}
        />

        <Text style={styles.name}>{isSignedIn ? name : "Guest explorer"}</Text>
        <Text style={styles.email}>
          {isSignedIn
            ? user?.email ?? "Signed in"
            : isClerkConfigured
              ? "Sign in to save trip plans"
              : "Clerk keys are not configured"}
        </Text>

        <View style={styles.card}>
          {isSignedIn ? (
            <>
              <PressableScale
                onPress={() => router.push("/trips" as any)}
                style={styles.itemPress}
              >
                <Text style={styles.item}>🧳 My trips</Text>
              </PressableScale>
              <PressableScale
                onPress={() => signOut()}
                style={styles.itemPress}
              >
                <Text style={[styles.item, styles.last, styles.signOut]}>
                  Sign out
                </Text>
              </PressableScale>
            </>
          ) : (
            <>
              <PressableScale
                onPress={() => router.push("/(auth)/login" as any)}
                style={styles.itemPress}
              >
                <Text style={styles.item}>Sign in</Text>
              </PressableScale>
              <PressableScale
                onPress={() => router.push("/(auth)/register" as any)}
                style={styles.itemPress}
              >
                <Text style={[styles.item, styles.last]}>Create account</Text>
              </PressableScale>
            </>
          )}
        </View>

        {!isLoaded ? (
          <Text style={styles.meta}>Restoring session…</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
  },
  scroll: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#E8B45C",
  },
  name: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 20,
    color: "#F8FAFC",
  },
  email: {
    color: "#A1A1AA",
    marginBottom: 30,
    marginTop: 6,
  },
  card: {
    width: "90%",
    backgroundColor: "#18181B",
    borderRadius: 22,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  itemPress: {
    width: "100%",
  },
  item: {
    fontSize: 18,
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: "#27272A",
    color: "#F8FAFC",
  },
  last: {
    borderBottomWidth: 0,
  },
  signOut: {
    color: "#FCA5A5",
  },
  meta: {
    marginTop: 16,
    color: "#71717A",
  },
});
