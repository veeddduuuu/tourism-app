import React from "react";
import { StyleSheet, Text, View } from "react-native";

import PressableScale from "../common/PressableScale";

interface Props {
  item: any;
}

export default function TimelineCard({ item }: Props) {
  return (
    <PressableScale style={styles.card}>
      <View style={styles.yearBadge}>
        <Text style={styles.year}>{item.year}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.description}>{item.description}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: "#18181B",
    borderRadius: 20,
    padding: 20,
    marginRight: 18,
    borderWidth: 1,
    borderColor: "#27272A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  yearBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,107,53,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  year: {
    color: "#FF6B35",
    fontWeight: "700",
    fontSize: 15,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
  },

  description: {
    color: "#A1A1AA",
    marginTop: 10,
    lineHeight: 22,
  },
});
