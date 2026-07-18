import React from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import FoodCard from "../../components/food/FoodCard";
import { getFoods, type Food } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAppStore } from "../../stores/appStore";

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
    <SafeAreaView style={styles.container}>
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
              placeholderTextColor="#999"
              style={styles.search}
            />

            <View style={styles.categories}>
              <View style={styles.category}>
                <Text style={styles.categoryText}>Street Food</Text>
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
            <ActivityIndicator color="#0A84FF" style={{ marginTop: 40 }} />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  heading: {
    fontSize: 34,
    fontWeight: "800",
    marginTop: 10,
  },

  subheading: {
    marginTop: 6,
    color: "#666",
    fontSize: 16,
    marginBottom: 20,
  },

  search: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },

  categories: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 25,
  },

  category: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  categoryText: {
    fontWeight: "600",
  },

  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 15,
  },
});
