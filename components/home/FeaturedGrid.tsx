import React from "react";
import { StyleSheet, View } from "react-native";

import { FEATURES } from "../../constants/homeData";
import FeatureCard from "../cards/FeatureCard";

export default function FeaturedGrid() {
  return (
    <View style={styles.container}>
      {FEATURES.map((item) => (
        <FeatureCard
          key={item.id}
          title={item.title}
          subtitle={item.subtitle}
          Icon={item.icon}
          color={item.color}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
