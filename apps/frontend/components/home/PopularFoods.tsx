import React from "react";
import { FlatList } from "react-native";

import FoodCard from "../cards/FoodCard";
import SectionHeader from "../common/SectionHeader";

import { getFoods, type Food } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200";

// Maps a backend Food onto the shape the home FoodCard renders.
function toCard(f: Food) {
  return {
    id: f.id,
    title: f.name,
    state: f.stateName ?? "India",
    rating: 4.8, // no rating column on traditional_foods yet
    duration: f.prepTime ? `${f.prepTime} mins` : "",
    difficulty: f.difficulty ?? "Easy",
    image: f.imageUrl ?? PLACEHOLDER_IMAGE,
  };
}

export default function PopularFoods() {
  const { data } = useApiQuery((signal) => getFoods({ limit: 20 }, signal), []);
  const items = (data?.items ?? []).map(toCard);

  return (
    <>
      <SectionHeader title="Popular Foods" showViewAll />

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <FoodCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
