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

  const place = address[0] ?? {};

  return {
    city: place.city || "Delhi",
    country: place.country || "India",
  };
}