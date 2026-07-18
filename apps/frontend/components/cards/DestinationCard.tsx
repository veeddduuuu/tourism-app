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
          <Star color="#FFD43B" fill="#FFD43B" size={13} />
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
    backgroundColor: "#18181B",
    borderRadius: 22,
    marginRight: 18,
    borderWidth: 1,
    borderColor: "#27272A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },

  imageWrap: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 180,
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
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },

  ratingBadge: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
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
    padding: 15,
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
    color: "#A1A1AA",
    marginLeft: 5,
  },

  bottom: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  price: {
    color: COLORS.primary,
    fontWeight: "800",
    fontSize: 16,
  },
});
