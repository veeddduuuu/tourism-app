import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Search, SlidersHorizontal } from "lucide-react-native";
import COLORS from "../../constants/colors";

export default function GlassSearch() {
  return (
    <View style={styles.container}>
      <Search color={COLORS.subtitle} size={20} />

      <TextInput
        placeholder="Search destinations, food, festivals..."
        placeholderTextColor={COLORS.subtitle}
        style={styles.input}
      />

      <View style={styles.filter}>
        <SlidersHorizontal color="#0B1326" size={18} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(19, 31, 55, 0.75)",
    borderRadius: 20,
    paddingLeft: 18,
    paddingRight: 8,
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },

  input: {
    marginLeft: 12,
    flex: 1,
    color: "white",
    fontSize: 15,
  },

  filter: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.saffron,
    justifyContent: "center",
    alignItems: "center",
  },
});
