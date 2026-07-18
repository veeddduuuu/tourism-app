import React from "react";
import { StyleSheet, Text, View } from "react-native";

import PressableScale from "../common/PressableScale";

export default function FeatureCard({ title, subtitle, Icon, color, onPress }: any) {
  return (
    <PressableScale style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + "22" }]}>
        <Icon color={color} size={24} />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.subtitle}>{subtitle}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#18181B",
    borderRadius: 20,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#27272A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  subtitle: {
    color: "#A1A1AA",
    marginTop: 6,
    fontSize: 13,
  },
});
