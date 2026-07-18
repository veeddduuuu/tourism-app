import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";

import FestivalCard from "../../components/festival/FestivalCard";
import { getFestivals, type Festival } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Festivals have no image column, so map known festivals to artwork.
const FESTIVAL_IMAGES: Record<string, string> = {
  Diwali: "https://images.unsplash.com/photo-1604423043493-41305a4a6c68?w=1200",
  Holi: "https://images.unsplash.com/photo-1616844868137-7ffaf43c2d0d?w=1200",
  Onam: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200",
  Navratri: "https://images.unsplash.com/photo-1601181141079-a5d0e6f6f6b0?w=1200",
};
const FESTIVAL_FALLBACK =
  "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200";

// Maps a backend Festival onto the exact shape FestivalCard renders.
function toCard(f: Festival) {
  return {
    id: f.id,
    title: f.name,
    location: f.isNational ? "Pan India" : f.stateName ?? "India",
    month: f.month ? MONTHS[f.month - 1] : "",
    description: f.description ?? "",
    image: { uri: FESTIVAL_IMAGES[f.name] ?? FESTIVAL_FALLBACK },
  };
}

export default function FestivalsScreen() {
  const { data, loading } = useApiQuery(
    (signal) => getFestivals({ limit: 50 }, signal),
    []
  );

  const items = (data?.items ?? []).map(toCard);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <FestivalCard item={item} />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              🎉 Festivals
            </Text>

            <Text style={styles.subheading}>
              Experience India's colourful traditions.
            </Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#0A84FF" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No festivals found.</Text>
          )
        }
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 120,
        }}
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
  },

  subheading: {
    marginTop: 8,
    marginBottom: 25,
    color: "#666",
    fontSize: 16,
  },

  empty: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 15,
  },
});
