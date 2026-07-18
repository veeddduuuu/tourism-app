import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Search, SlidersHorizontal } from "lucide-react-native";

export default function GlassSearch() {
  return (
    <View style={styles.container}>
      <Search color="#A1A1AA" size={20} />

      <TextInput
        placeholder="Search destinations, food, festivals..."
        placeholderTextColor="#A1A1AA"
        style={styles.input}
      />

      <View style={styles.filter}>
        <SlidersHorizontal color="white" size={18} />
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
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 18,
    paddingLeft: 18,
    paddingRight: 8,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  input: {
    marginLeft: 12,
    flex: 1,
    color: "white",
    fontSize: 16,
  },

  filter: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
  },
});
