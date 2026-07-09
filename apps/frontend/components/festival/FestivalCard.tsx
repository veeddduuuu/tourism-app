import { View, Image, Text, StyleSheet } from "react-native";

export default function FestivalCard({ item }: any) {
  return (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />

      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>

        <Text style={styles.location}>
          📍 {item.location}
        </Text>

        <Text style={styles.month}>
          {item.month}
        </Text>

        <Text style={styles.description}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 22,
    marginBottom: 20,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 220,
  },

  info: {
    padding: 18,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  location: {
    color: "#0A84FF",
    marginTop: 6,
  },

  month: {
    color: "#666",
    marginTop: 6,
  },

  description: {
    marginTop: 10,
    color: "#555",
  },
});