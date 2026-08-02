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
          colors={["transparent", "rgba(11,19,38,0.45)"]}
          style={StyleSheet.absoluteFillObject}
        />

        <TouchableOpacity style={styles.heart} activeOpacity={0.8}>
          <Heart color="white" size={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.ratingRow}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

          <View style={styles.rating}>
            <Star fill={COLORS.saffron} color={COLORS.saffron} size={14} />

            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.state}>{item.state}</Text>

        <View style={styles.bottom}>
          <View style={styles.time}>
            <Clock3 color={COLORS.saffron} size={14} />

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
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },

  imageWrap: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 170,
  },

  heart: {
    position: "absolute",
    right: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(11, 19, 38, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  content: {
    padding: 16,
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
    fontWeight: "700",
  },

  state: {
    color: COLORS.subtitle,
    marginTop: 6,
    fontSize: 13,
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  time: {
    flexDirection: "row",
    alignItems: "center",
  },

  timeText: {
    color: "white",
    marginLeft: 5,
    fontSize: 13,
  },

  badge: {
    backgroundColor: COLORS.saffron,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },

  badgeText: {
    color: "#0B1326",
    fontWeight: "800",
    fontSize: 11,
  },
});
