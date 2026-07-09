import React from "react";
import {
  SafeAreaView,
  FlatList,
  Text,
  StyleSheet,
} from "react-native";

import FestivalCard from "../../components/festival/FestivalCard";
import { festivalData } from "../../data/festivals";

export default function FestivalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={festivalData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FestivalCard item={item} />
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              🎉 Festivals
            </Text>

            <Text style={styles.subheading}>
              Experience Maharashtra's colourful traditions.
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