import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

export default function GlassCard(props: ViewProps) {
  return <View {...props} style={[styles.container, props.style]} />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    overflow: "hidden",
  },
});
