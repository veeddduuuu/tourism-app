import React from "react";
import { ImageBackground, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import PressableScale from "../common/PressableScale";

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
          colors={["rgba(0,0,0,0.1)", "rgba(0,0,0,0.65)"]}
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
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
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
    backgroundColor: "#FF6B35",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "white",
    fontWeight: "700",
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
  },

  state: {
    color: "#E4E4E7",
    marginTop: 5,
    fontSize: 15,
  },

  date: {
    color: "white",
    marginTop: 8,
    fontWeight: "700",
  },
});
