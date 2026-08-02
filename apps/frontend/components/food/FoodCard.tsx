import { Image, StyleSheet, Text, View } from "react-native";
import COLORS from "../../constants/colors";

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
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
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
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  category: {
    color: COLORS.saffron,
    marginTop: 4,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
  },

  description: {
    marginTop: 10,
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 20,
  },

  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
  },

  rating: {
    fontWeight: "800",
    fontSize: 15,
    color: COLORS.text,
  },

  badge: {
    backgroundColor: "rgba(255, 153, 51, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },

  badgeText: {
    color: COLORS.saffron,
    fontWeight: "700",
    fontSize: 11,
  },
});