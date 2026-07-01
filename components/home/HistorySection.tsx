import React from "react";
import { FlatList } from "react-native";

import TimelineCard from "../cards/TimelineCard";
import SectionHeader from "../common/SectionHeader";

import { historyData } from "../../constants/history";

export default function HistorySection() {
  return (
    <>
      <SectionHeader title="Journey Through History" showViewAll />

      <FlatList
        horizontal
        data={historyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TimelineCard item={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
        }}
      />
    </>
  );
}
