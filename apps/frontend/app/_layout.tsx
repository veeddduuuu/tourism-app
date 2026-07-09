import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <Stack
        initialRouteName="welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="welcome" />
        <Stack.Screen name="state-selector" />
        <Stack.Screen name="story" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      

      <StatusBar style="light" />
    </>
  );
}