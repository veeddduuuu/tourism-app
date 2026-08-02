import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Heart, MapPin, Star } from "lucide-react-native";

import COLORS from "../../constants/colors";
import PressableScale from "../common/PressableScale";

interface Props {
  item: any;
}

export default function DestinationCard({ item }: Props) {
  return (
    <PressableScale
      style={styles.card}
      onPress={() => router.push(`/destination/${item.id}`)}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />

        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.35)"]}
          style={styles.imageScrim}
        />

        <TouchableOpacity style={styles.heart} activeOpacity={0.8}>
          <Heart color="white" size={18} />
        </TouchableOpacity>

        <View style={styles.ratingBadge}>
          <Star color={COLORS.saffron} fill={COLORS.saffron} size={13} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        <View style={styles.row}>
          <MapPin color={COLORS.primary} size={14} />
          <Text style={styles.state}>{item.state}</Text>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: COLORS.card,
    borderRadius: 24,
    marginRight: 18,
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

  imageScrim: {
    ...StyleSheet.absoluteFillObject,
  },

  heart: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(11, 19, 38, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  ratingBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 19, 38, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(255, 153, 51, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  ratingText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "700",
    fontSize: 12,
  },

  info: {
    padding: 16,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  state: {
    color: COLORS.subtitle,
    marginLeft: 5,
    fontSize: 13,
  },

  bottom: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    color: COLORS.saffron,
    fontWeight: "800",
    fontSize: 16,
  },
});
