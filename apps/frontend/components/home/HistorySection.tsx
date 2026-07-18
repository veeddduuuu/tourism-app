import React from "react";
import { FlatList } from "react-native";

import TimelineCard from "../cards/TimelineCard";
import SectionHeader from "../common/SectionHeader";

import { getHistory, type HistoryEntry } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";

function formatYear(year: number | null): string {
  if (year == null) return "";
  return year < 0 ? `${Math.abs(year)} BCE` : `${year}`;
}

// Maps a backend HistoryEntry onto the shape the home TimelineCard renders.
function toCard(h: HistoryEntry) {
  return {
    id: h.id,
    year: formatYear(h.year),
    title: h.eventTitle,
    description: h.description ?? "",
  };
}

export default function HistorySection() {
  const { data } = useApiQuery(
    (signal) => getHistory({ limit: 20 }, signal),
    []
  );
  const items = (data?.items ?? []).map(toCard);

  return (
    <>
      <SectionHeader title="Journey Through History" showViewAll />

      <FlatList
        horizontal
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <TimelineCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
