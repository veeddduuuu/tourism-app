import React from "react";
import {
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Props {
  item: any;
}

export default function FestivalCard({ item }: Props) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.image}
        imageStyle={{ borderRadius: 24 }}
      >
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    height: 200,
    marginRight: 18,
    borderRadius: 24,
    overflow: "hidden",
  },

  image: {
    flex: 1,
    justifyContent: "flex-end",
  },

  overlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.35)",
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
