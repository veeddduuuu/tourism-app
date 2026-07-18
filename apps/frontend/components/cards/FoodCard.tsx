import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Clock3, Heart, Star } from "lucide-react-native";

import COLORS from "../../constants/colors";
import PressableScale from "../common/PressableScale";

interface Props {
  item: any;
}

export default function FoodCard({ item }: Props) {
  return (
    <PressableScale style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <TouchableOpacity style={styles.heart} activeOpacity={0.8}>
          <Heart color="white" size={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.ratingRow}>
          <Text style={styles.title}>{item.title}</Text>

          <View style={styles.rating}>
            <Star fill="#FFD43B" color="#FFD43B" size={14} />

            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.state}>{item.state}</Text>

        <View style={styles.bottom}>
          <View style={styles.time}>
            <Clock3 color={COLORS.primary} size={14} />

            <Text style={styles.timeText}>{item.duration}</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.difficulty}</Text>
          </View>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    marginRight: 18,
    backgroundColor: "#18181B",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#27272A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },

  imageWrap: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 180,
  },

  heart: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 15,
  },

  title: {
    color: "white",
    fontWeight: "700",
    fontSize: 18,
    flex: 1,
  },

  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rating: {
    flexDirection: "row",
    alignItems: "center",
  },

  ratingText: {
    color: "white",
    marginLeft: 5,
  },

  state: {
    color: "#A1A1AA",
    marginTop: 6,
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },

  time: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    color: "white",
    marginLeft: 5,
  },

  badge: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  badgeText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
  },
});
