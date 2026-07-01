import { useLocalSearchParams } from "expo-router";
import React from "react";
import { SafeAreaView, StyleSheet, Text } from "react-native";

export default function DestinationDetails() {
  const { id } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Destination ID:</Text>

      <Text style={styles.id}>{id}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#09090B",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },

  id: {
    marginTop: 15,
    color: "#FF6B35",
    fontSize: 32,
    fontWeight: "800",
  },
});
