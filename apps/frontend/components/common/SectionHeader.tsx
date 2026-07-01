import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import COLORS from "../../constants/colors";

interface Props {
  title: string;
  highlight?: string;
  showViewAll?: boolean;
  subtitle?: string;
  onPress?: () => void;
}

export default function SectionHeader({
  title,
  highlight,
  showViewAll = false,
  subtitle = "View All",
  onPress,
}: Props) {
  const renderTitle = () => {
    if (!highlight) {
      return <Text style={styles.title}>{title}</Text>;
    }

    const parts = title.split(highlight);

    return (
      <Text style={styles.title}>
        {parts[0]}
        <Text style={styles.highlight}>{highlight}</Text>
        {parts[1]}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {renderTitle()}

      {showViewAll && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.viewAll}>{subtitle}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
  },

  highlight: {
    color: COLORS.primary,
  },

  viewAll: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "600",
  },
});
