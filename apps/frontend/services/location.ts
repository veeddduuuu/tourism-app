import * as Location from "expo-location";

export async function getUserLocation() {
  const { status } =
    await Location.requestForegroundPermissionsAsync();

  if (status !== "granted") {
    return {
      city: "Delhi",
      country: "India",
    };
  }

  const location =
    await Location.getCurrentPositionAsync({});

  const address =
    await Location.reverseGeocodeAsync(location.coords);

  return {
    city: address[0].city || "Delhi",
    country: address[0].country || "India",
  };
}