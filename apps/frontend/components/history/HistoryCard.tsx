import { Image, StyleSheet, Text, View } from "react-native";
import COLORS from "../../constants/colors";

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
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 22,
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
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.text,
  },

  year: {
    color: COLORS.saffron,
    marginTop: 6,
    fontWeight: "700",
    fontSize: 12,
  },

  description: {
    marginTop: 10,
    color: COLORS.subtitle,
    fontSize: 13,
    lineHeight: 20,
  },
});