import { Text, View } from "react-native";

export default function Screen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#0D1117",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 24 }}>Coming Soon</Text>
    </View>
  );
}
