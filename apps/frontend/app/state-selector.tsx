import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import FloatingIndia from "../components/map/IndiaMap";

const states = [
  { name: "Jammu & Kashmir", left: 33, top: 6, width: 18, height: 18 },
  { name: "Punjab", left: 31, top: 16, width: 18, height: 18 },
  { name: "Delhi", left: 43, top: 23, width: 14, height: 14 },
  { name: "Rajasthan", left: 23, top: 24, width: 28, height: 28 },
  { name: "Gujarat", left: 13, top: 39, width: 24, height: 24 },
  { name: "Madhya Pradesh", left: 38, top: 39, width: 26, height: 22 },
  { name: "Uttar Pradesh", left: 49, top: 29, width: 28, height: 18 },
  { name: "Maharashtra", left: 28, top: 53, width: 28, height: 24 },
  { name: "Goa", left: 28, top: 67, width: 14, height: 14 },
  { name: "Karnataka", left: 33, top: 68, width: 24, height: 24 },
  { name: "Kerala", left: 37, top: 84, width: 14, height: 18 },
  { name: "Tamil Nadu", left: 46, top: 83, width: 18, height: 18 },
  { name: "Telangana", left: 50, top: 59, width: 18, height: 18 },
  { name: "Andhra Pradesh", left: 55, top: 69, width: 22, height: 24 },
  { name: "Odisha", left: 60, top: 54, width: 18, height: 18 },
  { name: "West Bengal", left: 69, top: 42, width: 18, height: 20 },
  { name: "Assam", left: 81, top: 35, width: 22, height: 18 },
];

export default function StateSelector() {
  const [selectedState, setSelectedState] = useState("");

  const greetings: Record<string, string> = {
    Kerala: "🌴 Namaskaram!",
    Goa: "🏖️ Welcome!",
    Karnataka: "🌸 Namaskara!",
    "Tamil Nadu": "🙏 Vanakkam!",
    Gujarat: "🙏 Kem Cho!",
    Rajasthan: "🐪 Khamma Ghani!",
    Maharashtra: "🙏 Namaskar!",
    Delhi: "❤️ Welcome!",
    Assam: "🌿 Namaskar!",
    Punjab: "🪯 Sat Sri Akal!",
    "Jammu & Kashmir": "🏔️ Aadab!",
    "Madhya Pradesh": "🙏 Namaste!",
    "Uttar Pradesh": "🙏 Namaste!",
    Telangana: "🙏 Namaskaram!",
    "Andhra Pradesh": "🙏 Namaskaram!",
    Odisha: "🙏 Namaskar!",
    "West Bengal": "🙏 Nomoshkar!",
  };

  return (
    <LinearGradient
      colors={["#05152D", "#0A2E5C", "#2F6FB5"]}
      style={styles.container}
    >
      <Text style={styles.heading}>Choose Your Journey</Text>

      <View style={styles.mapContainer}>
        <FloatingIndia />

        {states.map((state) => (
          <Pressable
            key={state.name}
            onPress={() => setSelectedState(state.name)}
            style={[
              styles.touch,
              {
                left: `${state.left}%`,
                top: `${state.top}%`,
                width: state.width,
                height: state.height,
                borderRadius: state.width / 2,
                backgroundColor:
                  selectedState === state.name
                    ? "rgba(0,180,255,0.55)"
                    : "transparent",
              },
            ]}
          />
        ))}
      </View>

      {selectedState !== "" && (
        <View style={styles.card}>
          <Text style={styles.state}>{selectedState}</Text>

          <Text style={styles.greeting}>
            {greetings[selectedState] ?? "🙏 Welcome!"}
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text style={styles.buttonText}>
              Explore {selectedState}
            </Text>
          </Pressable>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },

  heading: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "800",
    marginTop: 70,
    marginBottom: 20,
  },

  mapContainer: {
    width: 300,
    height: 360,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },

  touch: {
    position: "absolute",
  },

  card: {
    width: "90%",
    marginTop: 45,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 25,
    padding: 22,
    alignItems: "center",
  },

  state: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
  },

  greeting: {
    color: "#DCEEFF",
    fontSize: 20,
    marginTop: 12,
  },

  button: {
    marginTop: 24,
    backgroundColor: "#00B8FF",
    paddingHorizontal: 38,
    paddingVertical: 15,
    borderRadius: 35,
  },

  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});