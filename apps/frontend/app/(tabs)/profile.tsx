import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
} from "react-native";

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>

      <Image
        source={{
          uri: "https://i.pravatar.cc/250",
        }}
        style={styles.avatar}
      />

      <Text style={styles.name}>
        Explorer
      </Text>

      <Text style={styles.email}>
        explore@tourism.ai
      </Text>

      <View style={styles.card}>
        <Text style={styles.item}>❤️ Saved Places</Text>
        <Text style={styles.item}>🧳 My Trips</Text>
        <Text style={styles.item}>🌎 Language</Text>
        <Text style={styles.item}>🔔 Notifications</Text>
        <Text style={styles.item}>⚙ Settings</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    alignItems: "center",
    paddingTop: 40,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  name: {
    fontSize: 30,
    fontWeight: "800",
    marginTop: 20,
  },

  email: {
    color: "#666",
    marginBottom: 30,
  },

  card: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 22,
    padding: 20,
  },

  item: {
    fontSize: 18,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});