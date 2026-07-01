import React from "react";
import { FlatList } from "react-native";

import { foods } from "../../constants/foods";
import FoodCard from "../cards/FoodCard";
import SectionHeader from "../common/SectionHeader";

export default function PopularFoods() {
  return (
    <>
      <SectionHeader title="Popular Foods" showViewAll />

      <FlatList
        horizontal
        data={foods}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FoodCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
