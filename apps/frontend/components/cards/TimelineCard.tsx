import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface Props {
  item: any;
}

export default function TimelineCard({ item }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Text style={styles.year}>{item.year}</Text>

      <Text style={styles.title}>{item.title}</Text>

      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
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
  },

  year: {
    color: "#FF6B35",
    fontWeight: "700",
    fontSize: 16,
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
