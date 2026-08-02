import React from "react";
import { StyleSheet, Text, View } from "react-native";

import PressableScale from "../common/PressableScale";

import COLORS from "../../constants/colors";

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

      <Text style={styles.description} numberOfLines={3}>{item.description}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 20,
    marginRight: 18,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  yearBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255, 153, 51, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 153, 51, 0.35)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  year: {
    color: COLORS.saffron,
    fontWeight: "800",
    fontSize: 14,
  },

  title: {
    color: "white",
    fontSize: 19,
    fontWeight: "800",
    marginTop: 12,
  },

  description: {
    color: COLORS.subtitle,
    marginTop: 8,
    lineHeight: 21,
    fontSize: 13,
  },
});
