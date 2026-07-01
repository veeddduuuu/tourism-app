import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function GlassSearch() {
  return (
    <View style={styles.container}>
      <Text style={{ color: "white", fontSize: 18 }}>🔍</Text>

      <TextInput
        placeholder="Search destinations, food, festivals..."
        placeholderTextColor="#A1A1AA"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    paddingHorizontal: 18,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  input: {
    marginLeft: 10,
    flex: 1,
    color: "white",
    fontSize: 16,
  },
});
