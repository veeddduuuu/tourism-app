import React from "react";
import { FlatList } from "react-native";

import DestinationCard from "../cards/DestinationCard";
import SectionHeader from "../common/SectionHeader";

import { destinations } from "../../constants/destinations";

export default function FeaturedDestinations() {
  return (
    <>
      <SectionHeader title="Featured Destinations" />

      <FlatList
        horizontal
        data={destinations}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <DestinationCard item={item} />}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
