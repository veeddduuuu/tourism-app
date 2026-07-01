import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Heart, MapPin, Star } from "lucide-react-native";

import COLORS from "../../constants/colors";

interface Props {
  item: any;
}

export default function DestinationCard({ item }: Props) {
  return (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <TouchableOpacity style={styles.heart}>
        <Heart color="white" size={18} />
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.row}>
          <MapPin color={COLORS.primary} size={14} />

          <Text style={styles.state}>{item.state}</Text>
        </View>

        <View style={styles.bottom}>
          <View style={styles.rating}>
            <Star color="#FFD43B" fill="#FFD43B" size={14} />

            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>

          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 250,
    backgroundColor: "#18181B",
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 18,
  },

  image: {
    width: "100%",
    height: 180,
  },

  heart: {
    position: "absolute",
    top: 15,
    right: 15,
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
    marginTop: 15,
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
    fontWeight: "600",
  },

  price: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
