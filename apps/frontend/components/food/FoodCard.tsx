import { Image, StyleSheet, Text, View } from "react-native";

export default function FoodCard({ item }: any) {
  return (
    <View style={styles.card}>
      <Image
        source={item.image}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.title}>
          {item.name}
        </Text>

        <Text style={styles.category}>
          {item.category}
        </Text>

        <Text style={styles.description}>
          {item.description}
        </Text>

        <View style={styles.bottom}>
          <Text style={styles.rating}>
            ⭐ {item.rating}
          </Text>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              Popular
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 22,
    elevation: 5,
  },

  image: {
    width: "100%",
    height: 210,
  },

  info: {
    padding: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  category: {
    color: "#0A84FF",
    marginTop: 4,
    fontWeight: "600",
  },

  description: {
    marginTop: 10,
    color: "#666",
    lineHeight: 22,
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  rating: {
    fontWeight: "700",
    fontSize: 16,
  },

  badge: {
    backgroundColor: "#EAF7FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
  },

  badgeText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});