import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import PressableScale from "../common/PressableScale";

import COLORS from "../../constants/colors";

interface Props {
  item: any;
}

export default function FestivalCard({ item }: Props) {
  return (
    <PressableScale style={styles.card}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={{ borderRadius: 24 }}
      >
        <LinearGradient
          colors={["rgba(11,19,38,0.2)", "rgba(11,19,38,0.85)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.overlay}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.month}</Text>
          </View>

          <View>
            <Text style={styles.title}>{item.name}</Text>

            <Text style={styles.state}>{item.state}</Text>

            <Text style={styles.date}>{item.date}</Text>
          </View>
        </View>
      </ImageBackground>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    height: 200,
    marginRight: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  image: {
    flex: 1,
    justifyContent: "flex-end",
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: COLORS.saffron,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "#0B1326",
    fontWeight: "800",
    fontSize: 12,
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
  },

  state: {
    color: COLORS.subtitle,
    marginTop: 4,
    fontSize: 14,
  },

  date: {
    color: COLORS.saffron,
    marginTop: 6,
    fontWeight: "700",
    fontSize: 13,
  },
});
