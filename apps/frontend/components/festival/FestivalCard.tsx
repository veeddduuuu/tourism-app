import { View, Image, Text, StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

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

        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    marginBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  image: {
    width: "100%",
    height: 220,
  },

  info: {
    padding: 18,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
  },

  location: {
    color: COLORS.saffron,
    marginTop: 6,
    fontWeight: "700",
    fontSize: 12,
  },

  month: {
    color: COLORS.subtitle,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
  },

  description: {
    marginTop: 10,
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 20,
  },
});