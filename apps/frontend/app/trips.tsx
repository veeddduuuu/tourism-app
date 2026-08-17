import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import PressableScale from "../components/common/PressableScale";
import { useApiQuery } from "../hooks/useApiQuery";
import { getTripHistory } from "../services/endpoints";
import { useAppStore } from "../stores/appStore";
import { useAppAuth } from "../providers/authContext";

export default function TripsScreen() {
  const { isSignedIn, isLoaded } = useAppAuth();
  const setSavedPlan = useAppStore((s) => s.setSavedPlan);

  const { data, loading, error, refetch } = useApiQuery(
    (signal) => getTripHistory(1, 30, signal),
    [isSignedIn]
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <PressableScale onPress={() => router.back()}>
          <Text style={styles.back}>‹ Back</Text>
        </PressableScale>
        <Text style={styles.title}>My trips</Text>
        <Text style={styles.sub}>
          Plans saved when you are signed in and generate an itinerary.
        </Text>
      </View>

      {!isLoaded || loading ? (
        <ActivityIndicator color="#E8B45C" style={{ marginTop: 40 }} />
      ) : !isSignedIn ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Sign in to see saved trips</Text>
          <PressableScale
            style={styles.cta}
            onPress={() => router.push("/(auth)/login" as any)}
          >
            <Text style={styles.ctaText}>Sign in</Text>
          </PressableScale>
        </View>
      ) : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{error.message}</Text>
          <PressableScale style={styles.cta} onPress={refetch}>
            <Text style={styles.ctaText}>Retry</Text>
          </PressableScale>
        </View>
      ) : !data?.data.length ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No saved trips yet</Text>
          <Text style={styles.emptySub}>
            Plan a trip while signed in and it will show up here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {data.data.map((trip) => {
            const plan = trip.generatedItinerary;
            const destination =
              plan?.destination ??
              (trip.preferences &&
              typeof trip.preferences === "object" &&
              "destination" in trip.preferences
                ? String(
                    (trip.preferences as { destination?: string }).destination ??
                      "Trip"
                  )
                : "Trip");
            const when = trip.createdAt
              ? new Date(trip.createdAt).toLocaleDateString()
              : "";

            return (
              <PressableScale
                key={trip.id}
                style={styles.card}
                onPress={() => {
                  if (!plan) return;
                  setSavedPlan(plan);
                  router.push("/itinerary" as any);
                }}
              >
                <Text style={styles.cardTitle}>{destination}</Text>
                <Text style={styles.cardMeta}>
                  {[when, trip.duration ? `${trip.duration} days` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </PressableScale>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#09090B" },
  header: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 8 },
  back: { color: "#E8B45C", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  title: { color: "#F8FAFC", fontSize: 28, fontWeight: "800" },
  sub: { color: "#A1A1AA", marginTop: 8, fontSize: 14, lineHeight: 20 },
  list: { padding: 22, paddingBottom: 80, gap: 12 },
  card: {
    backgroundColor: "#18181B",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#27272A",
  },
  cardTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "700" },
  cardMeta: { color: "#A1A1AA", marginTop: 6 },
  empty: { padding: 32, alignItems: "center" },
  emptyTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptySub: {
    color: "#A1A1AA",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  cta: {
    marginTop: 18,
    backgroundColor: "#E8B45C",
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  ctaText: { color: "#3A2708", fontWeight: "800" },
});
