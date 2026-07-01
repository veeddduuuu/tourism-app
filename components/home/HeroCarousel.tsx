import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
    Dimensions,
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { HERO_DATA } from "../../constants/heroData";
import THEME from "../../constants/theme";

const { width } = Dimensions.get("window");

const CARD_WIDTH = width * 0.9;

export default function HeroCarousel() {
  const flatListRef = useRef<FlatList>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      let next = activeIndex + 1;

      if (next >= HERO_DATA.length) next = 0;

      flatListRef.current?.scrollToIndex({
        index: next,
        animated: true,
      });

      setActiveIndex(next);
    }, 4000);

    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <View>
      <FlatList
        ref={flatListRef}
        horizontal
        pagingEnabled
        decelerationRate="fast"
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        data={HERO_DATA}
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
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Featured</Text>
                  </View>

                  <Text style={styles.title}>{item.title}</Text>

                  <Text style={styles.subtitle}>{item.subtitle}</Text>

                  <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Explore Now →</Text>
                  </TouchableOpacity>
                </View>
              </ImageBackground>
            </View>
          </View>
        )}
      />
      <View style={styles.dots}>
        {HERO_DATA.map((_, index) => (
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
    marginBottom: 12,
  },

  badgeText: {
    color: "white",
    fontWeight: "700",
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
