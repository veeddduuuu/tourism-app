import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FestivalSection from "../../components/home/FestivalSection";
import HistorySection from "../../components/home/HistorySection";

import AppHeader from "../../components/home/AppHeader";
import FeaturedDestinations from "../../components/home/FeaturedDestinations";
import FeaturedGrid from "../../components/home/FeaturedGrid";
import GlassSearch from "../../components/home/GlassSearch";
import HeroCarousel from "../../components/home/HeroCarousel";
import PopularFoods from "../../components/home/PopularFoods";
import StatsGrid from "../../components/home/StatsGrid";

export default function HomeScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#09090B",
      }}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
      >
        <AppHeader />

        <GlassSearch />

        <HeroCarousel />

        <StatsGrid />

        <FeaturedGrid />

        <FeaturedDestinations />

        <PopularFoods />
        <FestivalSection />
        <HistorySection />
      </ScrollView>
    </SafeAreaView>
  );
}
