import React from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";

import HistoryCard from "../../components/history/HistoryCard";
import { historyData } from "../../data/history";

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HistoryCard item={item} />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              📜 History
            </Text>

            <Text style={styles.subheading}>
              Explore Maharashtra's glorious past.
            </Text>
          </>
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
});