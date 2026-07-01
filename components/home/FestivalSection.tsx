import React from "react";
import { FlatList } from "react-native";

import FestivalCard from "../cards/FestivalCard";
import SectionHeader from "../common/SectionHeader";

import { festivals } from "../../constants/festivals";

export default function FestivalSection() {
  return (
    <>
      <SectionHeader title="Upcoming Festivals" showViewAll />

      <FlatList
        horizontal
        data={festivals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FestivalCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
