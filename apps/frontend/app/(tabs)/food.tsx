import React from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import FoodCard from "../../components/food/FoodCard";
import { getFoods, type Food } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAppStore } from "../../stores/appStore";
import COLORS from "../../constants/colors";

// Foods have no image/rating column yet, so fill those gaps for the card.
const FALLBACK_IMAGE = {
  uri: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1200",
};

// Maps a backend Food onto the exact shape FoodCard renders.
function toCard(f: Food) {
  return {
    id: f.id,
    name: f.name,
    image: f.imageUrl ? { uri: f.imageUrl } : FALLBACK_IMAGE,
    category: f.category ?? "",
    rating: "4.7",
    description: f.description ?? "",
  };
}

export default function FoodScreen() {
  const destinationState = useAppStore((s: any) => s.destinationState) as
    | string
    | null;

  const { data, loading } = useApiQuery(
    (signal) =>
      getFoods(destinationState ? { state: destinationState } : {}, signal),
    [destinationState]
  );

  const items = (data?.items ?? []).map(toCard);
  const place = destinationState ?? "India";

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, "#131F37", "#0B1326"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={
            <>
              <Text style={styles.heading}>
                🍛 Local Cuisine
              </Text>

              <Text style={styles.subheading}>
                Taste the authentic flavours of {place}.
              </Text>

              <TextInput
                placeholder="Search dishes..."
                placeholderTextColor={COLORS.muted}
                style={styles.search}
              />

              <View style={styles.categories}>
                <View style={[styles.category, styles.activeCategory]}>
                  <Text style={[styles.categoryText, styles.activeCategoryText]}>Street Food</Text>
                </View>

                <View style={styles.category}>
                  <Text style={styles.categoryText}>Desserts</Text>
                </View>

                <View style={styles.category}>
                  <Text style={styles.categoryText}>Veg</Text>
                </View>

                <View style={styles.category}>
                  <Text style={styles.categoryText}>Non-Veg</Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <FoodCard item={item} />
          )}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator color={COLORS.saffron} style={{ marginTop: 40 }} />
            ) : (
              <Text style={styles.empty}>No dishes found for {place} yet.</Text>
            )
          }
          contentContainerStyle={{
            padding: 20,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1326",
  },

  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 10,
  },

  subheading: {
    marginTop: 6,
    color: COLORS.subtitle,
    fontSize: 14,
    marginBottom: 20,
  },

  search: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 18,
    padding: 16,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginBottom: 20,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
  },

  category: {
    backgroundColor: "#131F37",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },

  activeCategory: {
    backgroundColor: COLORS.saffron,
    borderColor: COLORS.saffron,
  },

  categoryText: {
    fontWeight: "700",
    fontSize: 12,
    color: COLORS.subtitle,
  },

  activeCategoryText: {
    color: "#000",
  },

  empty: {
    textAlign: "center",
    color: COLORS.subtitle,
    marginTop: 40,
    fontSize: 14,
  },
});
