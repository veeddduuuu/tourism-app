import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StoryCard from "../../components/story/StoryCard";
import AppHeader from "../../components/home/AppHeader";
import GlassSearch from "../../components/home/GlassSearch";
import HeroCarousel from "../../components/home/HeroCarousel";
import StatsGrid from "../../components/home/StatsGrid";
import FeaturedGrid from "../../components/home/FeaturedGrid";
import FeaturedDestinations from "../../components/home/FeaturedDestinations";
import PopularFoods from "../../components/home/PopularFoods";
import FestivalSection from "../../components/home/FestivalSection";
import HistorySection from "../../components/home/HistorySection";

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
        <StoryCard />
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