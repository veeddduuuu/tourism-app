import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";

import HistoryCard from "../../components/history/HistoryCard";
import { getHistory, type HistoryEntry } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";

// History entries rarely carry media, so fall back to a heritage image.
const HISTORY_FALLBACK =
  "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200";

function formatYear(year: number | null): string {
  if (year == null) return "";
  return year < 0 ? `${Math.abs(year)} BCE` : `${year}`;
}

// Maps a backend HistoryEntry onto the exact shape HistoryCard renders.
function toCard(h: HistoryEntry) {
  return {
    id: h.id,
    title: h.eventTitle,
    year: formatYear(h.year),
    description: h.description ?? "",
    image: { uri: h.mediaUrl ?? HISTORY_FALLBACK },
  };
}

export default function HistoryScreen() {
  const { data, loading } = useApiQuery(
    (signal) => getHistory({ limit: 50 }, signal),
    []
  );

  const items = (data?.items ?? []).map(toCard);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <HistoryCard item={item} />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              📜 History
            </Text>

            <Text style={styles.subheading}>
              Explore India's glorious past.
            </Text>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#007AFF" style={{ marginTop: 40 }} />
          ) : (
            <Text style={styles.empty}>No history entries found.</Text>
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
