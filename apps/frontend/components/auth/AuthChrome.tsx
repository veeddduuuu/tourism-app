import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

const GOLD = "#E8B45C";
const CREAM = "#F6F1E7";

export default function AuthChrome({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0B1A2E", "#06101F", "#04080F"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brand}>
              <View style={styles.brandLine} />
              <Text style={styles.brandText}>A A R O H</Text>
              <View style={styles.brandLine} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#06101F" },
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 26,
    paddingTop: 36,
    paddingBottom: 32,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },
  brandLine: { width: 26, height: 1, backgroundColor: "rgba(232,180,92,0.6)" },
  brandText: {
    color: GOLD,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 6,
  },
  title: {
    color: CREAM,
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    color: "rgba(246,241,231,0.7)",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 28,
  },
});
