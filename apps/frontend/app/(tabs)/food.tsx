import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import FoodCard from "../../components/food/FoodCard";
import { foodData } from "../../data/food";

export default function FoodScreen() {
  console.log(foodData);
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={foodData}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <Text style={styles.heading}>
              🍛 Local Cuisine
            </Text>

            <Text style={styles.subheading}>
              Taste the authentic flavours of Maharashtra.
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
});