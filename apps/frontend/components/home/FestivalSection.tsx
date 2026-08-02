import React from "react";
import { FlatList } from "react-native";

import FestivalCard from "../cards/FestivalCard";
import SectionHeader from "../common/SectionHeader";

import { getFestivals, type Festival } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";
import { CardSkeletonRow } from "../common/Skeleton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const FESTIVAL_IMAGES: Record<string, string> = {
  Diwali: "https://images.unsplash.com/photo-1604423043493-41305a4a6c68?w=1200",
  Holi: "https://images.unsplash.com/photo-1616844868137-7ffaf43c2d0d?w=1200",
  Onam: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=1200",
  Navratri: "https://images.unsplash.com/photo-1601181141079-a5d0e6f6f6b0?w=1200",
};
const FESTIVAL_FALLBACK =
  "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200";

// Maps a backend Festival onto the shape the home FestivalCard renders.
function toCard(f: Festival) {
  return {
    id: f.id,
    name: f.name,
    state: f.isNational ? "Pan India" : f.stateName ?? "India",
    month: f.month ? MONTHS[f.month - 1] : "",
    date: "",
    image: FESTIVAL_IMAGES[f.name] ?? FESTIVAL_FALLBACK,
  };
}

export default function FestivalSection() {
  const { data, loading } = useApiQuery(
    (signal) => getFestivals({ limit: 20 }, signal),
    []
  );
  const items = (data?.items ?? []).map(toCard);

  return (
    <>
      <SectionHeader title="Upcoming Festivals" showViewAll />

      {loading && items.length === 0 ? (
        <CardSkeletonRow width={290} height={200} radius={24} />
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <FestivalCard item={item} />}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
          }}
        />
      )}
    </>
  );
}
