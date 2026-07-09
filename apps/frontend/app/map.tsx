import { StyleSheet, View } from "react-native";
import IndiaMap from "../components/map/IndiaMap";

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <IndiaMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});