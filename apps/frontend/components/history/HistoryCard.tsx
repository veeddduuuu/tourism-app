import { Image, StyleSheet, Text, View } from "react-native";

export default function HistoryCard({ item }: any) {
  return (
    <View style={styles.card}>
      <Image
        source={item.image}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.title}>
          {item.title}
        </Text>

        <Text style={styles.year}>
          {item.year}
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
    overflow: "hidden",
    marginBottom: 22,
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

  year: {
    color: "#007AFF",
    marginTop: 6,
  },

  description: {
    marginTop: 10,
    color: "#555",
  },
});