import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

import HistoryCard from "../../components/history/HistoryCard";
import { getHistory, type HistoryEntry } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";
import COLORS from "../../constants/colors";

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
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, "#131F37", "#0B1326"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
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
              <ActivityIndicator color={COLORS.saffron} style={{ marginTop: 40 }} />
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
  },

  subheading: {
    marginTop: 6,
    marginBottom: 25,
    color: COLORS.subtitle,
    fontSize: 14,
  },

  empty: {
    textAlign: "center",
    color: COLORS.subtitle,
    marginTop: 40,
    fontSize: 14,
  },
});
