import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { STATS } from "../../constants/homeData";
import THEME from "../../constants/theme";

export default function StatsGrid() {
  return (
    <View style={styles.container}>
      {STATS.map((item) => (
        <View key={item.id} style={styles.card}>
          <View
            style={[
              styles.circle,
              {
                backgroundColor: item.color + "22",
              },
            ]}
          />

          <Text
            style={[
              styles.number,
              {
                color: item.color,
              },
            ]}
          >
            {item.number}
          </Text>

          <Text style={styles.title}>{item.title}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,

    marginTop: 25,

    flexDirection: "row",

    flexWrap: "wrap",

    justifyContent: "space-between",
  },

  card: {
    width: "48%",

    backgroundColor: "#18181B",

    borderRadius: 22,

    paddingVertical: 25,

    alignItems: "center",

    marginBottom: 15,

    borderWidth: 1,

    borderColor: "#27272A",

    shadowColor: "#000",

    shadowOffset: { width: 0, height: 8 },

    shadowOpacity: 0.25,

    shadowRadius: 12,

    elevation: 6,
  },

  circle: {
    width: 46,

    height: 46,

    borderRadius: 23,

    marginBottom: 14,
  },

  number: {
    fontSize: 28,

    fontWeight: "800",
  },

  title: {
    color: THEME.colors.subtitle,

    marginTop: 8,

    fontSize: 14,
  },
});
