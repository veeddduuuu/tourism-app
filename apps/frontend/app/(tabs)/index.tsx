import React from "react";
import { ScrollView, ImageBackground, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import StoryCard from "../../components/story/StoryCard";
import PassportWidget from "../../components/home/PassportWidget";
import AppHeader from "../../components/home/AppHeader";
import GlassSearch from "../../components/home/GlassSearch";
import HeroCarousel from "../../components/home/HeroCarousel";
import VirtualFestivalSection from "../../components/home/VirtualFestivalSection";
import FeaturedDestinations from "../../components/home/FeaturedDestinations";
import PopularFoods from "../../components/home/PopularFoods";
import FestivalSection from "../../components/home/FestivalSection";
import HistorySection from "../../components/home/HistorySection";
import TryOnSection from "../../components/home/TryOnSection";
import FeaturedGrid from "../../components/home/FeaturedGrid";

// Each section fades + slides up in sequence for a smooth, staggered reveal.
const sections = [
  AppHeader,
  GlassSearch,
  StoryCard, // High-Impact AI Storytelling Hero
  PassportWidget, // Interactive Cultural Passport progress widget
  HeroCarousel,
  VirtualFestivalSection, // Interactive 360° Portal trigger section
  FeaturedDestinations,
  PopularFoods,
  FestivalSection,
  HistorySection,
  TryOnSection, // High-Impact Purple Virtual Try-On
];

export default function HomeScreen() {
  return (
    <ImageBackground
      source={require("../../assets/images/home-bg.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={["rgba(11,19,38,0.65)", "rgba(11,19,38,0.90)", "rgba(11,19,38,0.98)"]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sections.map((Section, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 70)
                .duration(500)
                .springify()
                .damping(18)}
            >
              <Section />
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#0B1326",
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 130,
  },
});
