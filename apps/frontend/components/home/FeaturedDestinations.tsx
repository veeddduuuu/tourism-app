import React from "react";
import { FlatList } from "react-native";

import DestinationCard from "../cards/DestinationCard";
import SectionHeader from "../common/SectionHeader";

import { getPlaces, type Place } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";

// Fallback artwork if a place has no image, matching the previous behaviour.
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200";

// Maps a backend Place onto the exact shape DestinationCard already expects,
// so the design/markup stays identical — only the data source changes.
function toCard(p: Place) {
  return {
    id: p.id,
    title: p.name,
    state: p.stateName ?? "India",
    rating: p.rating ?? 0,
    price: p.entryFee == null ? "" : p.entryFee === 0 ? "Free" : `₹${p.entryFee}`,
    image: p.images[0] ?? PLACEHOLDER_IMAGE,
  };
}

export default function FeaturedDestinations() {
  const { data } = useApiQuery(
    (signal) => getPlaces({ limit: 20 }, signal),
    []
  );

  const items = (data?.items ?? []).map(toCard);

  return (
    <>
      <SectionHeader title="Featured Destinations" />

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <DestinationCard item={item} />}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
