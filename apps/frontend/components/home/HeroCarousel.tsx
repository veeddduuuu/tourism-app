import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { MapPin, Star } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    View,
} from "react-native";
import THEME from "../../constants/theme";
import PressableScale from "../common/PressableScale";
import { Skeleton } from "../common/Skeleton";
import { getPlaces, type Place } from "../../services/endpoints";
import { useApiQuery } from "../../hooks/useApiQuery";
import { useAppStore } from "../../stores/appStore";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.9;

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200";

// Maps a backend Place onto the shape the hero slide already renders. `image`
// is an { uri } object so the existing `source={item.image}` markup is unchanged.
function toHero(p: Place) {
  return {
    id: p.id,
    title: p.name,
    location: p.stateName ?? "India",
    rating: p.rating ?? null,
    image: { uri: p.images[0] ?? PLACEHOLDER_IMAGE },
  };
}

export default function HeroCarousel() {
  const flatListRef = useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const destinationState = useAppStore((s: any) => s.destinationState) as
    | string
    | null;

  const { data, loading } = useApiQuery(
    (signal) =>
      getPlaces(
        destinationState ? { state: destinationState, limit: 8 } : { limit: 8 },
        signal
      ),
    [destinationState]
  );
  const items = (data?.items ?? []).map(toHero);

  useEffect(() => {
    if (items.length === 0) return;

    const timer = setInterval(() => {
      let next = activeIndex + 1;

      if (next >= items.length) next = 0;

      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });

      setActiveIndex(next);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex, items.length]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.skeletonWrap}>
        <Skeleton style={styles.skeletonHero} />
      </View>
    );
  }

  return (
    <View>
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        data={items}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);

          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View
            style={{
              width,
              alignItems: "center",
            }}
          >
            <View style={styles.card}>
              <ImageBackground
                source={item.image}
                style={styles.image}
                imageStyle={styles.imageStyle}
              >
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.8)"]}
                  style={styles.gradient}
                />

                <View style={styles.content}>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>Featured</Text>
                    </View>

                    {item.rating != null && (
                      <View style={styles.ratingChip}>
                        <Star color="#FFD43B" fill="#FFD43B" size={13} />
                        <Text style={styles.ratingChipText}>{item.rating}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.title} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.locRow}>
                    <MapPin color="#E4E4E7" size={14} />
                    <Text style={styles.subtitle} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>

                  <PressableScale
                    style={styles.button}
                    onPress={() => router.push(`/destination/${item.id}` as any)}
                  >
                    <Text style={styles.buttonText}>Explore Now →</Text>
                  </PressableScale>
                </View>
              </ImageBackground>
            </View>
          </View>
        )}
      />
      <View style={styles.dots}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 300,

    borderRadius: 25,
    overflow: "hidden",
  },

  image: {
    flex: 1,
    justifyContent: "flex-end",
  },

  imageStyle: {
    borderRadius: 25,
  },

  gradient: {
    ...StyleSheet.absoluteFillObject,
  },

  content: {
    padding: 22,
  },

  badge: {
    backgroundColor: THEME.colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  badgeText: {
    color: "white",
    fontWeight: "700",
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },

  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },

  ratingChipText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },

  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },

  skeletonWrap: {
    alignItems: "center",
    marginTop: 4,
  },

  skeletonHero: {
    width: CARD_WIDTH,
    height: 300,
    borderRadius: 25,
  },

  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "800",
  },

  subtitle: {
    color: "#DDD",
    marginTop: 8,
    fontSize: 15,
  },

  button: {
    marginTop: 20,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    alignSelf: "flex-start",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
  },

  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },

  dot: {
    width: 8,
    height: 8,
    backgroundColor: "#666",
    borderRadius: 10,
    marginHorizontal: 4,
  },

  activeDot: {
    width: 22,
    backgroundColor: THEME.colors.primary,
  },
});
