import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppAuthProvider } from "../providers/AuthProvider";

export default function RootLayout() {
  return (
    <AppAuthProvider>
      <Stack
        initialRouteName="welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="sso-callback" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="guide-selector" />
        <Stack.Screen name="state-selector" />
        <Stack.Screen name="trip-preferences" />
        <Stack.Screen name="itinerary" />
        <Stack.Screen name="story" />
        <Stack.Screen name="trips" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <StatusBar style="light" />
    </AppAuthProvider>
  );
}